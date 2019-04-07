import { IAuthState } from "../../store/auth/types";
import { IAdminState } from "../../store/admin/types";

export interface IFormListItem {
    name: string,
    _id: {$oid: string},
    version: number,
    cff_permissions: {[x: string]: string[]},
    date_modified: string,
    date_created: string,
    tags: string[]
}


export interface IFormListState {
    highlightedForm: string
}


export interface IFormListProps extends IAuthState, IAdminState {
    match: {
        url: string
    },
    selectedForm?: IFormListItem
    onError: (any) => void,
    userId: string,
    data: any,
    loadFormList: () => void,
    createForm: (e?: string) => void
}