import { renderedForm } from "./constants";
import { createHeadersAndDataFromDataOption } from "../../../src/admin/util/dataOptionUtil";

describe("test regular of responses", () => {
    const responses_ = [
        {
            _id: { $oid: "id_paid" },
            form: { $oid: "5b70ea0e5692f86efe9202be" },
            user: "cm:cognitoUserPool:dabcdefg",
            paymentInfo: {},
            payment_status_detail: [],
            paid: true,
            amount_paid: "100.0",
            payment_trail: [],
            update_trail: [],
            email_trail: [],
            value: {},
            date_created: { $date: "2018-08-13T10:18:34.961Z" },
            date_modified: { $date: "2018-08-13T16:27:42.325Z" }
        },
        {
            _id: { $oid: "id_unpaid" },
            form: { $oid: "5b70ea0e5692f86efe9202be" },
            user: "cm:cognitoUserPool:dabcdefg",
            paymentInfo: {},
            payment_status_detail: [],
            paid: false,
            amount_paid: "100.0",
            payment_trail: [],
            update_trail: [],
            email_trail: [],
            value: {},
            date_created: { $date: "2018-08-13T10:18:34.961Z" },
            date_modified: { $date: "2018-08-13T16:27:42.325Z" }
        }
    ];
    it("responses should get all", () => {
        const dataOptionView = {
            id: "test",
            displayName: "test"
        };
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(
            responses_,
            renderedForm,
            dataOptionView
        );
        expect(dataFinal.length).toEqual(2);
        expect(dataFinal[0].ID).toEqual("id_paid");
        expect(dataFinal[1].ID).toEqual("id_unpaid");
    });
});

describe("test aggregation of responses", () => {
    it("aggregation with PAID column", () => {
        const responses_ = [{ _id: false, count: 3 }, { _id: true, count: 1 }];
        const dataOptionView = {
            id: "aggregate",
            displayName: "Aggregate",
            aggregate: [{ "|group": { _id: "$paid", count: { "|sum": 1 } } }]
        };
        let { headers, dataFinal } = createHeadersAndDataFromDataOption(
            responses_,
            renderedForm,
            dataOptionView,
            null,
            true
        );
        expect(dataFinal).toMatchInlineSnapshot(`
Array [
  Object {
    "_id": false,
    "count": 3,
  },
  Object {
    "_id": true,
    "count": 1,
  },
]
`);
    });
});
