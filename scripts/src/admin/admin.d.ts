import { IFormListItem } from "./FormList/FormList";

export interface IWithAuthenticatorProps {
  authState?: string;
  authData?: {
    id: string;
    name: string;
  };
}
export interface IFormAdminPageProps extends IWithAuthenticatorProps {
  match?: {
    url: string;
  };
}
export interface ISharedAdminProps {}

export interface ISharedFormAdminPageProps {
  match: {
    params: {
      formId?: string;
    };
  };
  onError: (any) => void;
}

export interface IFormAdminPageState {
  formList: IFormListItem[];
  centerList: { id: number; name: string }[];
  center: { id: number; name: string };
  selectedForm: IFormListItem;
  status: number;
  hasError: boolean;
  errorMessage: string;
  apiKey: string;
  user: IUserItem;
  loading: boolean;
}
