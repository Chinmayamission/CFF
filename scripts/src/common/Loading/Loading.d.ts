export interface ILoadingProps {
    hasError?: boolean
    onClose?: () => void
}
export interface ILoadingState {
    open: boolean
}