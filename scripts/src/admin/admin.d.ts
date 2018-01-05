interface IFormAdminPageProps {
    apiEndpoint: string,
    apiKey: string
}
interface IFormAdminPageState {
    formList: any[],
    center: string,
    selectedForm: any,
    status: Number
}
interface IFormListItem {
    // name, _id.
}
interface IFormListProps extends IFormAdminPageProps {
    loadResponses: (e) => void,
    loadForm: (e) => void,
    formList: any[]
}

interface IFormListState {
}
