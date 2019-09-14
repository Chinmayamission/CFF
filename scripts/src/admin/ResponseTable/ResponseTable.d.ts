import { IRenderedForm } from "../FormEdit/FormEdit.d";
import { ResponsesState } from "../../store/responses/types";
import { IFormListItem } from "../FormList/FormList.d";
import { FormState } from "../../store/form/types";
import { setResponsesSelectedView } from "../../store/responses/actions";

export interface IResponseTableProps extends ResponsesState {
  match: {
    params: {
      formId: string;
      tableViewName: string;
    };
    url: string;
  };
  onError: (any) => void;
  tableViewName: string;
  form: FormState;
  fetchRenderedForm: (x: string) => Promise<any>;
  fetchResponses: (x: any) => Promise<any>;
  setResponsesSelectedView: (x: string) => any;
  push: (x: string) => void;
  editGroups: (x: any) => any;
  displayResponseDetail: (e: string) => void;
  editResponse: (a, b, c) => void;
}

export interface IResponseTableState {}
