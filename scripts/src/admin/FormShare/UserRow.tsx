import React from "react";
import Select from "react-select";

interface IUserRowProps {
  user: any;
  permissions: any;
  possiblePermissions: string[];
  onChange: (e: string[]) => void;
}

function UserRow(props: IUserRowProps) {
  return (
    <tr>
      <td>{props.user.name}</td>
      <td>{props.user.email}</td>
      <td style={{ display: "none" }}>{props.user.id}</td>
      <td>
        <Select
          isMulti
          options={props.possiblePermissions.map(e => ({ label: e, value: e }))}
          value={props.permissions.map(e => ({ label: e, value: e }))}
          onChange={e => props.onChange(e.map(i => i.value))}
          style={{ maxWidth: 600 }}
        />
      </td>
    </tr>
  );
}
export default UserRow;
