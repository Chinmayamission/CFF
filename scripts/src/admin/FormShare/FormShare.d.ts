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
  onChange: (e: string[]) => void;
}

export interface IUserRowState {
  permissions: any;
}

export interface IPermission {
  [x: string]: boolean;
}
