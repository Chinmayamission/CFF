import { IResponse } from "../../store/responses/types";
import {
  IPaymentInfo,
  ConfirmationEmailInfo,
  Schema,
  SchemaModifier,
  IPaymentMethods,
  UiSchema
} from "../../form/interfaces";
import { IHeaderOption } from "../util/Headers";

export interface IFormEditProps {
  data: any;
  match: {
    params: {
      formId: string;
    };
  };
}

export interface IFormEditState {
  schema: Schema;
  uiSchema: UiSchema;
  formOptions: IFormOptions;
  formName: string;
  loading: boolean;
  changeFromEditor: boolean;
  hasError: boolean;
  errorMessage: string;
}

export interface IFormEditPropsOld {
  formId: string;
  data: { res: IFormDBEntry };
}
export interface IFormDBEntry {
  id: string;
  version: number;
  name: string;
  date_last_modified: string;
  date_created: string;
  schema: { [x: string]: any };
  uiSchema: { [x: string]: any };
  formOptions: IFormOptions;
  data: {
    res: IFormDBEntry;
  };
}
export interface IFormOptions {
  paymentInfo: IPaymentInfo;
  paymentMethods: IPaymentMethods;
  confirmationEmailInfo: IConfirmationEmailInfo;
  confirmationEmailTemplates?: IConfirmationEmailTemplate[];
  dataOptions: IDataOptions;
  defaultFormData?: boolean;
  loginRequired?: boolean;
  showConfirmationPage?: boolean;
  successMessage?: string;
  responseModificationEnabled?: boolean;
  responseSubmissionEnabled?: boolean;
}
export interface IRenderedForm {
  schema: { [x: string]: any };
  uiSchema: { [x: string]: any };
  name: string;
  formOptions: IFormOptions;
  _id: { $oid: string };
  cff_permissions?: { [x: string]: string[] };
}

export interface IConfirmationEmailTemplate {
  id: string;
  displayName: string;
  confirmationEmailInfo: IConfirmationEmailInfo;
}

export interface IConfirmationEmailInfo {
  toField: string;
  from: string;
  fromName: string;
  subject: string;
  template?: {
    html?: string;
  };
  cc?: any;
  bcc?: any;
  image?: any;
  showResponse?: any;
  contentFooter?: string;
  contentHeader?: any;
  message?: any;
  totalAmountText?: any;
  columnOrder?: any;
}

export interface IFormEditStateOld {
  form: IFormDBEntry;
  original_form: IFormDBEntry;
  input_form: IFormDBEntry;
  ajaxLoading: boolean;
}
export interface ICouponCode {
  amount: string;
  max: number;
  responses: string[];
  responsesPending: string[];
}
export interface IVersion {
  version: number;
  date_created: string;
  date_last_modified: string;
}

export interface IDBEntry {
  date_created: string;
  date_last_modified: string;
}

export interface ISchemaDBEntry extends IDBEntry {
  value: Schema;
  version: number;
  id: string;
}
export interface ISchemaModifierDBEntry extends IDBEntry {
  value: SchemaModifier;
  paymentMethods: IPaymentMethods;
  confirmationEmailInfo: ConfirmationEmailInfo;
  dataOptions: IDataOptions;
  extraOptions: any;
  paymentInfo: IPaymentInfo;
  version: number;
  id: string;
}
export interface IDataOptions {
  views: IDataOptionView[];
  groups: IGroupOption[];
  export?: {
    type: "google_sheets";
    spreadsheetId?: string;
    filter?: { [x: string]: any }; // {"paid": true}
    enableOrderId?: boolean;
    viewsToShow?: string[];
    enableNearestLocation?: boolean;
    nearestLocationOptions?: {
      addressAccessor?: string; // todo
      locations: { latitude: number; longitude: number; name: string }[];
    };
  }[];
  search?: {
    searchFields?: string[];
    resultLimit?: string[];
    resultFields?: string[];
  };
}
interface IDataOptionView {
  // Common
  unwindBy?: string;
  displayName: string;
  id: string;
  type?: string; // "stats" is only type supported now. TODO: allow other types for google sheets export, regular table view, etc, and make this field non-optional.

  // Response table fields
  columns?: (IHeaderOption | string | string[])[];
  groupEdit?: string;

  // Response summary fields
  stats?: IStatsOption[];

  // Used for google sheets export
  aggregate?: { [x: string]: any }[];
  showCountTotal?: boolean;
}

interface IStatsOption {
  type: string; // Supported: "single" or "group"
  title: string;
  queryType: string; // Supported: "aggregate"
  queryValue: any;

  // Computed by the server when querying the responses endpoint
  computedQueryValue?: string;
}

interface IGroupOption {
  schema: any;
  id: string;
  data?: any;
}
/*
{
    "unwindBy": ".",
    "columns": ["address", "participants", "subscribe", "email", "phone"],
    "display_name": "All Responses",
    "id": "all"
},
{
    "unwindBy": "participants",
    "columns": ["name.last name.first", "age", "orig.email", "orig.phone"],
    "columnNames": ["Name", "Age"]
},

*/
