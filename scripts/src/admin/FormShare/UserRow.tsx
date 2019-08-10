import * as React from "react";
import { get } from "lodash";
import Select from "react-select";
import { IUserRowState, IUserRowProps } from "./FormShare.d";

class UserRow extends React.Component<IUserRowProps, IUserRowState> {
  constructor(props: any) {
    super(props);
    this.state = {
      permissions: this.props.permissions.map(e => ({ value: e, label: e }))
    };
  }

  render() {
    return (
      <tr>
        <td>{this.props.user.name}</td>
        <td>{this.props.user.email}</td>
        <td>{this.props.user.id}</td>
        <td>
          <Select
            isMulti
            options={this.props.possiblePermissions.map(e => ({
              value: e,
              label: e
            }))}
            value={this.state.permissions}
            onChange={e => this.setState({ permissions: e })}
            onBlur={e =>
              this.props.onChange(this.state.permissions.map(e => e.value))
            }
          />
        </td>
      </tr>
    );
  }
}
export default UserRow;
