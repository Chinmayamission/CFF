interface ICenterListState {
    centerList: {
       name: string,
       id: number 
    }[]
}

interface ICenterListProps {
    onError: (any) => void
}