import FormLoader from "../../common/FormLoader";
import { loadingStart, loadingEnd } from "../base/actions";

export const setRenderedForm = (renderedForm) => ({
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