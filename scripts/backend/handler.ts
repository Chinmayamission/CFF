'use strict';
/*
 * ts-node scripts/backend/handler.ts

"dataOptions": {
  "export": [
    {
      {
        "type": "google_sheets",
        "spreadsheetId": "123456",
        "viewsToShow": ["participants"],
        "filter": {"paid": true}, // todo - move "filter" to within a dataOptionView
        "enableOrderId": true,
        "enableNearestLocation": true,
        "nearestLocationOptions": {
          "locations": [
            {
              "latitude": 33,
              "longitude": -84,
              "name": "Test1"
            },
            {
              "latitude": 37,
              "longitude": -122,
              "name": "Test2"
            }
          ]
        }
      }
    }
  ],
  "views": [
    {
      "id": "aggregate",
      "displayName": "Aggregate",
      "aggregate": [
        {"|group": {"_id": "$paid", "count": {"|sum": 1} } }
      ]
    }
  ]
}

 */

const AWS = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;
const { google } = require('googleapis');
const { promisify } = require('util');
const googleMaps = require('@google/maps');
const renameKeys = require('deep-rename-keys');
import { getOrDefaultDataOptions, createHeadersAndDataFromDataOption } from "../src/admin/util/dataOptionUtil";
import { get, find, findIndex, maxBy, minBy, set } from "lodash";
import Headers from "../src/admin/util/Headers";
import stringHash from "string-hash";
declare const STAGE: any;

// var credentials = new AWS.SharedIniFileCredentials({ profile: 'ashwin-cff-lambda' });
// AWS.config.credentials = credentials;
// AWS.config.update({ region: 'us-east-1' });

interface ISheet { properties: { sheetId: number, title: string, index: number } }
interface IDistanceMatrixRow {
  elements: {
    distance: { text: string, value: number }, duration: { text: string, value: number }, status: string
  }[]
}

module.exports.hello = async (event, context) => {
  try {
    var ssm = new AWS.SSM();
    let mongo_conn_str = "";
    let google_key: any = "";
    let maps_api_key = "";
    if (STAGE === "dev") {
      // todo: set to local.
      mongo_conn_str = "";
      google_key = "";
      maps_api_key = "";
    }
    else {
      mongo_conn_str = (await ssm.getParameter({ Name: process.env.mongoConnStr, WithDecryption: true }).promise()).Parameter.Value;
      google_key = (await ssm.getParameter({ Name: process.env.googleKey, WithDecryption: true }).promise()).Parameter.Value;
      maps_api_key = (await ssm.getParameter({ Name: process.env.mapsApiKey, WithDecryption: true }).promise()).Parameter.Value;
    }
    mongo_conn_str = mongo_conn_str.replace("==", "%3D%3D");
    let db = await MongoClient.connect(mongo_conn_str);
    let coll = db.db('cm').collection(process.env.mongoCollectionName);

    google_key = JSON.parse(google_key);
    // let gapi = await google.client.load(google_key);
    let jwtClient = new google.auth.JWT(
      google_key.client_email,
      null,
      google_key.private_key,
      ['https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive']);

    //authenticate request
    await promisify(jwtClient.authorize);
    const sheets = google.sheets({ version: 'v4', auth: jwtClient });
    const drive = google.drive({ version: 'v3', auth: jwtClient });
    const googleMapsClient = googleMaps.createClient({ Promise: Promise, key: maps_api_key });

    const createSpreadsheet = async (title) => {
      const response = await promisify(sheets.spreadsheets.create)({
        resource: {
          properties: {
            title: title
          }
        }
      });
      const spreadsheetId = response.data.spreadsheetId;
      await promisify(drive.permissions.create)({
        "fileId": spreadsheetId,
        "resource": {
          "role": "reader",
          "type": "anyone",
          "allowFileDiscovery": false
        }
      });
      // await promisify(drive.permissions.create)({
      //   "fileId": spreadsheetId,
      //   "transferOwnership": true,
      //   "resource": {
      //     "role": "owner",
      //     "type": "user",
      //     "emailAddress": "ccmt.dev@gmail.com"
      //   }
      // });
      console.log(response.data.spreadsheetUrl);
      return spreadsheetId;
    }

    let forms = await coll.find({ '_cls': 'chalicelib.models.Form', 'formOptions.dataOptions.export': { '$exists': true } }).toArray();

    for (let form of forms) {
      const dataOptions = getOrDefaultDataOptions(form);
      let googleSheetsDataOptionIndex = findIndex(dataOptions.export, { "type": "google_sheets" });
      if (googleSheetsDataOptionIndex === -1) {
        continue;
      }
      let googleSheetsDataOption = dataOptions.export[googleSheetsDataOptionIndex];

      let filter = get(googleSheetsDataOption, "filter", {});
      let responses = await coll.find({ '_cls': 'chalicelib.models.Response', form: form._id, ...filter }).sort({ date_created: -1 }).toArray();
      let queryCache = {}; // keys: stringified versions of queries, values: list of responses
      let extraHeaders = [];

      if (googleSheetsDataOption.enableOrderId) {
        extraHeaders.push({
          Header: "Order ID", accessor: e => {
            let orderId = get(e, "admin_info.order_id", "");
            return e.CFF_UNWIND_INDEX ? `${orderId}.${e.CFF_UNWIND_INDEX}` : `${orderId}`;
          }
        });
        let maxId = get(maxBy(responses, e => get(e, "admin_info.order_id")), "admin_info.order_id", 0);
        for (let i = responses.length - 1; i >= 0; i--) {
          let response = responses[i];
          if (!get(response, "admin_info.order_id")) {
            maxId++;
            await coll.updateOne({ _id: response._id }, { $set: { "admin_info.order_id": maxId } });
            set(response, "admin_info.order_id", maxId);
          }
        }
      }
      if (googleSheetsDataOption.enableNearestLocation) {
        const locations = googleSheetsDataOption.nearestLocationOptions.locations;
        extraHeaders.push({
          Header: "Nearest Location", accessor: e => get(e, "admin_info.nearest_location", "")
        });
        // const addressAccessor = googleSheetsDataOption.nearestLocationOptions.addressAccessor;
        let responsesToCalculate = responses.filter(response => !get(response, "admin_info.nearest_location"));

        // Todo: Google limits to 100 elements -- find a better way to do it in batch rather than each one individually https://developers.google.com/maps/documentation/javascript/distancematrix#usage_limits_and_requirements
        let distanceRows: IDistanceMatrixRow[] = [];
        for (let response of responsesToCalculate) {
          let results = (await googleMapsClient.distanceMatrix({
            origins: [`${response.value.address.line1} ${response.value.address.city} ${response.value.address.state} ${response.value.address.zipcode}`],
            destinations: locations.map(e => [e.latitude, e.longitude])
          }).asPromise());
          distanceRows.push(results.json.rows[0]);
        }

        for (const i in responsesToCalculate) {
          const distanceRow: IDistanceMatrixRow = distanceRows[i];
          let response = responsesToCalculate[i];
          const nearestLocation = minBy(distanceRow.elements, e => get(e, "duration.value", Number.MAX_SAFE_INTEGER));
          if (nearestLocation.status !== "OK") { // Status is OK or NOT_FOUND.
            continue;
          }
          const nearestLocationIndex = distanceRow.elements.indexOf(nearestLocation);
          const nearestLocationName = locations[nearestLocationIndex].name;
          console.log(nearestLocationName);
          set(response, "admin_info.nearest_location", nearestLocationName);
          await coll.updateOne({ _id: response._id }, { $set: { "admin_info.nearest_location": nearestLocationName } });
        }
      }

      let spreadsheetId = googleSheetsDataOption.spreadsheetId;
      if (!spreadsheetId) {
        spreadsheetId = await createSpreadsheet(`CFF Export - ${form.name}`);
        await coll.updateOne({ _id: form._id }, { "$set": { [`formOptions.dataOptions.export.${googleSheetsDataOptionIndex}.spreadsheetId`]: spreadsheetId } });
      }
      const spreadsheet = await promisify(sheets.spreadsheets.get)({ spreadsheetId });
      const existingSheets: ISheet[] = spreadsheet.data.sheets;

      let requests = [];
      let viewsToShow = googleSheetsDataOption.viewsToShow || dataOptions.views.map(e => e.id);
      let sheetsToDelete: ISheet[] = existingSheets.filter(e => viewsToShow.indexOf(e.properties.title) === -1);
      for (const i in dataOptions.views) {
        const dataOptionView = dataOptions.views[i];
        if (viewsToShow.indexOf(dataOptionView.id) === -1) {
          continue;
        }
        let sheetId = stringHash(dataOptionView.id);
        let title = dataOptionView.id;
        let responsesToUse = responses;
        if (dataOptionView.aggregate) {
          let cacheKey = JSON.stringify(dataOptionView.aggregate);
          let aggregateQuery = dataOptionView.aggregate.map(obj => renameKeys(obj, key => key.replace(/\|\|/g, ".").replace(/\|/g, "$") ));
          if (queryCache[cacheKey]) {
            responsesToUse = queryCache[cacheKey];
          } else {
            responsesToUse = await coll.aggregate([
              {'$match': { '_cls': 'chalicelib.models.Response', form: form._id}},
              ...aggregateQuery
            ]).toArray();
            queryCache[cacheKey] = responsesToUse;
          }
          // Debug
          // console.log(JSON.stringify(aggregateQuery), responsesToUse);
        }
        if (responsesToUse.length === 0) {
          continue;
        }
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(responsesToUse, form, dataOptionView, null, dataOptionView.aggregate ? true: false);
        if (!dataOptionView.aggregate) {
          headers = [...extraHeaders, ...headers];
        }
        let rowCount = dataFinal.length + 1;
        let columnCount = headers.length;
        let existingSheet = find(existingSheets, e => e.properties.title === title);
        if (!existingSheet) {
          requests.push({
            addSheet: {
              properties: {
                sheetId,
                title
              }
            }
          });
        }
        else {
          sheetId = existingSheet.properties.sheetId;
        }
        requests.push({
          updateSheetProperties: {
            fields: 'gridProperties.rowCount, gridProperties.columnCount',
            properties: {
              sheetId,
              gridProperties: {
                rowCount,
                columnCount
              }
            }
          }
        });
        requests.push({
          updateCells: {
            rows: [
              {
                values: headers.map(header => ({
                  userEnteredValue: { stringValue: header.Header }
                }))
              },
              ...dataFinal.map(response => ({
                values: headers.map(header => ({
                  userEnteredValue: { stringValue: Headers.formatValue(header.accessor(response)) }
                }))
              }))
            ],
            fields: '*',
            start: {
              sheetId,
              rowIndex: 0,
              columnIndex: 0
            }
          }
        });
        requests.push({
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: headers.length
            }
          }
        });
      }
      for (let sheetToDelete of sheetsToDelete) {
        requests.push({
          deleteSheet: {
            sheetId: sheetToDelete.properties.sheetId
          }
        });
      }
      if (requests.length === 0) {
        continue;
      }
      let response = await promisify(sheets.spreadsheets.batchUpdate)({
        spreadsheetId,
        resource: {
          requests
        }
      });
      if (response.status !== 200) {
        // todo: error handling/logging here.
        throw response;
      }
    }

    return {
      message: 'Go! Google sheets sync completed successfully.',
      input: event,
      success: true
    };
  }
  catch (e) {
    console.error(e);
    throw JSON.stringify({
      message: "Error.",
      error: e.errors ? e.errors.map(i => i.message) : e,
      input: event,
      success: false
    });
  }
};