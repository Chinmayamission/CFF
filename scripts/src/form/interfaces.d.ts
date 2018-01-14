
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
    confirmationEmailInfo?: any
}

interface IPaymentInfo {
    total: string,
    currency: string
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
    paymentInfo_old: IPaymentInfo
}

interface IFormPageProps {
    formId: any,
    apiEndpoint: string,
    initialFormData?: any,
    readonly?: boolean
}

interface IFormConfirmationPageProps {
    schemaMetadata: SchemaMetadata,
    schema: Schema,
    uiSchema: UiSchema,
    data: Data,
    responseId: string,
    apiEndpoint: string,
    formId: string,
    paymentInfo: IPaymentInfo,
    paymentInfo_old: IPaymentInfo,
    goBack: () => void,
    onPaymentComplete: (message: any) => void
}

interface IFormConfirmationPageState {
    paid: boolean,
    paymentTransactionInfo: string,
    tableData: any,
    tableHeaders: any
}

interface IPaymentProps {
    paymentInfo: IPaymentInfo,
    paymentInfo_old: IPaymentInfo,
    paymentMethods: IPaymentMethods
    onPaymentComplete: (message: any) => void,
    onPaymentError: (message: any) => void,
    responseId: string,
    formId: string,
    apiEndpoint: string
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
interface IPaypalProps extends IScriptLoaderProps {
    onPaymentComplete: IPaymentProps["onPaymentComplete"],
    onPaymentError: IPaymentProps["onPaymentError"],
    onAuthorize: (data: any, actions: any) => void,
    onCancel: (data: any, actions: any) => void,
    onError: (err: any) => void,
    onClick: () => void,
    paymentInfo: IPaymentInfo,
    paymentMethodInfo: PaymentMethodPayPal,
    confirmationEmailInfo: ConfirmationEmailInfo
    responseId: string,
    apiEndpoint: string,
    formId: string
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