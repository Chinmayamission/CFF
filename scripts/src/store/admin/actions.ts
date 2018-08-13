import { API } from "aws-amplify";
import { IFormListItem } from "../../admin/FormList/FormList.d";
import { loadingStart, loadingEnd } from "../base/actions";


export const loadFormList = () => (dispatch, getState) => {
  dispatch(loadingStart());
  return API.get("CFF", `forms`, {}).then(e => {
    dispatch(setFormList(e.res));
    dispatch(loadingEnd());
  }).catch(e => {
    dispatch(loadingEnd());
    console.error(e);
    alert("Error getting form list. " + e);
  });
};

export const setFormList = (formList: IFormListItem[]) => ({
  type: 'SET_FORM_LIST',
  formList
});