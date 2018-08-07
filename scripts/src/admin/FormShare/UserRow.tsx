import * as React from 'react';
import {get} from "lodash-es";
import Switch from 'react-toggle-switch';
import "react-toggle-switch/dist/css/switch.min.css";
import { IUserRowState, IUserRowProps } from './FormShare.d';

class UserRow extends React.Component<IUserRowProps, IUserRowState> {
    constructor(props:any) {
        super(props);
        this.state = {
        }
    }

    render() {
      return (<tr>
          <td>{this.props.user.name}</td>
          <td>{this.props.user.email}</td>
          <td>{this.props.user.id}</td>
          {this.props.possiblePermissions.map(permissionName => {
              let key = `${this.props.user.id}-${permissionName}`;
              let checked = get(this.props.permissions, permissionName) == true ? true : false;
              return (
              <td key={`td${key}`}>
                <Switch onClick={e => this.props.onPermissionsChange(this.props.user.id, permissionName, !checked)} on={checked} />
              </td>);
            }
          )}
      </tr>);
    }
}
export default UserRow;