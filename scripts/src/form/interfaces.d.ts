
interface Window {
    paypal: any
}

type schemaType = "object";

interface Schema {
    title: String,
    type?: schemaType,
    description?: String,
    
    [propName: string]: any;
}
interface SchemaModifier {
    
}
interface SchemaMetadata {
    paymentInfo?: IPaymentInfo,
    paymentMethods?: PaymentMethods
    confirmationEmailInfo?: any,
    showConfirmationPage?: boolean,
    successMessage?: string
}

interface IPaymentInfo {
    description?: string,
    total: any,
    currency: string,
    redirectUrl?: string,
    items?: [IPaymentInfoItem]
}

interface IPaymentInfoItem {
    amount?: any,
    name?: string,
    description?: string,
    quantity?: any
}

interface PaymentMethod {
    [propName: string]: any;
}
interface PaymentMethods {
    paypal?: PaymentMethodPayPal;
    [propName: string]: PaymentMethod;
}

interface UiSchema {
    [propName: string]: any;
}

interface Data {
    [propName: string]: any;
}

interface IResponse {
    value: any;
    formId: string;
    resId: string;
    [propName: string]: any;
}

interface IFormPageState {
    schema: Schema,
    schemaMetadata: SchemaMetadata,
    uiSchema: UiSchema,
    status: number,
    step: number,
    data: Data,
    responseId: string,
    responseLoaded: IResponse,
    hasError: boolean,
    paymentInfo: IPaymentInfo,
    paymentInfo_received: IPaymentInfo,
    paymentMethods: IPaymentMethods,
    paymentCalcInfo: IPaymentCalcInfo,
    ajaxLoading: boolean,
    validationInfo: IValidationInfoItem[],
    focusUpdateInfo: IFocusUpdateInfoItem[],
    paymentStarted: boolean
}

interface IValidationInfoItem {fieldPath: string, ifExpr: string, message: string}
interface IFocusUpdateInfoItem {type: string, from: string, to: string, which: string};
interface IFormPageProps {
    formId?: any,
    initialFormData?: any,
    readonly?: boolean,
    specifiedShowFields?: any[],
    onFormLoad?: (Schema, UiSchema) => void,
    form_preloaded?: IFormDBEntry,
    logout: () => void
}

interface IFormConfirmationPageProps {
    schemaMetadata: SchemaMetadata,
    schema: Schema,
    uiSchema: UiSchema,
    data: Data,
    responseId: string,
    formId: string,
    paymentInfo: IPaymentInfo,
    paymentInfo_received: IPaymentInfo,
    paymentMethods: IPaymentMethods,
    goBack: () => void,
    onPaymentComplete: (message: any) => void,
    onPaymentStarted: (message: any) => void
}

interface IFormConfirmationPageState {
    paid: boolean,
    paymentTransactionInfo: string,
    tableData: any,
    tableHeaders: any,
    paymentInfo_owed: IPaymentInfo
}

interface IPaymentProps {
    paymentInfo: IPaymentInfo,
    paymentInfo_owed: IPaymentInfo,
    paymentInfo_received: IPaymentInfo,
    paymentMethods: IPaymentMethods
    onPaymentComplete: (message: any) => void,
    onPaymentError: (message: any) => void,
    onPaymentStarted: (message: any) => void,
    responseId: string,
    formId: string,
    formData: Data
}

interface PaymentOptions {

}
interface IPaymentMethods { // list.

}
interface PaymentMethodPayPal {
    client: {
        sandbox?: String,
        production: String
    },
    env: "client" | "production"
}
interface IScriptLoaderProps {
    isScriptLoaded: boolean,
    isScriptLoadSucceed: boolean,
    onScriptLoaded: any,
    onError: (error: any) => void
}
interface IPaypalProps extends IScriptLoaderProps, IPaymentMethodProps {
    onPaymentComplete: IPaymentProps["onPaymentComplete"],
    onPaymentError: IPaymentProps["onPaymentError"],
    onAuthorize: (data: any, actions: any) => void,
    onCancel: (data: any, actions: any) => void,
    onError: (err: any) => void,
    onClick: () => void,
    paymentMethodInfo: PaymentMethodPayPal
}
interface IPaymentMethodProps {
    paymentInfo: IPaymentInfo,
    confirmationEmailInfo: ConfirmationEmailInfo,
    responseId: string,
    formId: string,
    formData: Data
}
interface ConfirmationEmailInfo {
    from: string,
    cc: string,
    toField: string,
    subject: string,
    message: string
    showResponse: boolean,
    showModifyLink: boolean
}
interface IPaypalState {

}
interface IPaypalClassicProps extends IPaymentMethodProps {
    paymentMethodInfo: IPaymentMethodInfoPaypalClassic,
    paymentInfo_owed: IPaymentInfo,
    paymentInfo_received: IPaymentInfo
    apiEndpoint: string
}
interface PaypalClassicSharedAttrs {
    "cmd": string,
    "business": string,
    items?: IPaymentInfoItem[],
    "first_name": string,
    "last_name": string,
    "image_url": string,
    "address1": string,
    "address2": string,
    "city": string,
    "state": string,
    "zip": string,
    "night_phone_a": string,
    "night_phone_b": string,
    "night_phone_c": string,
    "email": string
}
interface IPaymentMethodInfoPaypalClassic extends PaypalClassicSharedAttrs {
    "sandbox": boolean,
    "payButtonText": string
}
interface IPaypalClassicState extends PaypalClassicSharedAttrs {
    "form_url": string,
    "amount": string,
    "currency_code": string,
    "return": string,
    "cancel_return": string,
    "notify_url": string,
    "custom": string,
    "discount_amount_cart": number,
    "payButtonText": string
}