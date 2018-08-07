import { API } from "aws-amplify";
import { IFormListItem } from "../../admin/FormList/FormList.d";


export const loadFormList = () => (dispatch, getState) => {
  return API.get("CFF", `forms`, {}).then(e => {
    dispatch(setFormList(e.res.data));
  }).catch(e => {
    console.error(e);
    alert("Error getting form list. " + e);
  });
};

export const setFormList = (formList: IFormListItem[]) => ({
  type: 'SET_FORM_LIST',
  formList
});