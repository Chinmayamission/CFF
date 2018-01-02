
interface Window {
    paypal: any
}

type schemaType = "object";

interface Schema {
    title: String,
    type?: schemaType,
    description?: String,
    paymentInfo?: PaymentInfo,
    paymentMethods?: PaymentMethods
    [propName: string]: any;
}

interface PaymentInfo {
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

interface IFormPageState {
    schema: Schema,
    uiSchema: UiSchema,
    status: number,
    step: number,
    data: Data
}

interface IFormPageProps {
    formId: any
}

interface IFormConfirmationPageProps {
    schema: Schema,
    uiSchema: UiSchema,
    data: Data,
    goBack: () => void
}

interface IFormConfirmationPageState {
    paid: boolean,
    paymentTransactionInfo: string
}

interface IPaymentProps {
    schema: Schema,
    onPaymentComplete: (message: any) => void,
    onPaymentError: (message: any) => void
}

interface PaymentOptions {

}
interface PaymentMethodPayPal {
    client: {
        sandbox?: String,
        production: String
    },
    env: "client" | "production";
}
interface IScriptLoaderProps {
    isScriptLoaded: boolean,
    isScriptLoadSucceed: boolean,
    onScriptLoaded: any,
    onError: (error: any) => void
}
interface IPaypalProps { //extends IScriptLoaderProps {
    onPaymentComplete: IPaymentProps["onPaymentComplete"],
    onPaymentError: IPaymentProps["onPaymentError"],
    onAuthorize: (data: any, actions: any) => void,
    onCancel: (data: any, actions: any) => void,
    onError: (err: any) => void,
    onClick: () => void,
    paymentInfo: PaymentInfo,
    paymentMethodInfo: PaymentMethodPayPal,
    isScriptLoaded: boolean,
    isScriptLoadSucceed: boolean
}
interface IPaypalState {

}