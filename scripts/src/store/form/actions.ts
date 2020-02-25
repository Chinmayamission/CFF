import FormLoader from "../../common/FormLoader";
import { loadingStart, loadingEnd } from "../base/actions";
import { IRenderedForm, IGroupOption } from "../../admin/FormEdit/FormEdit.d";
import { FormState } from "./types";
import API from "@aws-amplify/api";

export const setRenderedForm = (renderedForm: IRenderedForm) => ({
  type: "SET_RENDERED_FORM",
  renderedForm
});

export const setRenderedResponse = (renderedResponse: any) => ({
  type: "SET_RENDERED_RESPONSE",
  renderedResponse
});

export const fetchRenderedForm = (formId: string) => dispatch => {
  dispatch(loadingStart());
  return FormLoader.getFormAndCreateSchemas("", formId, "", [""], e =>
    alert("Error" + e)
  ).then(e => {
    dispatch(setRenderedForm(e));
    dispatch(loadingEnd());
  });
};

export const fetchRenderedResponse = ({
  formId,
  responseId = null
}) => async dispatch => {
  dispatch(loadingStart());
  try {
    const response = await API.get(
      "CFF",
      responseId ? `responses/${responseId}` : `forms/${formId}/response`,
      {}
    );
    dispatch(setRenderedResponse(response));
  } catch (e) {
    console.error(e);
    alert("Error" + e);
  }
  dispatch(loadingEnd());
};

export const editForm = (body: any) => (dispatch, getState) => {
  dispatch(loadingStart());
  const formId = (getState().form as FormState).renderedForm._id.$oid;
  API.patch("CFF", `forms/${formId}`, {
    body: body
  })
    .then(response => {
      let res = response.res;
      if (!(res.success == true && res.updated_values)) {
        throw "Response not formatted correctly: " + JSON.stringify(res);
      }
      dispatch(setRenderedForm(res.updated_values));
      dispatch(loadingEnd());
    })
    .catch(e => {
      console.error(e);
      alert("Error: " + e);
      dispatch(loadingEnd());
    });
};

export const editGroups = (groups: IGroupOption[]) => (dispatch, getState) => {
  dispatch(loadingStart());
  const formId = (getState().form as FormState).renderedForm._id.$oid;
  API.put("CFF", `forms/${formId}/groups`, {
    body: { groups: groups }
  })
    .then(response => {
      let res = response.res;
      if (!(res.success == true && res.form)) {
        throw "Response not formatted correctly: " + JSON.stringify(res);
      }
      dispatch(setRenderedForm(res.form));
      dispatch(loadingEnd());
    })
    .catch(e => {
      console.error(e);
      alert("Error: " + e);
      dispatch(loadingEnd());
    });
};
