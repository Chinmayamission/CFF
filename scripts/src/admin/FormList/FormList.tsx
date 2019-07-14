import * as React from "react";
import { API } from "aws-amplify";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import { isArray } from "lodash";
import "./FormList.scss";
import FormNew from "../FormNew/FormNew";
import { connect } from "react-redux";
import dataLoadingView from "../util/DataLoadingView";
import { IFormListProps, IFormListState } from "./FormList.d";
import { loadFormList, createForm } from "../../store/admin/actions";
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";
import history from "../../history";
import Loading from "../../common/Loading/Loading";
import FormPageMenu from "../FormPageMenu";

const mapStateToProps = state => ({
  ...state.auth,
  ...state.admin
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadFormList: () => dispatch(loadFormList()),
  createForm: e => dispatch(createForm(e))
});

function hashCode(str) {
  // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(number) {
  return "#" + (number >>> 0).toString(16).slice(-6);
}

export function hasPermission(cff_permissions, permissionNames, userId) {
  if (!isArray(permissionNames)) {
    permissionNames = [permissionNames];
  }
  permissionNames.push("owner");
  if (cff_permissions && cff_permissions[userId]) {
    for (let permissionName of permissionNames) {
      if (cff_permissions[userId][permissionName] == true) {
        return true;
      }
    }
    return false;
  }
  return false;
}

class FormList extends React.Component<IFormListProps, IFormListState> {
  constructor(props: any) {
    super(props);
    this.render = this.render.bind(this);
    this.state = {
      highlightedForm: ""
    };
  }
  componentDidMount() {
    this.props.loadFormList();
  }
  showEmbedCode(formId) {}
  delete(formId) {
    if (
      confirm(
        "Are you sure you want to delete this form (this cannot be undone)?"
      )
    ) {
      API.del("CFF", `/forms/${formId}`, {})
        .then(e => {
          alert("Form deleted!");
          window.location.reload();
        })
        .catch(e => {
          alert(`Delete failed: ${e}`);
        });
    }
  }
  highlightForm(form, formId) {
    this.setState({ highlightedForm: formId });
  }

  render() {
    let formList = this.props.selectedForm
      ? [this.props.selectedForm]
      : this.props.formList;

    if (!formList) {
      return <Loading />;
    }
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm">
            Right click on a form to perform an action.
          </div>
          <div className="col-sm d-none d-sm-block">&nbsp;</div>
          <div className="col-sm d-none d-sm-block">&nbsp;</div>
          <div className="col-sm">
            <FormNew onError={this.props.onError} />
          </div>
        </div>
        {formList && formList.length == 0 && "No forms found."}
        {formList &&
          formList.map(form => (
            <React.Fragment key={form["_id"]["$oid"]}>
              <ContextMenuTrigger id={form["_id"]["$oid"]}>
                <div
                  className="row"
                  style={{
                    padding: 10,
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #aaa",
                    backgroundColor:
                      form["_id"]["$oid"] === this.state.highlightedForm
                        ? "lightblue"
                        : "white"
                  }}
                  onClick={() => this.highlightForm(form, form["_id"]["$oid"])}
                  key={form["_id"]["$oid"]}
                  onContextMenu={() =>
                    this.highlightForm(form, form["_id"]["$oid"])
                  }
                >
                  <div className="col-sm">{form["name"]}</div>
                  <div className="col-sm d-none">
                    Modified{" "}
                    {new Date(
                      form["date_modified"]["$date"]
                    ).toLocaleDateString()}
                  </div>
                  <div className="col-sm d-none">
                    Created{" "}
                    {new Date(
                      form["date_created"]["$date"]
                    ).toLocaleDateString()}
                  </div>
                  <div className="col-sm">
                    {form["tags"] &&
                      form["tags"].map(tag => (
                        <div
                          className="badge badge-secondary"
                          style={{ backgroundColor: intToRGB(hashCode(tag)) }}
                        >
                          {tag}
                        </div>
                      ))}
                  </div>
                </div>
              </ContextMenuTrigger>
              {this.state.highlightedForm === form._id.$oid && (
                <div className="d-block d-sm-none">
                  <FormPageMenu
                    formId={form._id.$oid}
                    ItemComponent={props => (
                      <button className="btn btn-sm btn-outline-primary">
                        {props.children}
                      </button>
                    )}
                    onDelete={e => this.delete(form._id.$oid)}
                    onDuplicate={e => this.props.createForm(form._id.$oid)}
                  />
                </div>
              )}
              <ContextMenu
                className="d-none d-sm-block"
                id={form["_id"]["$oid"]}
              >
                <FormPageMenu
                  formId={form._id.$oid}
                  ItemComponent={props => <MenuItem>{props.children}</MenuItem>}
                  onDelete={e => this.delete(form._id.$oid)}
                  onDuplicate={e => this.props.createForm(form._id.$oid)}
                />
              </ContextMenu>
            </React.Fragment>
          ))}
      </div>
    );
  }
}

const FormListWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(FormList);
export default FormListWrapper;
