import { renderedForm } from "./constants";
import { createHeadersAndDataFromDataOption } from '../../../src/admin/util/dataOptionUtil';

describe('test clientSideFilter of responses', () => {
    const responses_ = [
        {
            "_id": { "$oid": "id_paid" },
            "form": { "$oid": "5b70ea0e5692f86efe9202be" },
            "user": "cm:cognitoUserPool:dabcdefg",
            "paymentInfo": {},
            "payment_status_detail": [],
            "paid": true,
            "amount_paid": "100.0",
            "payment_trail": [],
            "update_trail": [],
            "email_trail": [],
            "value": {},
            "date_created": { "$date": "2018-08-13T10:18:34.961Z" },
            "date_modified": { "$date": "2018-08-13T16:27:42.325Z" }
        },
        {
            "_id": { "$oid": "id_unpaid" },
            "form": { "$oid": "5b70ea0e5692f86efe9202be" },
            "user": "cm:cognitoUserPool:dabcdefg",
            "paymentInfo": {},
            "payment_status_detail": [],
            "paid": false,
            "amount_paid": "100.0",
            "payment_trail": [],
            "update_trail": [],
            "email_trail": [],
            "value": {},
            "date_created": { "$date": "2018-08-13T10:18:34.961Z" },
            "date_modified": { "$date": "2018-08-13T16:27:42.325Z" }
        }
    ];
    it('responses with clientSideFilter PAID=true', () => {
        const dataOptionView = {
            "id": "test",
            "displayName": "test",
            "clientSideFilter": { "PAID": true }
        };
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(responses_, renderedForm, dataOptionView);
        expect(dataFinal.length).toEqual(1);
        expect(dataFinal[0].ID).toEqual("response_paid");
    });
    it('responses with no clientSideFilter', () => {
        const dataOptionView = {
            "id": "test",
            "displayName": "test"
        };
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(responses_, renderedForm, dataOptionView);
        expect(dataFinal.length).toEqual(2);
        expect(dataFinal[0].ID).toEqual("response_paid");
        expect(dataFinal[0].ID).toEqual("response_unpaid");
    });
});

describe('test aggregation of responses', () => {
    it('aggregation with PAID column', () => {
        const responses_ = [
            {
                "_id": { "$oid": "id_paid_1" },
                "form": { "$oid": "5b70ea0e5692f86efe9202be" },
                "user": "cm:cognitoUserPool:dabcdefg",
                "paymentInfo": {},
                "payment_status_detail": [],
                "paid": true,
                "amount_paid": "100.0",
                "payment_trail": [],
                "update_trail": [],
                "email_trail": [],
                "value": {},
                "date_created": { "$date": "2018-08-13T10:18:34.961Z" },
                "date_modified": { "$date": "2018-08-13T16:27:42.325Z" }
            },
            {
                "_id": { "$oid": "id_paid_2" },
                "form": { "$oid": "5b70ea0e5692f86efe9202be" },
                "user": "cm:cognitoUserPool:dabcdefg",
                "paymentInfo": {},
                "payment_status_detail": [],
                "paid": true,
                "amount_paid": "100.0",
                "payment_trail": [],
                "update_trail": [],
                "email_trail": [],
                "value": {},
                "date_created": { "$date": "2018-08-13T10:18:34.961Z" },
                "date_modified": { "$date": "2018-08-13T16:27:42.325Z" }
            },
            {
                "_id": { "$oid": "id_unpaid_1" },
                "form": { "$oid": "5b70ea0e5692f86efe9202be" },
                "user": "cm:cognitoUserPool:dabcdefg",
                "paymentInfo": {},
                "payment_status_detail": [],
                "paid": false,
                "amount_paid": "100.0",
                "payment_trail": [],
                "update_trail": [],
                "email_trail": [],
                "value": {},
                "date_created": { "$date": "2018-08-13T10:18:34.961Z" },
                "date_modified": { "$date": "2018-08-13T16:27:42.325Z" }
            }
        ];
        const dataOptionView = {
            "id": "test",
            "displayName": "test",
            "clientSideFilter": { "PAID": true }
        };
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(responses_, renderedForm, dataOptionView);
        // expect(headers.map(e => e.id).sort()).toEqual()
        /*
        -Can you display the total number of registrants at the top of the admin view? And a breakdown of  # of Early Birds, # of Regular registrants?
-Display the sum total money registrants have paid.
        */
        expect(dataFinal.length).toEqual(1);
        expect(dataFinal[0].ID).toEqual("response_paid");
    });
});