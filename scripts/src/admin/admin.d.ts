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
    centerList: {id: number, name: string}[],
    center: {id: number, name: string},
    selectedForm: IFormListItem,
    status: Number,
    hasError: boolean,
    apiKey: string,
    userId: string
}
interface IFormListItem {
    name: string,
    id: string,
    version: Number,
    schema: any,
    schemaModifier: any
}
interface IFormListProps extends ISharedAdminProps {
    match: {
        url: string,
        params: {
            centerName: string,
            centerId: Number
        }
    }
}

interface IFormListState {
    formList: IFormListItem[]
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
    dataOptions: IDataOptions,
    possibleFieldsToUnwind: string[],
    rowToUnwind: string,
    colsToAggregate: any[]
}