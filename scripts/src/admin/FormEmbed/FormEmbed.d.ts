export interface IFormEmbedProps {
    formId: string,
    onError: (any) => void,
    form: IFormListItem
}

export interface IFormEmbedState {
    open: boolean
}