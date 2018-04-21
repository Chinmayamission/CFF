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

interface ISharedFormAdminPageProps {
 match: {
    params: {
        formId?: string
    }
 },
 onError: (any) => void
}

interface IFormAdminPageState {
    formList: IFormListItem[],
    centerList: {id: number, name: string}[],
    center: {id: number, name: string},
    selectedForm: IFormListItem,
    status: number,
    hasError: boolean,
    apiKey: string,
    user: IUserItem,
    loading: boolean
}