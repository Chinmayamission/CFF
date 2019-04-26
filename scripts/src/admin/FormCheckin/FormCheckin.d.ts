import { ISharedFormAdminPageProps } from "../admin";
import { ResponsesState, IResponse } from "../../store/responses/types";
import { FormState } from "../../store/form/types";

export interface IFormCheckinProps extends ISharedFormAdminPageProps {
    fetchResponses: (a, b, c) => any,
    responsesState: ResponsesState,
    editResponse: (a, b, c) => any,
    editResponseBatch: (a, b) => any,
    fetchRenderedForm: (a) => Promise<any>,
    formState: FormState
}

export interface IFormCheckinState {
    searchText: string,
    autocompleteResults: IResponse[],
    searchFocus: boolean
}