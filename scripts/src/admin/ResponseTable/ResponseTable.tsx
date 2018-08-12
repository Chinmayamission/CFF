import { assign, concat, isArray } from 'lodash-es';
import * as React from 'react';
import { connect } from 'react-redux';
import 'react-table/react-table.css';
import Headers from "src/admin/util/Headers";
import Loading from "src/common/Loading/Loading";
import { fetchRenderedForm } from '../../store/form/actions';
import { fetchResponses, setResponsesSelectedView } from '../../store/responses/actions';
import { IResponseTableProps, IResponseTableState } from "./ResponseTable.d";
import ResponseTableView from "./ResponseTableView";


class ResponseTable extends React.Component<IResponseTableProps, IResponseTableState> {
    static defaultProps = {
        editMode: false,
        checkinMode: false
    }

    componentDidMount() {
        this.props.fetchRenderedForm(this.props.match.params.formId).then(() => this.props.fetchResponses(this.props.match.params.formId));
    }

    // showUnwindTable(rowToUnwind) {
    //     if (!rowToUnwind) {
    //         rowToUnwind = this.props.rowToUnwind;
    //     }
    //     let origData = this.props.tableDataOrigObject.map(e => e.value);
    //     let data = [];
    //     for (let item of origData) {
    //         if (!item[rowToUnwind]) continue;
    //         for (let i in item[rowToUnwind]) {
    //             // Gives all data of original rows to the unwound item.
    //             let unwoundItem = item[rowToUnwind][i];
    //             unwoundItem = assign({}, item, unwoundItem);
    //             unwoundItem["CFF_UNWIND_PATH"] = `${rowToUnwind}.${i}`;
    //             data.push(unwoundItem);
    //         }
    //     }
    //     let headerObjs = concat(
    //         // Headers.makeHeaderObjsFromKeys(["ID", "PAID"]),
    //         Headers.makeHeaders(this.props.form.renderedForm.schema.properties[rowToUnwind].items.properties),
    //         this.props.tableHeaders // concat original table headers with this.
    //     );
    //     let dataOptions = this.props.form.renderedForm.dataOptions;
    //     let colsToAggregate = [];
    //     if (dataOptions.unwindTables && dataOptions.unwindTables[rowToUnwind]) {
    //         headerObjs = filterHeaderObjs(headerObjs, dataOptions.unwindTables[rowToUnwind]);
    //         colsToAggregate = this.getColsToAggregate(dataOptions.unwindTables[rowToUnwind]);
    //     }

    //     this.props.setFormResponseTableDisplayData({
    //         tableDataDisplayed: data,
    //         tableHeadersDisplayed: headerObjs,
    //         colsToAggregate,
    //         tableHeaders: this.props.tableHeaders,
    //         tableData: this.props.tableData,
    //         possibleFieldsToUnwind: this.props.possibleFieldsToUnwind,
    //         dataOptions: this.props.dataOptions,
    //         rowToUnwind: rowToUnwind,
    //         tableDataOrigObject: this.props.tableDataOrigObject
    //     });
    // }

    render() {
        return (!this.props.responses || !this.props.form) ? <Loading /> : <ResponseTableView />;

    }
}

const mapStateToProps = state => ({
    ...state.responses,
    form: state.form
});

const mapDispatchToProps = (dispatch) => ({
    fetchResponses: formId => dispatch(fetchResponses(formId)),
    fetchRenderedForm: formId => dispatch(fetchRenderedForm(formId)),
    setResponsesSelectedView: (e: string) => dispatch(setResponsesSelectedView(e))
});

export default connect(mapStateToProps, mapDispatchToProps)(ResponseTable);