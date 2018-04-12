interface ICenterListState {
    centerList: {
       name: string,
       id: number 
    }[]
}

interface ICenterListProps {
    onError: (any) => void,
    user: IUserItem
}
interface IUserItem {
    id: string,
    name: string,
    email: string
}