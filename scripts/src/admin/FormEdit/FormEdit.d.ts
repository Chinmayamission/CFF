/// <reference path="../admin.d.ts"/>
/// <reference path="../../form/interfaces.d.ts"/>

interface IFormEditProps {
    apiKey: string,
    apiEndpoint: string,
    form: IFormListItem,
    match: {
        params: {
            formId: string
        }
    }
}

interface IFormEditState {
    schema: ISchemaDBEntry,
    schemaModifier: ISchemaModifierDBEntry,
    schema_orig: ISchemaDBEntry,
    schemaModifier_orig: ISchemaModifierDBEntry,
    ajaxLoading: boolean,
    dataLoaded: boolean,
    formName: string,
    schema_versions: IVersion[],
    schemaModifier_versions: IVersion[],
    openModal: boolean,
    couponCodes: ICouponCode[],
    couponCodes_used: string[] 
}
interface ICouponCode {
    amount: string,
    max: number,
    responses: string[],
    responsesPending: string[]
}
interface IVersion {
    version: number,
    date_created: string,
    date_last_modified: string
}

interface IResponseDBEntry extends IDBEntry {
    value: IResponse,
    form : {
        id: string,
        version: number
    },
    paymentInfo: IPaymentInfo,
    confirmationEmailInfo: ConfirmationEmailInfo,
    IPN_HISTORY?: [{
        date: string,
        sandbox: boolean,
        value: any
    }],
    IPN_STATUS?: string,
    IPN_TOTAL_AMOUNT?: number,
    modifyLink?: string,
    PAID: boolean
}

interface IDBEntry {
    date_created: string,
    date_last_modified: string
}

interface ISchemaDBEntry extends IDBEntry {
    value: Schema,
    version: number,
    id: string
}
interface ISchemaModifierDBEntry extends IDBEntry {
    value: SchemaModifier,
    paymentMethods: IPaymentMethods,
    confirmationEmailInfo: ConfirmationEmailInfo,
    dataOptions: IDataOptions,
    extraOptions: any,
    paymentInfo: IPaymentInfo,
    version: number,
    id: string
}
interface IDataOptions {
    exportRows?: string[],
    mainTable?: {
        columnOrder?: string[],
        aggregateCols?: string[]
    },
    checkinTable?: {
        columnOrder?: string[],
        aggregateCols?: string[]
    },
    unwindTables?: {
        [columnName:string]: {
            columnOrder?: string[],
            aggregateCols?: string[]
        }
    }[]
}