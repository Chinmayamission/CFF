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
    formOptions: any,
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
    formOptions: {
        paymentInfo: IPaymentInfo,
        paymentMethods: IPaymentMethods,
        confirmationEmailInfo: IConfirmationEmailInfo,
        dataOptions: IDataOptions
    },
    data: {
        res: IFormDBEntry
    }
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

export interface IResponseDBEntry extends IDBEntry {
    value: IResponse,
    form: string,
    user?: string,
    paymentInfo: IPaymentInfo,
    confirmationEmailInfo: ConfirmationEmailInfo,
    update_trail: any,
    payment_trail: any,
    payment_status_detail: any,
    amount_paid: any,
    modifyLink: string,
    paid: boolean
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
    }[]
}