import { get, find, cloneDeep } from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import 'react-table/react-table.css';
import Loading from "src/common/Loading/Loading";
import { IDataOptions, IDataOptionView } from '../FormEdit/FormEdit.d';
import { fetchRenderedForm, editGroups } from '../../store/form/actions';
import { editResponse } from "../../store/responses/actions";
import { fetchResponses, setResponsesSelectedView, displayResponseDetail } from '../../store/responses/actions';
import { IResponseTableProps, IResponseTableState } from "./ResponseTable.d";
import ResponseTableView from "./ResponseTableView";
import "./ResponseTable.scss";
import { push } from 'connected-react-router';
import GroupEdit from "./GroupEdit";

class ResponseTable extends React.Component<IResponseTableProps, IResponseTableState> {

    componentDidMount() {
        this.props.fetchRenderedForm(this.props.match.params.formId).then(() => this.props.fetchResponses(this.props.match.params.formId));
    }

    editGroups(id, e) {
        let groups = cloneDeep(this.props.form.renderedForm.formOptions.dataOptions.groups);
        let group = find(groups, { "id": id });
        group.data = e;
        this.props.editGroups(groups);
    }

    render() {
        if (!this.props.responses || !this.props.form) {
            return <Loading />;
        }
        const defaultDataOptions: IDataOptions = {
            "views": [{
                "id": "all",
                "displayName": "All View"
            }],
            "groups": []
        };
        let dataOptions: IDataOptions = get(this.props.form.renderedForm.formOptions, "dataOptions.views") ? this.props.form.renderedForm.formOptions.dataOptions : defaultDataOptions;
        for (let i in dataOptions.views) {
            let view = dataOptions.views[i];
            if (!view.displayName) {
                view.displayName = view.unwindBy ? `Unwind by ${view.unwindBy}` : "All responses";
            }
            if (!view.id) {
                view.id = "view" + i;
            }
        }
        const dataOptionView: IDataOptionView = find(dataOptions.views, { "id": this.props.tableViewName });
        if (!this.props.tableViewName) {
            // Redirect to first view on default.
            this.props.push(dataOptions.views[0].id);
        }
        const Nav = () => <ul className="nav nav-pills">
            {dataOptions.views.map(e =>
                <li className="nav-item btn-outline-primary" key={e.id}>
                    <a className="nav-link" onClick={() => this.props.push(e.id)}>
                        {e.displayName}
                    </a>
                </li>
            )}
        </ul>;
        if (!dataOptionView) {
            return (<div>
                <Nav />
                <div>No view selected. Please select a view to continue.</div>
            </div>);
        }
        if (dataOptionView.groupEdit) {
            const groupOption = find(dataOptions.groups, { "id": dataOptionView.groupEdit });
            return <div><Nav />
                <GroupEdit groupOption={groupOption}
                    dataOptionView={dataOptionView}
                    onSubmit={(i, e) => this.editGroups(i, e)} /></div>;
        }
        return (
            <div>
                <Nav />
                <ResponseTableView
                    responses={this.props.responses}
                    renderedForm={this.props.form.renderedForm}
                    dataOptionView={dataOptionView}
                    shownResponseDetailId={this.props.shownResponseDetailId}
                    displayResponseDetail={e => this.props.displayResponseDetail(e)}
                    editResponse={(a, b, c) => this.props.editResponse(a, b, c)}
                />
            </div>);
    }
}

const mapStateToProps = state => ({
    ...state.responses,
    form: state.form,
    tableViewName: (state.router.location.pathname.match(/\/(.[a-zA-Z_]*?)$/) || [null, null])[1]
});

const mapDispatchToProps = (dispatch) => ({
    fetchResponses: formId => dispatch(fetchResponses(formId)),
    fetchRenderedForm: formId => dispatch(fetchRenderedForm(formId)),
    setResponsesSelectedView: (e: string) => dispatch(setResponsesSelectedView(e)),
    push: (e: string) => dispatch(push(`./${e}`)),
    editGroups: (e: any) => dispatch(editGroups(e)),
    displayResponseDetail: (e: string) => dispatch(displayResponseDetail(e)),
    editResponse: (a, b, c) => dispatch(editResponse(a, b, c))
});

export default connect(mapStateToProps, mapDispatchToProps)(ResponseTable);