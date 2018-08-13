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
import "./ResponseTable.scss";


class ResponseTable extends React.Component<IResponseTableProps, IResponseTableState> {
    static defaultProps = {
        editMode: false,
        checkinMode: false
    }

    componentDidMount() {
        this.props.fetchRenderedForm(this.props.match.params.formId).then(() => this.props.fetchResponses(this.props.match.params.formId));
    }

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