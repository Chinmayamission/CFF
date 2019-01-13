'use strict';
/*
 * ts-node scripts/backend/handler.ts
 */

const AWS = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;
const { google } = require('googleapis');
const { promisify } = require('util');
import { getOrDefaultDataOptions, createHeadersAndDataFromDataOption } from "../src/admin/util/dataOptionUtil";
import { find, findIndex } from "lodash";
import Headers from "../src/admin/util/Headers";
declare const STAGE: any;

// Todo: add IAM policies, scheduling, remove HTTP response.

var credentials = new AWS.SharedIniFileCredentials({ profile: 'ashwin-cff-lambda' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });

module.exports.hello = async (event, context) => {
  try {
    var ssm = new AWS.SSM();
    let mongo_conn_credentials_name = "";
    let google_credentials_name = "";
    if (STAGE === "prod") {
      mongo_conn_credentials_name = 'CFF_COSMOS_CONN_STR_WRITE_PROD';
      google_credentials_name = 'CFF_GOOGLE_SHEETS_KEY_PROD';
    }
    else if (STAGE === "beta") {
      mongo_conn_credentials_name = 'CFF_COSMOS_CONN_STR_WRITE_BETA';
      google_credentials_name = 'CFF_GOOGLE_SHEETS_KEY_BETA';
    }
    else {
      throw "STAGE is not prod or beta";
    }
    let mongo_conn_str = (await ssm.getParameter({ Name: mongo_conn_credentials_name, WithDecryption: true }).promise()).Parameter.Value;
    let google_key = (await ssm.getParameter({ Name: google_credentials_name, WithDecryption: true }).promise()).Parameter.Value;

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
      })
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
        spreadsheetId = await createSpreadsheet(`CFF - ${form.name} - exported ${new Date()}`);
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
      statusCode: 200,
      body: JSON.stringify({
        message: 'Go! Google sheets sync completed successfully.',
        input: event,
      }),
    };
  }
  catch (e) {
    console.error(e);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error.",
        error: e,
        input: event
      })
    }
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};