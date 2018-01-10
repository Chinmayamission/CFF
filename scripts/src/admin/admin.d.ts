interface ObjectId {
    "$oid": string
}
interface IFormAdminPageProps {
    apiEndpoint: string,
    apiKey: string
}
interface IFormAdminPageState {
    formList: IFormListItem[],
    center: string,
    selectedForm: IFormListItem,
    status: Number,
    hasError: boolean
}
interface IFormListItem {
    name: string,
    _id: ObjectId
}
interface IFormListProps extends IFormAdminPageProps {
    loadResponses: (e) => void,
    embedForm: (e) => void,
    editForm: (e) => void,
    formList: any[]
}

interface IFormListState {
}

interface IFormEditProps {
    apiKey: string,
    apiEndpoint: string,
    form: IFormListItem
}

interface IFormEditState {
    schema: ISchemaDBEntry,
    schemaModifier: ISchemaModifierDBEntry,
    loading: boolean
}

interface ISchemaDBEntry {

}
interface ISchemaModifierDBEntry {
    
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