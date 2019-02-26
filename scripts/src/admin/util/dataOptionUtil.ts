import { formatPayment } from "./formatPayment";
import Headers, { IHeaderObject } from "./Headers";
import {get, set, has, cloneDeep} from "lodash";
import unwind from "./unwind";
import { IRenderedForm, IDataOptions, IDataOptionView } from "../FormEdit/FormEdit.d";
import { IResponse } from "scripts/src/store/responses/types";

export function getOrDefaultDataOptions(form: IRenderedForm): IDataOptions {
    let dataOptions: IDataOptions = cloneDeep(get(form, "formOptions.dataOptions", {}));
    if (!has(dataOptions, "views")) {
        dataOptions = {...dataOptions, "views": [{
            "id": "all",
            "displayName": "All View"
        }]};
    }
    if (!has(dataOptions, "groups")) {
        dataOptions = {...dataOptions, "groups": [] };
    }
    for (let i in dataOptions.views) {
        let view = dataOptions.views[i];
        if (!view.displayName) {
            view.displayName = view.unwindBy ? `Unwind by ${view.unwindBy}` : "All responses";
        }
        if (!view.id) {
            view.id = "view" + i;
        }
    }
    return dataOptions;
}

export function createHeadersAndDataFromDataOption(responses: IResponse[], form: IRenderedForm, dataOptionView: IDataOptionView, editResponse?: (a, b, c) => void)
: {headers: IHeaderObject[], dataFinal: any[]}
{
    // if (responses && responses[0] && !responses[0].paid) {
    //     let headers = [
    //         {"Header": "_id", "id": "_id", "accessor": e => e._id, "Cell": e => e},
    //         {"Header": "count", "id": "count", "accessor": e => e.count, "Cell": e => e},
    //     ];
    //     let dataFinal = responses;
    //     return {headers, dataFinal};
    // }
    let headers = [];
    let data = responses.map(e => ({
        ...e.value,
        "ID": e["_id"]["$oid"] || String(e._id),
        "PAID": e.paid,
        "DATE_CREATED": e.date_created.$date || String(e.date_created),
        "DATE_LAST_MODIFIED": e.date_modified.$date || String(e.date_modified),
        "AMOUNT_OWED": formatPayment(e.paymentInfo.total, e.paymentInfo.currency),
        "AMOUNT_PAID": formatPayment(e.amount_paid, e.paymentInfo.currency),
        "admin_info": e.admin_info
    })
    );
    headers = Headers.makeHeadersFromDataOption(
        dataOptionView,
        form.schema,
        get(form, "formOptions.dataOptions.groups", []),
        (a, b, c) => editResponse && editResponse(a, b, c),
        (unwindBy: string) => unwind(data, unwindBy)
    );
    for (let header of headers) {
        if (header.Cell == (() => "ccmt-cff-group-assign-editable")) {}
    }
    let dataFinal = data;
    if (dataOptionView.unwindBy) {
        for (let item of data) {
            if (!get(item, dataOptionView.unwindBy)) {
                set(item, dataOptionView.unwindBy, []);
            }
        }
        // Todo: keep track of which index each item is in, so that it can be edited properly.
        dataFinal = unwind(data, dataOptionView.unwindBy);
    }
    return {headers, dataFinal};
}