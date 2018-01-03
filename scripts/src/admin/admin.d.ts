interface IFormAdminPageProps {
    apiEndpoint: string,
    apiKey: string
}
interface IFormAdminPageState {
    formList: any[],
    center: string,
    formId: string,
    status: Number
}
interface IFormListProps extends IFormAdminPageProps {
    loadResponses: (e) => void,
    loadForm: (e) => void,
    formList: any[]
}

interface IFormListState {
}
