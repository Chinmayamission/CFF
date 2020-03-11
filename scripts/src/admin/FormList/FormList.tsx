import React from "react";
import API from "@aws-amplify/api";
import { isArray, find, debounce } from "lodash";
import "./FormList.scss";
import FormNew from "../FormNew/FormNew";
import { connect } from "react-redux";
import { IFormListProps, IFormListState, IFormListItem } from "./FormList.d";
import { loadFormList, createForm, editForm } from "../../store/admin/actions";
import Loading from "../../common/Loading/Loading";
import FormListItem from "./FormListItem";
import Fuse from "fuse.js";

const mapStateToProps = state => ({
  ...state.auth,
  ...state.admin
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  loadFormList: () => dispatch(loadFormList()),
  createForm: e => dispatch(createForm(e)),
  editForm: (i, e) => dispatch(editForm(i, e))
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

const options = {
  shouldSort: true,
  threshold: 0.2,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["name", "tags"]
};

class FormList extends React.Component<IFormListProps, IFormListState> {
  fuse: any;
  constructor(props: any) {
    super(props);
    this.render = this.render.bind(this);
    this.state = {
      highlightedForm: "",
      query: "",
      filteredItemIds: []
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
  runSearch = debounce(
    query => {
      let fuse = new Fuse(this.props.formList, options);
      const filteredItemIds = fuse
        .search(query)
        .map(e => (e as IFormListItem)._id.$oid);
      this.setState({
        filteredItemIds
      });
    },
    500,
    { leading: true }
  );
  search(query) {
    this.setState({ query });
    this.runSearch(query);
  }

  render() {
    let formList = this.props.selectedForm
      ? [this.props.selectedForm]
      : this.props.formList;
    if (!formList) {
      return <Loading />;
    }
    const allTags = [
      ...new Set([].concat.apply([], formList.map(e => e.tags || [])))
    ] as string[];
    const filteredFormList = this.state.query
      ? this.state.filteredItemIds.map(id =>
          find(formList, { _id: { $oid: id } })
        )
      : formList;
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm">
            <div className="input-group">
              <input
                className="form-control py-2 border-right-0 border"
                type="search"
                placeholder="Search"
                value={this.state.query}
                onChange={e => this.search(e.target.value)}
                list="ccmt-cff-form-search-datalist"
              />
              <datalist id="ccmt-cff-form-search-datalist">
                {allTags.map(tag => (
                  <option key={tag} value={tag} />
                ))}
              </datalist>
              <span className="input-group-append">
                <div className="input-group-text">
                  <i className="oi oi-magnifying-glass"></i>
                </div>
              </span>
            </div>
          </div>
          <div className="col-sm d-none d-sm-block">&nbsp;</div>
          <div className="col-sm d-none d-sm-block">&nbsp;</div>
          <div className="col-sm">
            <FormNew onError={this.props.onError} />
          </div>
        </div>
        {filteredFormList && filteredFormList.length == 0 && "No forms found."}
        {filteredFormList.map(form => (
          <FormListItem
            key={form._id.$oid}
            form={form}
            delete={e => this.delete(form._id.$oid)}
            highlightForm={() => this.highlightForm(form, form._id.$oid)}
            createForm={() => this.props.createForm(form._id.$oid)}
            highlighted={this.state.highlightedForm === form._id.$oid}
            allTags={allTags}
            onTagChange={tags => this.props.editForm(form._id.$oid, { tags })}
            hasPermission={perm =>
              hasPermission(form.cff_permissions, perm, this.props.userId)
            }
          />
        ))}
        <div className="footer">
          <a
            className="help"
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
