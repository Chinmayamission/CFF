import { IRenderedForm } from "../../admin/FormEdit/FormEdit.d";
import { IResponse } from "../responses/types";

export interface FormState {
  renderedForm: IRenderedForm;
  renderedResponse: IResponse;
}
