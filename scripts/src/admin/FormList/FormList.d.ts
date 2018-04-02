interface IFormListItem {
    name: string,
    id: string,
    version: Number,
    schema: any,
    schemaModifier: any
}


interface IFormListState {
    formList: IFormListItem[]
}


interface IFormListProps extends ISharedAdminProps {
    match: {
        url: string,
        params: {
            centerName: string,
            centerId: Number
        }
    },
    onError: (any) => void
}