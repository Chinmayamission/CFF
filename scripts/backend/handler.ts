'use strict';
/*
 * ts-node scripts/backend/handler.ts
 */

const AWS = require('aws-sdk');
const MongoClient = require('mongodb').MongoClient;
const { google } = require('googleapis');
const { promisify } = require('util');
import { getOrDefaultDataOptions, createHeadersAndDataFromDataOption } from "../src/admin/util/dataOptionUtil";
import { find } from "lodash";
import Headers from "../src/admin/util/Headers";


var credentials = new AWS.SharedIniFileCredentials({ profile: 'ashwin-cff-lambda' });
AWS.config.credentials = credentials;
AWS.config.update({ region: 'us-east-1' });

module.exports.hello = async (event, context) => {
  try {
    var ssm = new AWS.SSM();

    let mongo_conn_str = (await ssm.getParameter({ Name: 'CFF_COSMOS_CONN_STR_WRITE_BETA', WithDecryption: true }).promise()).Parameter.Value;
    let google_key = (await ssm.getParameter({ Name: 'CFF_GOOGLE_SHEETS_KEY_BETA', WithDecryption: true }).promise()).Parameter.Value;

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
      let googleSheetsDataOption = find(dataOptions.export, { "type": "google_sheets" });
      if (!googleSheetsDataOption) {
        continue;
      }
      const responses = await coll.find({ '_cls': 'chalicelib.models.Response', form: form._id }).toArray();
      const spreadsheetId = googleSheetsDataOption.spreadsheetId || await createSpreadsheet(`CFF - ${form.name} - exported ${new Date()}`);
      console.log("starting");
      let requests = [];
      for (const i in dataOptions.views) {
        const dataOptionView = dataOptions.views[i];
        let sheetId = i + 1;
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(responses, form, dataOptionView, null);
        requests.push(...[{
          addSheet: {
            properties: {
              sheetId,
              title: dataOptionView.id,
              gridProperties: {
                rowCount: dataFinal.length + 1,
                columnCount: headers.length,
                frozenRowCount: 1
              }
            }
          }
        }, {
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
        }, {
          autoResizeDimensions: {
            dimensions: {
              sheetId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: headers.length
            }
          }
        }]);
      }
      // Delete Sheet1
      requests.push({
        deleteSheet: {
          sheetId: 0
        }
      });

      let response = await promisify(sheets.spreadsheets.batchUpdate)({
        spreadsheetId,
        resource: {
          requests
        }
      });
      console.log(response.status);
    }

    // let res = await coll.find({}).limit(1).toArray();
    // console.log(res);


    // console.log(await coll.find({}).limit(1)); //.cm.cff_beta.find({}).limit(1));
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      }),
    };
  }
  catch (e) {
    console.error(e);
  }

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
module.exports.hello();