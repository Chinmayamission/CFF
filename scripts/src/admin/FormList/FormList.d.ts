interface IFormListItem {
    name: string,
    _id: {$oid: string},
    version: number,
    cff_permissions: {[x: string]: string[]},
    date_last_modified: string,
    date_created: string
}


interface IFormListState {
    formList: IFormListItem[]
}


interface IFormListProps extends IAuthState {
    match: {
        url: string
    },
    selectedForm?: IFormListItem
    onError: (any) => void,
    userId: string
}