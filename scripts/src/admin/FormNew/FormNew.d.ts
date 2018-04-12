interface IFormNewState {
    activated: boolean,
    schemaList: {
        id: string,
        version: number,
        value?: {
            title?: string
        }
        }[],
    selectedSchemaIndex: number
}


interface IFormNewProps extends ISharedAdminProps {
    centerId: string,
    onError: (any) => void
}