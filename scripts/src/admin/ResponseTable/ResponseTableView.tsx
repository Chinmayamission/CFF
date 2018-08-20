import { push } from "connected-react-router";
import unwind from "javascript-unwind";
import { find, get, set, assign } from "lodash-es";
import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from "react-router-dom";
import ReactTable from "react-table";
import { IResponse } from '../../store/responses/types';
import { IDataOptions, IRenderedForm, IDataOptionView } from '../FormEdit/FormEdit.d';
import Headers from "../util/Headers";
import downloadCSV from "./downloadCSV";
import { filterCaseInsensitive } from "./filters";
import ResponseDetail from "./ResponseDetail";
import { formatPayment } from "../util/formatPayment";
import Form from "react-jsonschema-form";

interface IResponseTableViewProps {
    responses: IResponse[],
    renderedForm: IRenderedForm,
    dataOptionView: IDataOptionView
}

// function unwind(data, unwindBy) {

// }

export default (props: IResponseTableViewProps) => {

    let headers = [];
    let data = props.responses.map((e, index) => {
        assign(e.value, {
            "ID": e["_id"]["$oid"],
            "PAID": e.paid,
            "DATE_CREATED": e.date_created.$date,
            "DATE_LAST_MODIFIED": e.date_modified.$date,
            "AMOUNT_OWED": formatPayment(e.paymentInfo.total, e.paymentInfo.currency),
            "AMOUNT_PAID": formatPayment(e.amount_paid, e.paymentInfo.currency)
        });
        return e.value;
    });
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
            freezeWhenExpanded={true}
            SubComponent={({ original, row }) => <ResponseDetail responseId={original.ID} />}
            getTdProps={(state, rowInfo, column, instance) => {
                if (column.headerClassName.match(/ccmt-cff-no-click/)) {
                    return {};
                }
                return {
                    onClick: (e) => {
                        const { expanded } = state;
                        const path = rowInfo.nestingPath[0];

                        instance.setState({
                            expanded: { [path]: expanded[path] ? false : true }
                        });
                    }
                }
            }
            }
        />
    </div>
    );
}