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
    status: Number
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
