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


interface IFormNewProps {
    centerId: number,
    onError: (any) => void
}