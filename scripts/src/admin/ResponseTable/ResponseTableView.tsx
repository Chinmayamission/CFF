// import unwind from "javascript-unwind";
import { get, set, cloneDeep } from "lodash-es";
import React from 'react';
import ReactTable from "react-table";
import { IResponse } from '../../store/responses/types';
import { IDataOptionView, IRenderedForm } from '../FormEdit/FormEdit.d';
import { formatPayment } from "../util/formatPayment";
import Headers from "../util/Headers";
import downloadCSV from "./downloadCSV";
import { filterCaseInsensitive } from "./filters";
import Modal from "react-responsive-modal";
import ResponseDetail from "./ResponseDetail";
import { fetchResponseDetail, displayResponseDetail } from "../../store/responses/actions";
import { isArray } from "util";

interface IResponseTableViewProps {
    responses: IResponse[],
    renderedForm: IRenderedForm,
    dataOptionView: IDataOptionView,
    shownResponseDetailId?: string,
    displayResponseDetail?: (e: string) => void
}

function unwind(data, unwindBy) {
    let unwoundData = [];
    for (const row of data) {
        const unwindArray = get(row, unwindBy, []);
        if (isArray(unwindArray)) {
            for (const index in unwindArray) {
                let unwoundRow = cloneDeep(row);
                set(unwoundRow, unwindBy, unwindArray[index]);
                set(unwoundRow, "CFF_UNWIND_BY", unwindBy);
                set(unwoundRow, "CFF_UNWIND_ACCESSOR", `${unwindBy}.${index}`);
                unwoundData.push(unwoundRow);
            }
        }
    }
    return unwoundData;
}

export default (props: IResponseTableViewProps) => {

    let headers = [];
    let data = props.responses.map(e => ({
        ...e.value,
        "ID": e["_id"]["$oid"],
        "PAID": e.paid,
        "DATE_CREATED": e.date_created.$date,
        "DATE_LAST_MODIFIED": e.date_modified.$date,
        "AMOUNT_OWED": formatPayment(e.paymentInfo.total, e.paymentInfo.currency),
        "AMOUNT_PAID": formatPayment(e.amount_paid, e.paymentInfo.currency)
    })
    );
    headers = Headers.makeHeadersFromDataOption(props.dataOptionView, props.renderedForm.schema, get(props.renderedForm, "formOptions.dataOptions.groups", []));
    if (props.dataOptionView.unwindBy) {
        for (let item of data) {
            if (!get(item, props.dataOptionView.unwindBy)) {
                set(item, props.dataOptionView.unwindBy, []);
            }
        }
        // Todo: keep track of which index each item is in, so that it can be edited properly.
        data = unwind(data, props.dataOptionView.unwindBy);
    }
    return (<div>
        <button className="btn btn-outline-primary" onClick={() => downloadCSV(headers, data, `Responses - ${props.renderedForm.name} - at ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`)}>Download CSV</button>

        <ReactTable
            data={data}
            columns={headers}
            minRows={0}
            filterable
            defaultSorted={[{ "id": "DATE_LAST_MODIFIED", "desc": true }]}
            defaultFiltered={[{ "id": "PAID", "value": "all" }]}
            defaultFilterMethod={filterCaseInsensitive}
            getTdProps={(state, rowInfo, column, instance) => {
                return {
                    onClick: (e) => {
                        if (!column.headerClassName.match(/ccmt-cff-no-click/)) {
                            props.displayResponseDetail(rowInfo.original.ID);
                        }
                    }
                }
            }
            }
        />
        <Modal
            open={!!props.shownResponseDetailId} onClose={() => props.displayResponseDetail(null)}>
            <div className="ccmt-cff-Wrapper-Bootstrap">
                <h5 className="card-title">Response Detail - {props.shownResponseDetailId}</h5>
                <div className="card-text">
                    <ResponseDetail responseId={props.shownResponseDetailId} />
                </div>
            </div>
        </Modal>
    </div>
    );
}