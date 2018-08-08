import { IRenderedForm } from "../FormEdit/FormEdit.d";
import { ResponsesState, IFormResponseTableDisplayData } from "../../store/responses/types";
import { IFormListItem } from "../FormList/FormList.d";

export interface IResponseTableProps extends ResponsesState {
    match: {
        params: {
            formId: string,
            tableViewName: string
        },
        url: string
    },
    onError: (any) => void,
    editMode?: boolean,
    checkinMode?: boolean,
    selectedForm: IFormListItem,
    form: IRenderedForm,
    fetchRenderedForm: (x: string) => void,
    fetchResponses: (x: string) => void,
    setFormResponseTableDisplayData: (e: IFormResponseTableDisplayData) => void
}

export interface IResponseTableState {
}