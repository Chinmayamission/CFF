import * as React from "react";
import API from "@aws-amplify/api";
import dataLoadingView from "../util/DataLoadingView";
import { pickBy } from "lodash";
import UserRow from "./UserRow";
import { IFormShareProps } from "./FormShare.d";
import { IFormShareState } from "./FormShare.d";

const EmbedShortcode = ({ formId }) => {
  const [showCode, setShowCode] = React.useState(false);
  return (
    <>
      <a
        href="#"
        onClick={e => {
          e.preventDefault();
          setShowCode(!showCode);
        }}
      >
        Show embed code
      </a>
      {showCode && (
        <code className="d-block mt-2">
          &lt;iframe frameborder="0" style="width: 100%; height: 100vh" src="
          {`${window.location.protocol}//${window.location.host}/v2/forms/${formId}`}
          "&gt; &lt;/iframe&gt;
        </code>
      )}
    </>
  );
};

class FormShare extends React.Component<IFormShareProps, IFormShareState> {
  constructor(props: any) {
    super(props);
    let data = props.data;
    this.state = {
      possiblePermissions: data["res"]["possiblePermissions"],
      permissions: data["res"]["permissions"],
      users: data["res"]["userLookup"],
      newUserEmail: ""
    };
  }

  async onPermissionsChange(userId, newPermissions) {
    let newPermissionsObject = {};
    for (let permission of newPermissions) {
      newPermissionsObject[permission] = true;
    }
    try {
      let response = await API.post(
        "CFF",
        `forms/${this.props.match.params.formId}/permissions`,
        {
          body: {
            userId: userId,
            permissions: newPermissionsObject
          }
        }
      );
      this.setState({ permissions: response.res.permissions });
    } catch (e) {
      alert("There was an error doing this action.");
      this.props.onError(e);
    }
  }

  async addUser() {
    try {
      let response = await API.post(
        "CFF",
        `forms/${this.props.match.params.formId}/permissions`,
        {
          body: {
            email: this.state.newUserEmail,
            permissions: {}
          }
        }
      );
      this.setState({
        newUserEmail: "",
        permissions: response.res.permissions,
        users: { ...this.state.users, ...response.res.userLookup }
      });
    } catch (e) {
      alert("There was an error doing this action.");
      this.props.onError(e);
    }
  }

  render() {
    const { formId } = this.props.match.params;
    return (
      <div className="">
        <div className="">
          <table className="ccmt-cff-share-list table table-sm table-responsive-sm">
            <thead>
              <tr>
                <th>User Name</th>
                <th>User Email</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.state.permissions).map(userId => (
                <UserRow
                  key={userId}
                  possiblePermissions={this.state.possiblePermissions}
                  user={this.state.users[userId] || {}}
                  permissions={Object.keys(
                    this.state.permissions[userId] || {}
                  ).filter(key => this.state.permissions[userId][key] === true)}
                  onChange={newPermissions => {
                    console.log("new", newPermissions);
                    this.onPermissionsChange(userId, newPermissions);
                  }}
                />
              ))}
              <tr>
                <td colSpan={4}>
                  <form
                    style={{ display: "flex" }}
                    onSubmit={e => {
                      e.preventDefault();
                      this.addUser();
                    }}
                  >
                    <div style={{ flex: "3" }}>
                      <input
                        placeholder="Enter new user email"
                        type="text"
                        value={this.state.newUserEmail}
                        onChange={e =>
                          this.setState({ newUserEmail: e.target.value })
                        }
                        className="form-control form-control-sm"
                      />
                    </div>
                    <div style={{ flex: "1" }}>
                      <button
                        type="submit"
                        className="form-control form-control-sm"
                      >
                        Submit
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr className="my-3" />
        <EmbedShortcode formId={formId} />
      </div>
    );
  }
}

export default dataLoadingView(FormShare, props => {
  return API.get("CFF", `forms/${props.match.params.formId}/permissions`, {});
});
