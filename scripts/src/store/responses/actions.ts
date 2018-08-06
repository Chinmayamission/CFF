import { API } from "aws-amplify";


export const editResponse = (responseId, path, value) => (dispatch, getState) => {
  return API.patch("CFF", `responses/${responseId}`, {
    "body":
    {
      "path": path,
      "value": value
    }
  }).then(e => {
    if (e.res.success === true) {
      dispatch(setResponseDetail(e.res.response));
    }
  }).catch(e => {
    console.error(e);
    alert("Error updating value. " + e);
  });
};

export const setResponseDetail = (responseData: any) => ({
  type: 'SET_RESPONSE_DATA',
  responseData
});