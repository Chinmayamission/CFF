import { IResponse } from "../../store/responses/types";
import { IPaymentInfo, ConfirmationEmailInfo, Schema, SchemaModifier, IPaymentMethods } from "../../form/interfaces";

export interface IFormEditProps {
    data: any,
    match: {
        params: {
            formId: string
        }
    }
}

export interface IFormEditState {
    schema: Schema,
    uiSchema: UiSchema,
    formOptions: IFormOptions,
    formName: string,
    loading: boolean
}

export interface IFormEditPropsOld {
    formId: string,
    data: {res: IFormDBEntry}
}
export interface IFormDBEntry {
    id: string,
    version: number,
    name: string,
    date_last_modified: string,
    date_created: string,
    schema: {[x: string]: any}
    uiSchema: {[x: string]: any},
    formOptions: IFormOptions,
    data: {
        res: IFormDBEntry
    }
}
export interface IFormOptions {
    paymentInfo: IPaymentInfo,
    paymentMethods: IPaymentMethods,
    confirmationEmailInfo: IConfirmationEmailInfo,
    dataOptions: IDataOptions
}
export interface IRenderedForm {
    schema: {[x: string]: any},
    uiSchema: {[x: string]: any},
    name: string
    formOptions: IFormOptions,
    _id: {"$oid": string}
}
export interface IConfirmationEmailInfo {
    toField: string,
    from: string,
    fromName: string,
    subject: string,
    template?: {
        html?: string
    }
    cc?: any,
    bcc?: any;
    image?: any,
    showResponse?: any,
    contentFooter?: string,
    contentHeader?: any,
    message?: any,
    totalAmountText?: any,
    columnOrder?: any
}

export interface IFormEditStateOld {
    form: IFormDBEntry,
    original_form: IFormDBEntry,
    input_form: IFormDBEntry,
    ajaxLoading: boolean
}
export interface ICouponCode {
    amount: string,
    max: number,
    responses: string[],
    responsesPending: string[]
}
export interface IVersion {
    version: number,
    date_created: string,
    date_last_modified: string
}

export interface IDBEntry {
    date_created: string,
    date_last_modified: string
}

export interface ISchemaDBEntry extends IDBEntry {
    value: Schema,
    version: number,
    id: string
}
export interface ISchemaModifierDBEntry extends IDBEntry {
    value: SchemaModifier,
    paymentMethods: IPaymentMethods,
    confirmationEmailInfo: ConfirmationEmailInfo,
    dataOptions: IDataOptions,
    extraOptions: any,
    paymentInfo: IPaymentInfo,
    version: number,
    id: string
}
export interface IDataOptions {
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
    }[],
    views: IDataOptionView[],
    groups: IGroupOption[]
}
interface IDataOptionView {
    unwindBy?: string,
    displayName: string,
    id: string,
    columns?: ({
        label: string,
        value: string
    } | string)[],
    groupEdit?: string
}
interface IGroupOption {
    schema: any,
    id: string,
    data?: any
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