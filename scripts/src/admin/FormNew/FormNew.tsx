/// <reference path="./FormNew.d.ts"/>
import * as React from 'react';
import { API } from 'aws-amplify';
import "./FormNew.scss";
import {find, pick, get} from "lodash-es";

class FormNew extends React.Component<IFormNewProps, IFormNewState> {
    constructor(props: any) {
        super(props);
        this.state = {
          activated: false,
          schemaList: [],
          selectedSchemaIndex: -1
        }
    }
    loadSchemaList() {
      return API.get("CFF", `centers/${this.props.centerId}/schemas`, {}).then(e => {
          this.setState({ "schemaList": e.res, "activated": true });
      }).catch(e => this.props.onError(e));
    }
    beginNew() {
      this.loadSchemaList();
    }
    selectSchema(e) {
      /* Called when dropdown is changed to update the state. */
      this.setState({selectedSchemaIndex: e.target.value});
    }
    createForm() {
      /* Create the form with the selected schema.*/
      let selectedSchema = this.state.schemaList[this.state.selectedSchemaIndex];
      if (!selectedSchema) {
        throw "The selected schema is not found.";
      }
      selectedSchema = pick(selectedSchema, ["id", "version"])
      return API.post("CFF", `centers/${this.props.centerId}/forms/new`, {
        "body": {"schema": selectedSchema}
      }).then(e => {
        console.log(e.res);
        alert("DONE!" + e.res);
        // this.setState({ "schemaList": e.res, "activated": true });
      }).catch(e => this.props.onError(e));
    }
    componentDidMount() {
    }
    render() {
      if (!this.state.activated) {
        return (
          <button className="btn btn-primary btn-sm"
            onClick={e => this.beginNew()}>
            <span className={`oi oi-plus`}></span>
            Add new form
          </button>
        )
      }
      else {
        return (
          <div>
            <select value={this.state.selectedSchemaIndex}
              onChange={e => this.selectSchema(e)}
              className="form-control form-control-sm">
              <option value={-1}>Select a schema</option>
              {this.state.schemaList && this.state.schemaList.map((e, i) => {
                return <option key={i} value={i}>{get(e, "value.title")} ({e.id} v{e.version})</option>
              })}
            </select>
              <button className="btn btn-primary btn-sm"
              disabled={this.state.selectedSchemaIndex == null}
              onClick={e => this.createForm()}>
              Create the form
            </button>
          </div>
        );
      }
    }
}
export default FormNew;