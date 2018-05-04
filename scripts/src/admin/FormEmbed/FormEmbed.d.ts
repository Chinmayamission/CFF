interface IFormEmbedProps {
    formId: string,
    onError: (any) => void,
    form: IFormListItem
}

interface IFormEmbedState {
    open: boolean
}