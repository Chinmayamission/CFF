import { API } from "aws-amplify";
import { ResponsesState } from "./types";
import { get, concat, assign } from "lodash-es";
import { flatten } from "flat";
import Headers from "../../admin/util/Headers";
import { loadingStart, loadingEnd } from "../base/actions";
import { push } from 'connected-react-router';

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

export const fetchResponseDetail = (responseId) => (dispatch, getState) => {
  dispatch(loadingStart());
  return API.get("CFF", `responses/${responseId}`, {}).then(e => {
    dispatch(loadingEnd());
    dispatch(setResponseDetail(e.res));
  }).catch(e => {
    console.error(e);
    dispatch(loadingEnd());
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

export const clearPaymentStatusDetail = () => ({
  type: "CLEAR_PAYMENT_STATUS_DETAIL"
});

export const setResponses = (responses: Response[]) => ({
  type: "SET_RESPONSES",
  responses
});

export const setResponsesSelectedView = (viewName: string) => ({
  type: "SET_RESPONSES_SELECTED_VIEW",
  viewName
})


export const submitNewPayment = () => (dispatch, getState) => {
  dispatch(loadingStart());
  let responsesState: ResponsesState = getState().responses;
  return API.post("CFF", `responses/${responsesState.responseData._id.$oid}/payment`, {
    "body": responsesState.paymentStatusDetailItem
  }).then(e => {
    if (e.res.success === true) {
      dispatch(loadingEnd());
      dispatch(clearPaymentStatusDetail());
      dispatch(setResponseDetail(e.res.response));
    }
  }).catch(e => {
    dispatch(loadingEnd());
    console.error(e);
    alert("Error submitting new payment. " + e);
  });
};

export const fetchResponses = (formId) => (dispatch, getState) => {
  return API.get("CFF", `forms/${formId}/responses`, {}).then(e => {
    let data = e.res.sort((a, b) => Date.parse(a.date_created) - Date.parse(b.date_created));

    let headerNamesToShow = ["DATE_LAST_MODIFIED", "DATE_CREATED", "PAYMENT_INFO_TOTAL", "AMOUNT_PAID"];

    data = data.map((e, index) => {
      let valueToAssign = {
        "ID": e["_id"]["$oid"],
        "PAID": e.paid,
        // "PAYMENT_HISTORY": e.PAYMENT_HISTORY,
        // "IPN_HISTORY": e.IPN_HISTORY,
        "DATE_CREATED": e.date_created.$date,
        // "NUMERIC_ID": index + 1,
        "DATE_LAST_MODIFIED": e.date_modified.$date,
        "AMOUNT_OWED": formatPayment(e.paymentInfo.total, e.paymentInfo.currency),
        "AMOUNT_PAID": formatPayment(e.amount_paid, e.paymentInfo.currency),
        // "UPDATE_HISTORY": e.UPDATE_HISTORY,
        //"PAYMENT_INFO_ITEMS": '"' + JSON.stringify(e.paymentInfo.items) + '"',
        // "CONFIRMATION_EMAIL_INFO": e.confirmationEmailInfo
      };
      assign(e.value, valueToAssign);
      return e.value;
    });
    dispatch(setResponses(data));

  }).catch(e => {
    console.error(e);
    alert("Error fetching form responses. " + e);
  });
};

function formatPayment(total, currency = "USD") {
  if (!total) total = 0;
  if (Intl && Intl.NumberFormat) {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(total);
  }
  else {
    return total + " " + currency;
  }
}