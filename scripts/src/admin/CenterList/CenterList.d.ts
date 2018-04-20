interface ICenterListState {
    centerList: {
       name: string,
       id: number 
    }[]
}

interface ICenterListProps {
    onError: (any) => void,
    user: IUserItem,
    history: {goBack: () => void}
}
interface IUserItem {
    id: string,
    name: string,
    email: string
}