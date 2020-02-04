import API from "@aws-amplify/api";
import { IFormListItem } from "../../admin/FormList/FormList.d";
import { loadingStart, loadingEnd } from "../base/actions";
import { findIndex } from "lodash";
import { IAdminState } from "./types";

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

export const editForm = (formId: string, body: any) => (dispatch, getState) => {
  dispatch(loadingStart());
  const formList = (getState().admin as IAdminState).formList;
  API.patch("CFF", `forms/${formId}`, {
    body: body
  })
    .then(response => {
      let res = response.res;
      if (!(res.success == true && res.updated_values)) {
        throw "Response not formatted correctly: " + JSON.stringify(res);
      }
      const index = findIndex(formList, { _id: { $oid: formId } });
      formList[index] = res.updated_values;
      dispatch(setFormList(formList));
      dispatch(loadingEnd());
    })
    .catch(e => {
      console.error(e);
      alert("Error: " + e);
      dispatch(loadingEnd());
    });
};
