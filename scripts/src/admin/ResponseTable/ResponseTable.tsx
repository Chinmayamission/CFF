import { assign, concat, isArray } from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import 'react-table/react-table.css';
import Headers from "src/admin/util/Headers";
import Loading from "src/common/Loading/Loading";
import { fetchRenderedForm } from '../../store/form/actions';
import { fetchResponses, setResponsesSelectedView } from '../../store/responses/actions';
import { IResponseTableProps, IResponseTableState } from "./ResponseTable.d";
import ResponseTableView from "./ResponseTableView";
import "./ResponseTable.scss";
import { push } from 'connected-react-router';


class ResponseTable extends React.Component<IResponseTableProps, IResponseTableState> {

    componentDidMount() {
        this.props.fetchRenderedForm(this.props.match.params.formId).then(() => this.props.fetchResponses(this.props.match.params.formId));
    }

    render() {
        if (!this.props.responses || !this.props.form) {
            return <Loading />;
        }
        return (
            <ResponseTableView
                responses={this.props.responses}
                renderedForm={this.props.form.renderedForm}
                tableViewName={this.props.tableViewName}
                push={(e) => this.props.push(e)}
                />);
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
    push: (e: string) => dispatch(push(`./${e}`))
});

export default connect(mapStateToProps, mapDispatchToProps)(ResponseTable);