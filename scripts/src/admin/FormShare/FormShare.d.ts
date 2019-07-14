import { ISharedFormAdminPageProps } from "../admin";

export interface IFormShareProps extends ISharedFormAdminPageProps {
  data: any;
  refreshData: () => any;
}

export interface IFormShareState {
  permissions: any;
  users: any;
  possiblePermissions: string[];
  newUserEmail: string;
}

export interface IUserRowProps {
  user: any;
  permissions: any;
  possiblePermissions: string[];
  onPermissionsChange: (string, string, boolean) => void;
}

export interface IUserRowState {}

export interface IPermission {
  [x: string]: boolean;
}
