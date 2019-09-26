import { ISharedFormAdminPageProps } from "../admin";
import { ResponsesState, IResponse } from "../../store/responses/types";
import { FormState } from "../../store/form/types";
import { IAuthState } from "../../store/auth/types";

export interface IFormCheckinProps extends ISharedFormAdminPageProps {
  fetchResponses: (e) => any;
  responsesState: ResponsesState;
  authState: IAuthState;
  editResponse: (a, b, c) => any;
  editResponseBatch: (a, b) => any;
  fetchRenderedForm: (a) => Promise<any>;
  formState: FormState;
  displayResponseDetail: (e: string) => Promise<any>;
}

export interface IFormCheckinState {
  searchText: string;
  autocompleteResults: IResponse[];
  searchFocus: boolean;
  isEditor: boolean;
  showUnpaid: boolean;
}
