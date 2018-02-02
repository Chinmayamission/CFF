interface IWithAuthenticatorProps {
    authState: string,
    authData: {
        id: string,
        name: string
    }
}
interface IFormAdminPageProps extends IWithAuthenticatorProps {
    apiEndpoint: string,
    apiKey: string,
    federated: any
}
interface ISharedAdminProps {
    apiEndpoint: string,
    apiKey: string
}
interface IFormAdminPageState {
    formList: IFormListItem[],
    center: string,
    selectedForm: IFormListItem,
    status: Number,
    hasError: boolean,
    apiKey: string
}
interface IFormListItem {
    name: string,
    id: string,
    version: Number,
    schema: any,
    schemaModifier: any
}
interface IFormListProps extends ISharedAdminProps {
    loadResponses: (e) => void,
    embedForm: (e) => void,
    editForm: (e) => void,
    formList: any[]
}

interface IFormListState {
}

interface IResponseTableState {
    status: number,
    tableData: any[],
    tableHeaders: any[],
    tableDataOrigObject: any,
    tableDataDisplayed: any[],
    tableHeadersDisplayed: any[],
    pivotCols: any[],
    schema: Schema,
    possibleFieldsToUnwind: string[],
    rowToUnwind: string
}