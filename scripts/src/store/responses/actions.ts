import { API } from "aws-amplify";
import { ResponsesState } from "./types";


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

export const onPaymentStatusDetailChange = (key: string, value: string) => ({
  type: 'CHANGE_PAYMENT_STATUS_DETAIL',
  key,
  value
});


export const submitNewPayment = () => (dispatch, getState) => {
  let responsesState: ResponsesState = getState().responses;
  return API.post("CFF", `responses/${responsesState.responseData._id.$oid}/payment`, {
    "body": responsesState.paymentStatusDetailItem
  }).then(e => {
    if (e.res.success === true) {
      dispatch(setResponseDetail(e.res.response));
    }
  }).catch(e => {
    console.error(e);
    alert("Error submitting new payment. " + e);
  });
};