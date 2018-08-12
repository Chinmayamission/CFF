import FormLoader from "../../common/FormLoader";
import { loadingStart, loadingEnd } from "../base/actions";
import { IRenderedForm } from "../../admin/FormEdit/FormEdit.d";

export const setRenderedForm = (renderedForm: IRenderedForm) => ({
  type: 'SET_RENDERED_FORM',
  renderedForm
});

export const fetchRenderedForm = (formId: string) => (dispatch) => {
  dispatch(loadingStart());
  return FormLoader.getFormAndCreateSchemas("", formId, "", [""], e => alert("Error" + e)).then(e => {
    dispatch(setRenderedForm(e));
    dispatch(loadingEnd());
  })
}