interface ICenterListState {
    centerList: {
       name: string,
       id: number 
    }[]
}

interface ICenterListProps {
    onError: (any) => void,
    user: IUserItem,
    history: {goBack: () => void, push: (string) => void},
    selectedCenter: boolean
}
interface IUserItem {
    id: string,
    name: string,
    email: string
}