import * as React from 'react';
import "./FormCheckin.scss";
import { IFormCheckinProps, IFormCheckinState } from './FormCheckin.d';
import { connect } from "react-redux";
import { fetchResponses, editResponse } from '../../store/responses/actions';
import ReactTable from "react-table";
import { get } from "lodash";
import { fetchRenderedForm } from '../../store/form/actions';
import Headers from '../util/Headers';

class FormCheckin extends React.Component<IFormCheckinProps, IFormCheckinState> {
    constructor(props: any) {
        super(props);
        let data = props.data;
        this.state = {
            searchText: ""
        };
    }

    async componentDidMount() {
        await this.props.fetchRenderedForm(this.props.match.params.formId);
    }

    search() {
        if (this.state.searchText) {
            this.props.fetchResponses(this.props.match.params.formId, this.state.searchText);
        }
        this.props.formState.renderedForm._id
    }

    render() {
        return (<div>
            <form onSubmit={e => { e.preventDefault(); this.search(); return false; }}>
                <div className="input-group">
                    <input type="text" className="form-control cff-input-search" placeholder="Search..." autoComplete="off"
                        value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} />
                    <div className="input-group-append">
                        <button className="btn btn-primary" type="submit">
                            <i className="oi oi-magnifying-glass"></i>
                        </button>
                    </div>
                </div>
            </form>
            {this.props.responsesState.responses && this.props.responsesState.responses.length && this.props.formState.renderedForm &&
                <ReactTable
                    columns={Headers.makeHeaderObjsFromKeys(get(this.props.formState.renderedForm.formOptions, "dataOptions.search.resultFields", ["_id"]), {}, [])}
                    data={this.props.responsesState.responses}
                    minRows={0}
                    showPagination={false}
                />
            }
        </div>);
    }
}

const mapStateToProps = state => ({
    responsesState: state.responses,
    formState: state.form
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    fetchResponses: (a, b) => dispatch(fetchResponses(a, b)),
    editResponse: (a, b, c) => dispatch(editResponse(a, b, c)),
    fetchRenderedForm: (a) => dispatch(fetchRenderedForm(a))
});

export default connect(mapStateToProps, mapDispatchToProps)(FormCheckin);