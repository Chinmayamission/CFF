'use strict';
/*
 * ts-node scripts/backend/handler.ts
 * dataOptions: {export: [{{ "type": "google_sheets" }}]}
 */

const AWS = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;
const { google } = require('googleapis');
const { promisify } = require('util');
import { getOrDefaultDataOptions, createHeadersAndDataFromDataOption } from "../src/admin/util/dataOptionUtil";
import { find, findIndex } from "lodash";
import Headers from "../src/admin/util/Headers";
declare const STAGE: any;

// var credentials = new AWS.SharedIniFileCredentials({ profile: 'ashwin-cff-lambda' });
// AWS.config.credentials = credentials;
// AWS.config.update({ region: 'us-east-1' });

module.exports.hello = async (event, context) => {
  try {
    var ssm = new AWS.SSM();
    let mongo_conn_str = "";
    let google_key: any = "";
    if (STAGE === "dev") {
      // todo: set to local.
      mongo_conn_str = "";
      google_key = "";
    }
    else {
      mongo_conn_str = (await ssm.getParameter({ Name: process.env.mongoConnStr, WithDecryption: true }).promise()).Parameter.Value;
      google_key = (await ssm.getParameter({ Name: process.env.googleKey, WithDecryption: true }).promise()).Parameter.Value;
    }
    mongo_conn_str = mongo_conn_str.replace("==", "%3D%3D");
    let db = await MongoClient.connect(mongo_conn_str);
    let coll = db.db('cm').collection('cff_beta');
  
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
      await promisify(drive.permissions.create)({
        "fileId": spreadsheetId,
        "resource": {
          "role": "owner",
          "type": "user",
          "emailAddress": "ccmt.dev@gmail.com"
        }
      });
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
      
      const responses = await coll.find({ '_cls': 'chalicelib.models.Response', form: form._id }).toArray();
      let spreadsheetId = googleSheetsDataOption.spreadsheetId;
      let newSpreadsheet = false;
      if (!spreadsheetId) {
        newSpreadsheet = true;
        spreadsheetId = await createSpreadsheet(`CFF Export - ${form.name}`);
        await coll.updateOne({_id: form._id}, {"$set": {[`formOptions.dataOptions.export.${googleSheetsDataOptionIndex}.spreadsheetId`]: spreadsheetId } } );
      }
      const spreadsheet = await promisify(sheets.spreadsheets.get)({spreadsheetId});
      const existingSheets: {properties: {sheetId: number, title: string, index: number}} = spreadsheet.data.sheets;

      let requests = [];
      for (const i in dataOptions.views) {
        const dataOptionView = dataOptions.views[i];
        let sheetId = i + 1;
        let title = dataOptionView.id;
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(responses, form, dataOptionView, null);
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
      if (newSpreadsheet) {
        // Delete Sheet1
        requests.push({
          deleteSheet: {
            sheetId: 0
          }
        });
      }

      let response = await promisify(sheets.spreadsheets.batchUpdate)({
        spreadsheetId,
        resource: {
          requests
        }
      });
      if (response.status !== 200) {
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
      error: e.errors ? e.errors.map(i => i.message): e,
      input: event,
      success: false
    });
  }
};