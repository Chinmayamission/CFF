import { IAuthState } from "../store/auth/types";
import { IFormDBEntry } from "../admin/FormEdit/FormEdit.d";
import { IPaymentCalcInfo } from "./payment/PaymentCalcTable.d";

export interface Window {
  paypal: any;
}

export interface Schema {
  title?: string;
  type?: string;
  description?: string;

  [propName: string]: any;
}
export interface SchemaModifier {}
export interface SchemaMetadata {
  paymentInfo?: IPaymentInfo;
  paymentMethods?: PaymentMethods;
  confirmationEmailInfo?: any;
  showConfirmationPage?: boolean;
  successMessage?: string;
}

export interface IPaymentInfo {
  description?: string;
  total: any;
  currency?: string;
  currencyTemplate?: string;
  redirectUrl?: string;
  paymentInfoTableTitle?: string;
  items?: IPaymentInfoItem[];
}

export interface IPaymentInfoReceived {
  currency: string;
  total: number;
}

export interface IPaymentInfoItem {
  amount?: any;
  name?: string;
  description?: string;
  quantity?: any;
  total?: any;
  recurrenceDuration?: string;
  recurrenceTimes?: string;
  installment?: boolean;
}

export interface PaymentMethod {
  [propName: string]: any;
}
export interface PaymentMethods {
  [propName: string]: PaymentMethod;
}

export interface UiSchema {
  [propName: string]: any;
}

export interface Data {
  [propName: string]: any;
}

export interface IFormPageState {
  cff_permissions: any;
  schema: Schema;
  schemaMetadata: SchemaMetadata;
  formOptions: any;
  uiSchema: UiSchema;
  status: number;
  step: number;
  data: Data;
  responseId: string;
  hasError: boolean;
  errorMessage: string;
  paymentInfo: IPaymentInfo;
  paymentInfo_received: IPaymentInfoReceived;
  paymentMethods: IPaymentMethods;
  paymentCalcInfo: IPaymentCalcInfo;
  ajaxLoading: boolean;
  paymentStarted: boolean;
  predicate: {
    id: boolean;
  };
  responseMetadata: IResponseMetadata;
}

export interface IFormPageProps {
  // extends FormState
  formId?: any;
  responseId?: string;
  initialFormData?: any;
  readonly?: boolean;
  specifiedShowFields?: any[];
  onFormLoad?: (e: any) => void;
  form_preloaded?: IFormDBEntry;
  logout: () => void;
  auth: IAuthState;
  loading: boolean;
  fetchRenderedForm: () => void;
  mode?: string;
  className?: string;
}

export interface IFormConfirmationPageProps {
  schemaMetadata: SchemaMetadata;
  schema: Schema;
  uiSchema: UiSchema;
  data: Data;
  responseMetadata: IResponseMetadata;
  responseId: string;
  formId: string;
  paymentInfo: IPaymentInfo;
  paymentInfo_received: IPaymentInfoReceived;
  paymentMethods: IPaymentMethods;
  goBack: () => void;
  onPaymentComplete: (message: any) => void;
  onPaymentStarted: (message: any) => void;
}

export interface IFormConfirmationPageState {
  paid: boolean;
  paymentTransactionInfo: string;
  tableData: any;
  tableHeaders: any;
  paymentInfo_owed: IPaymentInfoReceived;
}

export interface IResponseMetadata {
  date_created?: string;
}

export interface IPaymentProps {
  paymentInfo: IPaymentInfo;
  paymentInfo_owed: IPaymentInfoReceived;
  paymentInfo_received: IPaymentInfoReceived;
  paymentMethods: IPaymentMethods;
  onPaymentComplete: (message: any) => void;
  onPaymentError: (message: any) => void;
  onPaymentStarted: (message: any) => void;
  responseId: string;
  formId: string;
  formData: Data;
  responseMetadata: IResponseMetadata;
}

export interface PaymentOptions {}
export interface IPaymentMethods {
  // list.
}

export interface IScriptLoaderProps {
  isScriptLoaded: boolean;
  isScriptLoadSucceed: boolean;
  onScriptLoaded: any;
  onError: (error: any) => void;
}

export interface IPaymentMethodProps {
  paymentInfo: IPaymentInfo;
  confirmationEmailInfo: ConfirmationEmailInfo;
  responseId: string;
  formId: string;
  formData: Data;
  paymentInfo_owed: IPaymentInfoReceived;
  paymentInfo_received: IPaymentInfoReceived;
  apiEndpoint: string;
}
export interface ConfirmationEmailInfo {
  from: string;
  cc: string;
  toField: string;
  subject: string;
  message: string;
  showResponse: boolean;
  showModifyLink: boolean;
}
export interface IPaypalState {}
export interface IPaypalClassicProps extends IPaymentMethodProps {
  paymentMethodInfo: IPaymentMethodInfoPaypalClassic;
}

export interface ICCAvenueProps extends IPaymentMethodProps {
  paymentMethodInfo: IPaymentMethodInfoCCAvenue;
}

export interface IPaymentMethodInfoCCAvenue
  extends IPaymentMethodInfoSharedProps {
  encRequest: string;
  access_code: string;
}

export interface PaypalClassicSharedAttrs {
  cmd: string;
  business: string;
  items?: IPaymentInfoItem[];
  first_name: string;
  last_name: string;
  image_url: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  night_phone_a: string;
  night_phone_b: string;
  night_phone_c: string;
  email: string;
}
export interface IPaymentMethodInfoPaypalClassic
  extends PaypalClassicSharedAttrs,
    IPaymentMethodInfoSharedProps {
  sandbox: boolean;
}
export interface IPaypalClassicState extends PaypalClassicSharedAttrs {
  form_url: string;
  amount: string;
  currency_code: string;
  return: string;
  cancel_return: string;
  notify_url: string;
  custom: string;
  discount_amount_cart: number;
  payButtonText: string;
  recurrence?: {
    a3: string;
    p3: string;
    t3: string;
    item_name: string;
    srt?: string;
  };
}
export interface IPaymentMethodInfoSharedProps {
  redirectUrl?: string;
  payButtonText?: string;
}
