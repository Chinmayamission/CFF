import React from "react";
import API from "@aws-amplify/api";
import { isArray } from "lodash";
import "./FormList.scss";
import FormNew from "../FormNew/FormNew";
import { connect } from "react-redux";
import { IFormListProps, IFormListState } from "./FormList.d";
import { loadFormList, createForm } from "../../store/admin/actions";
import Loading from "../../common/Loading/Loading";
import FormListItem from "./FormListItem";

const mapStateToProps = state => ({
  ...state.auth,
  ...state.admin
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadFormList: () => dispatch(loadFormList()),
  createForm: e => dispatch(createForm(e))
});

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
          this.props.loadFormList();
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
            <FormListItem
              key={form._id.$oid}
              form={form}
              delete={e => this.delete(form._id.$oid)}
              highlightForm={() => this.highlightForm(form, form._id.$oid)}
              createForm={() => this.props.createForm(form._id.$oid)}
              highlighted={this.state.highlightedForm === form._id.$oid}
            />
          ))}
        <div className="row">
          <a
            className="help bottom-align-text"
            href="http://docs.chinmayamission.com/cff/"
            target="_blank"
          >
            Help
          </a>
        </div>
      </div>
    );
  }
}

const FormListWrapper = connect(
  mapStateToProps,
  mapDispatchToProps
)(FormList);
export default FormListWrapper;
