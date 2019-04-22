import * as React from 'react';
import "./FormCheckin.scss";
import { IFormCheckinProps, IFormCheckinState } from './FormCheckin.d';
import { connect } from "react-redux";
import { fetchResponses, editResponse } from '../../store/responses/actions';
import ReactTable from "react-table";
import { get } from "lodash";
import { fetchRenderedForm } from '../../store/form/actions';
import Headers from '../util/Headers';

const raceRowStyle = {
    "Half Marathon": { "backgroundColor": "rgb(255, 78, 80)" },
    "10K": { "backgroundColor": "rgb(252, 251, 227)", "color": "white" },
    "5K": { "backgroundColor": "rgb(0, 255, 0)" },
    "Mela": { "backgroundColor": "rgb(164, 194, 244)" }

}
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
    }

    checkIn(responseId, index) {
        
    }
    
    checkInAll(responseId) {
        
    }

     showResults(response) {
         return(<div className="card" style={{ width: '100%' }}>
                  <div className="card-body">
                    <h5 className="card-title">{response.value.contact_name.first} {response.value.contact_name.last}</h5>
                    <div className="card-text">
                        <div>{response._id.$oid.substring(0, 4)}</div>
                        <div>{response.value.email}</div>
                        <table className="table table-sm table-responsive">
                            <tbody>
                                {response.value.participants.map((participant, i) => <tr style={raceRowStyle[participant.race]}>
                                    <td>{participant.name.last}</td>
                                    <td>{participant.name.first}</td>
                                    <td>{participant.shirt_size}</td>
                                    {/* <td>{participant.age}</td> */}
                                    {/* <td>{participant.gender}</td> */}
                                    <td>{participant.race}</td>
                                    <td>{participant.bib_number}</td>
                                    <td>
                                        <input type="checkbox"
                                            checked={participant.checkin}
                                            onChange={e => this.props.editResponse(response._id.$oid, `participants.${i}.checkin`, e.target.checked)} />
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                    {/* <a className="btn btn-sm" onChange={e => this.checkInAll(response._id.$oid)}>Check in all</a> */}
                </div>
            </div>)

    }

    render() {
        return (<div>
            <form onSubmit={e => { e.preventDefault(); this.search(); return false; }}>
                <div className=" d-none d-sm-block">
                    <div className="input-group">
                        <input type="text" className="form-control cff-input-search" placeholder="Search..." autoComplete="off"
                            value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} />
                        <div className="input-group-append">
                            <button className="btn btn-primary" type="submit">
                                <i className="oi oi-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                    {this.props.responsesState.responses && this.props.responsesState.responses.length > 0 && this.props.formState.renderedForm && this.props.responsesState.responses.map(response =>
                        <div className="card" style={{ width: '100%' }}>
                        <div className="card-body">
                          <h5 className="card-title">{response.value.contact_name.first} {response.value.contact_name.last}</h5>
                          <div className="card-text">
                              <div>{response._id.$oid.substring(0, 4)}</div>
                              <div>{response.value.email}</div>
                              <table className="table table-sm table-responsive">
                                  <tbody>
                                      {response.value.participants.map((participant, i) => <tr style={raceRowStyle[participant.race]}>
                                          <td>{participant.name.last}</td>
                                          <td>{participant.name.first}</td>
                                          <td>{participant.shirt_size}</td>
                                          {/* <td>{participant.age}</td> */}
                                          {/* <td>{participant.gender}</td> */}
                                          <td>{participant.race}</td>
                                          <td>{participant.bib_number}</td>
                                          <td>
                                              <input type="checkbox"
                                                  checked={participant.checkin}
                                                  onChange={e => this.props.editResponse(response._id.$oid, `participants.${i}.checkin`, e.target.checked)} />
                                          </td>
                                      </tr>)}
                                  </tbody>
                              </table>
                          </div>
                          {/* <a className="btn btn-sm" onChange={e => this.checkInAll(response._id.$oid)}>Check in all</a> */}
                      </div>
                  </div>
                    )}
                    
                </div>
                <div className="d-block d-sm-none" >
                    <div className="input-group" style={{ position: 'sticky', top: 0, zIndex: 99999 }}>
                        <input type="text" className="form-control cff-input-search" placeholder="Search..." autoComplete="off"
                            value={this.state.searchText} onChange={e => this.setState({ searchText: e.target.value })} />
                        <div className="input-group-append">
                            <button className="btn btn-primary" type="submit">
                                <i className="oi oi-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                    {this.props.responsesState.responses && this.props.responsesState.responses.length > 0 && this.props.formState.renderedForm && this.props.responsesState.responses.map(response =>

                        <div className="card" style={{ width: '100%' }}>
                            <div className="card-body">
                                <h5 className="card-title">{response.value.contact_name.first} {response.value.contact_name.last}</h5>
                                <div className="card-text">
                                    <div>{response._id.$oid.substring(0, 4)}</div>
                                    <div>{response.value.email}</div>
                                    <table className="table table-sm table-responsive">
                                        <tbody>
                                            {response.value.participants.map((participant, i) => <tr style={raceRowStyle[participant.race]}>
                                                <td>{participant.name.last}</td>
                                                <td>{participant.name.first}</td>
                                                <td>{participant.shirt_size}</td>
                                                {/* <td>{participant.age}</td> */}
                                                {/* <td>{participant.gender}</td> */}
                                                <td>{participant.race}</td>
                                                <td>{participant.bib_number}</td>
                                                <td>
                                                    <input type="checkbox"
                                                        checked={participant.checkin}
                                                        onChange={e => this.props.editResponse(response._id.$oid, `participants.${i}.checkin`, e.target.checked)} />
                                                </td>
                                            </tr>)}
                                        </tbody>
                                    </table>
                                </div>
                                {/* <a className="btn btn-sm" onChange={e => this.checkInAll(response._id.$oid)}>Check in all</a> */}
                            </div>
                        </div>
                    )
                    }
                </div>
            </form>
            <div>

            </div>
            {this.props.responsesState.responses && this.props.responsesState.responses.length === 0 &&
                <div className="mt-4">
                    No results found.
                </div>}
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