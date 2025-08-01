"use strict";
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
      ],
      "showCountTotal": true
    }
  ]
}

 */

const AWS = require("aws-sdk");
const MongoClient = require("mongodb").MongoClient;
const { google } = require("googleapis");
const { promisify } = require("util");
const googleMaps = require("@google/maps");
const renameKeys = require("deep-rename-keys");
import {
  getOrDefaultDataOptions,
  createHeadersAndDataFromDataOption
} from "../src/admin/util/dataOptionUtil";
import { get, find, findIndex, maxBy, minBy, set } from "lodash";
import Headers from "../src/admin/util/Headers";
import stringHash from "string-hash";

interface ISheet {
  properties: { sheetId: number; title: string; index: number };
}
interface IDistanceMatrixRow {
  elements: {
    distance: { text: string; value: number };
    duration: { text: string; value: number };
    status: string;
  }[];
}

// lastFormProcessedDateModified is stored as a global variable, and marks where the script should start when looking for forms. Since the script cannot go through all forms without timing out, keeping track of lastFormProcessedDateModified allows the script to resume where it stopped when it times out on a particular form.
let lastFormProcessedDateModified = new Date(0);

function replaceKey(iterable: any, old: string, new_: string): any {
  if (iterable && typeof iterable === "object") {
    if (Array.isArray(iterable)) {
      return iterable.map(item => replaceKey(item, old, new_));
    } else {
      const newObj: any = {};
      for (const key of Object.keys(iterable)) {
        const newKey = key.replace(old, new_);
        newObj[newKey] = replaceKey(iterable[key], old, new_);
      }
      return newObj;
    }
  }
  return iterable;
}

export const sheets = async (event, context) => {
  try {
    var ssm = new AWS.SSM();
    let mongo_conn_str = "";
    let google_key: any = "";
    let maps_api_key = "";
    mongo_conn_str = (await ssm
      .getParameter({ Name: process.env.mongoConnStr, WithDecryption: true })
      .promise()).Parameter.Value;
    google_key = (await ssm
      .getParameter({ Name: process.env.googleKey, WithDecryption: true })
      .promise()).Parameter.Value;
    maps_api_key = (await ssm
      .getParameter({ Name: process.env.mapsApiKey, WithDecryption: true })
      .promise()).Parameter.Value;
    mongo_conn_str = mongo_conn_str.replace("==", "%3D%3D");
    let db = await MongoClient.connect(mongo_conn_str, {
      useNewUrlParser: true
    });
    let coll = db.db("cm").collection(process.env.mongoCollectionName);

    google_key = JSON.parse(google_key);
    // let gapi = await google.client.load(google_key);
    console.log("google_key", google_key);
    let jwtClient = new google.auth.JWT(
      google_key.client_email,
      null,
      google_key.private_key,
      [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
      ]
    );

    //authenticate request
    await promisify(jwtClient.authorize);
    const sheets = google.sheets({ version: "v4", auth: jwtClient });
    const drive = google.drive({ version: "v3", auth: jwtClient });
    const googleMapsClient = googleMaps.createClient({
      Promise: Promise,
      key: maps_api_key
    });

    const createSpreadsheet = async title => {
      const response = await promisify(sheets.spreadsheets.create.bind(sheets))(
        {
          resource: {
            properties: {
              title: title
            }
          }
        }
      );
      const spreadsheetId = response.data.spreadsheetId;
      await promisify(drive.permissions.create.bind(drive))({
        fileId: spreadsheetId,
        resource: {
          role: "reader",
          type: "anyone",
          allowFileDiscovery: false
        }
      });
      console.log("\tCreated new spreadsheet: ", response.data.spreadsheetUrl);
      return spreadsheetId;
    };

    console.log(
      `Searching for forms created since lastFormProcessedDateModified: ${lastFormProcessedDateModified}`
    );
    // Only run script on Om Run or MSC forms for now.
    let forms = await coll
      .find({
        name: { $regex: ".*(Om Run|MSC).*" },
        _cls: "chalicelib.models.Form",
        "formOptions.dataOptions.export": { $exists: true },
        date_modified: { $gte: lastFormProcessedDateModified }
      })
      .sort({ date_modified: -1 }) // sort from most recently modified to least recently modified.
      .toArray();
    for (let form of forms) {
      let dataOptions = getOrDefaultDataOptions(form);
      if (!dataOptions.export) {
        continue;
      }

      // Transform all views at once before processing
      dataOptions = {
        ...dataOptions,
        views: replaceKey(replaceKey(dataOptions.views, "|", "$"), "||", ".")
      };

      for (let googleSheetsDataOptionIndex in dataOptions.export) {
        let googleSheetsDataOption =
          dataOptions.export[googleSheetsDataOptionIndex];
        if (googleSheetsDataOption.type !== "google_sheets") {
          continue;
        }
        console.log(
          "Handling form:",
          form.name,
          "with id:",
          form._id,
          "date modified",
          form.date_modified
        );
        let filter = get(googleSheetsDataOption, "filter", {});
        let responses = await coll
          .find({
            _cls: "chalicelib.models.Response",
            form: form._id,
            ...filter
          })
          .sort({ date_created: -1 })
          .toArray();
        let queryCache = {}; // keys: stringified versions of queries, values: list of responses
        let extraHeaders = [];

        if (googleSheetsDataOption.enableOrderId) {
          extraHeaders.push({
            Header: "Order ID",
            accessor: e => {
              let orderId = get(e, "admin_info.order_id", "");
              return e.CFF_UNWIND_INDEX
                ? `${orderId}.${e.CFF_UNWIND_INDEX}`
                : `${orderId}`;
            }
          });
          let maxId = get(
            maxBy(responses, e => get(e, "admin_info.order_id")),
            "admin_info.order_id",
            0
          );
          for (let i = responses.length - 1; i >= 0; i--) {
            let response = responses[i];
            if (!get(response, "admin_info.order_id")) {
              maxId++;
              await coll.updateOne(
                { _id: response._id },
                { $set: { "admin_info.order_id": maxId } }
              );
              set(response, "admin_info.order_id", maxId);
            }
          }
        }
        // Disabled for now because we no longer are using the Distance Matrix API.
        // if (googleSheetsDataOption.enableNearestLocation) {
        //   const locations =
        //     googleSheetsDataOption.nearestLocationOptions.locations;
        //   extraHeaders.push({
        //     Header: "Nearest Location",
        //     accessor: e => get(e, "admin_info.nearest_location", "")
        //   });
        //   // const addressAccessor = googleSheetsDataOption.nearestLocationOptions.addressAccessor;
        //   let responsesToCalculate = responses.filter(
        //     response => !get(response, "admin_info.nearest_location")
        //   );

        //   // Todo: Google limits to 100 elements -- find a better way to do it in batch rather than each one individually https://developers.google.com/maps/documentation/javascript/distancematrix#usage_limits_and_requirements
        //   let distanceRows: IDistanceMatrixRow[] = [];
        //   for (let response of responsesToCalculate) {
        //     let results = await googleMapsClient
        //       .distanceMatrix({
        //         origins: [
        //           `${response.value.address.line1} ${response.value.address.city} ${response.value.address.state} ${response.value.address.zipcode}`
        //         ],
        //         destinations: locations.map(e => [e.latitude, e.longitude])
        //       })
        //       .asPromise();
        //     distanceRows.push(results.json.rows[0]);
        //   }

        //   for (const i in responsesToCalculate) {
        //     const distanceRow: IDistanceMatrixRow = distanceRows[i];
        //     let response = responsesToCalculate[i];
        //     const nearestLocation = minBy(distanceRow.elements, e =>
        //       get(e, "duration.value", Number.MAX_SAFE_INTEGER)
        //     );
        //     if (nearestLocation.status !== "OK") {
        //       // Status is OK or NOT_FOUND.
        //       continue;
        //     }
        //     const nearestLocationIndex = distanceRow.elements.indexOf(
        //       nearestLocation
        //     );
        //     const nearestLocationName = locations[nearestLocationIndex].name;
        //     console.log(nearestLocationName);
        //     set(response, "admin_info.nearest_location", nearestLocationName);
        //     await coll.updateOne(
        //       { _id: response._id },
        //       { $set: { "admin_info.nearest_location": nearestLocationName } }
        //     );
        //   }
        // }

        let spreadsheetId = googleSheetsDataOption.spreadsheetId;
        let spreadsheet;
        if (spreadsheetId) {
          try {
            spreadsheet = await promisify(sheets.spreadsheets.get.bind(sheets))(
              {
                spreadsheetId
              }
            );
          } catch (e) {
            if (e.message.indexOf("not found") > -1) {
              spreadsheetId = null;
            } else {
              throw e;
            }
          }
        }
        if (!spreadsheetId) {
          spreadsheetId = await createSpreadsheet(`CFF Export - ${form.name}`);
          await coll.updateOne(
            { _id: form._id },
            {
              $set: {
                [`formOptions.dataOptions.export.${googleSheetsDataOptionIndex}.spreadsheetId`]: spreadsheetId
              }
            }
          );
          spreadsheet = await promisify(sheets.spreadsheets.get.bind(sheets))({
            spreadsheetId
          });
        }

        const existingSheets: ISheet[] = spreadsheet.data.sheets;

        let requests = [];
        let viewsToShow =
          googleSheetsDataOption.viewsToShow ||
          dataOptions.views.map(e => e.id);
        let sheetsToDelete: ISheet[] = existingSheets.filter(
          e => viewsToShow.indexOf(e.properties.title) === -1
        );
        for (const i in dataOptions.views) {
          const dataOptionView = dataOptions.views[i];
          if (viewsToShow.indexOf(dataOptionView.id) === -1) {
            continue;
          }
          let sheetId = Math.floor(stringHash(dataOptionView.id) / 10);
          let title = dataOptionView.id;
          let responsesToUse = responses;
          if (dataOptionView.aggregate) {
            let cacheKey = JSON.stringify(dataOptionView.aggregate);
            if (queryCache[cacheKey]) {
              responsesToUse = queryCache[cacheKey];
            } else {
              responsesToUse = await coll
                .aggregate([
                  {
                    $match: {
                      _cls: "chalicelib.models.Response",
                      form: form._id
                    }
                  },
                  ...dataOptionView.aggregate
                ])
                .toArray();
              queryCache[cacheKey] = responsesToUse;
            }
            if (
              responsesToUse.length > 0 &&
              dataOptionView.showCountTotal === true
            ) {
              responsesToUse.push({
                _id: "TOTAL",
                count: responsesToUse.map(e => e.count).reduce((a, b) => a + b)
              });
            }
            // Debug
            // console.log(JSON.stringify(dataOptionView.aggregate), responsesToUse);
          }
          if (responsesToUse.length === 0) {
            continue;
          }
          let { headers, dataFinal } = createHeadersAndDataFromDataOption(
            responsesToUse,
            form,
            dataOptionView,
            null,
            dataOptionView.aggregate ? true : false
          );
          if (!dataOptionView.aggregate) {
            headers = [...extraHeaders, ...headers];
          }
          let rowCount = dataFinal.length + 1;
          let columnCount = headers.length;
          let existingSheet = find(
            existingSheets,
            e => e.properties.title === title
          );
          if (!existingSheet) {
            requests.push({
              addSheet: {
                properties: {
                  sheetId,
                  title
                }
              }
            });
          } else {
            sheetId = existingSheet.properties.sheetId;
          }
          requests.push({
            updateSheetProperties: {
              fields: "gridProperties.rowCount, gridProperties.columnCount",
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
                    userEnteredValue: {
                      stringValue: Headers.formatValue(
                        header.accessor(response)
                      )
                    }
                  }))
                }))
              ],
              fields: "*",
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
        if (requests.length === 0) {
          continue;
        }
        let response = await promisify(
          sheets.spreadsheets.batchUpdate.bind(sheets)
        )({
          spreadsheetId,
          resource: {
            requests
          }
        });
        if (response.status !== 200) {
          // todo: error handling/logging here.
          throw response;
        }
        await new Promise((resolve, reject) => setTimeout(resolve, 2000));

        // Sheets to delete request -- must be done separately.
        requests = [];
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
        response = await promisify(
          sheets.spreadsheets.batchUpdate.bind(sheets)
        )({
          spreadsheetId,
          resource: {
            requests
          }
        });
        if (response.status !== 200) {
          // todo: error handling/logging here.
          throw response;
        }
        await new Promise((resolve, reject) => setTimeout(resolve, 2000));
      }
      // Form finished
      lastFormProcessedDateModified = form.date_modified;
      await new Promise((resolve, reject) => setTimeout(resolve, 500));
    }
    // If we got here so far without the function timing out, reset lastFormProcessedDateModified to zero so that we can start over again in the next function invocation.
    // eslint-disable-next-line require-atomic-updates
    lastFormProcessedDateModified = new Date(0);
    return {
      message: "Go! Google sheets sync completed successfully.",
      input: event,
      success: true
    };
  } catch (e) {
    console.error(e);
    throw JSON.stringify({
      message: "Error.",
      error: e.errors ? e.errors.map(i => i.message) : e,
      input: event,
      success: false
    });
  }
};
