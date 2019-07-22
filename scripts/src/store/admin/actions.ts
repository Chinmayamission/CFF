import API from "@aws-amplify/api";
import { IFormListItem } from "../../admin/FormList/FormList.d";
import { loadingStart, loadingEnd } from "../base/actions";

export const loadFormList = () => (dispatch, getState) => {
  dispatch(loadingStart());
  return API.get("CFF", `forms`, {})
    .then(e => {
      dispatch(setFormList(e.res));
      dispatch(loadingEnd());
    })
    .catch(e => {
      dispatch(loadingEnd());
      console.error(e);
      alert("Error getting form list. " + e);
    });
};

export const setFormList = (formList: IFormListItem[]) => ({
  type: "SET_FORM_LIST",
  formList
});

export const createForm = (formId?: string) => (dispatch, getState) => {
  dispatch(loadingStart());
  let postBody = {};
  if (formId) {
    postBody = { formId: formId };
  }
  console.log(postBody);
  return API.post("CFF", "forms", { body: postBody })
    .then(e => {
      dispatch(loadFormList());
    })
    .catch(e => {
      dispatch(loadingEnd());
      console.error(e);
      alert("Error creating form. " + e);
    });
};
