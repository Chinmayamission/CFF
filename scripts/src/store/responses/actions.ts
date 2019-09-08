import API from "@aws-amplify/api";
import { ResponsesState, IResponse } from "./types";
import { findIndex, cloneDeep } from "lodash";
import { loadingStart, loadingEnd } from "../base/actions";

export const editResponse = (responseId: string, path: string, value: any) => (
  dispatch,
  getState
) => {
  dispatch(editResponseBatch(responseId, [{ path, value }]));
};

export const editResponseBatch = (responseId: string, batch: any) => (
  dispatch,
  getState
) => {
  dispatch(loadingStart());
  return API.patch("CFF", `responses/${responseId}`, {
    body: {
      batch: batch
    }
  })
    .then(e => {
      if (e.res.success === true) {
        // Update corresponding response in responses table, too.
        let responses = cloneDeep(
          (getState().responses as ResponsesState).responses
        );
        let responseIndex = findIndex(responses, { _id: { $oid: responseId } });
        responses[responseIndex] = e.res.response;
        dispatch(setResponses(responses));
        dispatch(setResponseDetail(e.res.response));
        dispatch(loadingEnd());
      }
    })
    .catch(e => {
      console.error(e);
      alert("Error updating value. " + e);
      dispatch(loadingEnd());
    });
};

export const fetchResponseDetail = responseId => (dispatch, getState) => {
  dispatch(loadingStart());
  return API.get("CFF", `responses/${responseId}`, {})
    .then(e => {
      dispatch(loadingEnd());
      dispatch(setResponseDetail(e.res));
    })
    .catch(e => {
      console.error(e);
      dispatch(loadingEnd());
      alert("Error updating value. " + e);
    });
};

export const setResponseDetail = (responseData: any) => ({
  type: "SET_RESPONSE_DATA",
  responseData
});

export const onPaymentStatusDetailChange = (key: string, value: string) => ({
  type: "CHANGE_PAYMENT_STATUS_DETAIL",
  key,
  value
});

export const clearPaymentStatusDetail = () => ({
  type: "CLEAR_PAYMENT_STATUS_DETAIL"
});

export const setResponses = (responses: IResponse[]) => ({
  type: "SET_RESPONSES",
  responses
});

export const setResponsesSelectedView = (viewName: string) => ({
  type: "SET_RESPONSES_SELECTED_VIEW",
  viewName
});

export const displayResponseDetail = (shownResponseDetailId: string) => ({
  type: "DISPLAY_RESPONSE_DETAIL",
  shownResponseDetailId
});

export const submitNewPayment = ({ sendEmail, emailTemplateId }) => (
  dispatch,
  getState
) => {
  dispatch(loadingStart());
  let responsesState: ResponsesState = getState().responses;
  return API.post(
    "CFF",
    `responses/${responsesState.responseData._id.$oid}/payment`,
    {
      body: {
        ...responsesState.paymentStatusDetailItem,
        sendEmail,
        emailTemplateId
      }
    }
  )
    .then(e => {
      if (e.res.success === true) {
        dispatch(loadingEnd());
        dispatch(clearPaymentStatusDetail());
        dispatch(setResponseDetail(e.res.response));
      }
    })
    .catch(e => {
      dispatch(loadingEnd());
      console.error(e);
      alert("Error submitting new payment. " + e);
    });
};

export const sendConfirmationEmail = ({ emailTemplateId }) => (
  dispatch,
  getState
) => {
  dispatch(loadingStart());
  let responsesState: ResponsesState = getState().responses;
  return API.post(
    "CFF",
    `responses/${responsesState.responseData._id.$oid}/email`,
    {
      body: {
        emailTemplateId
      }
    }
  )
    .then(e => {
      if (e.res.success === true) {
        dispatch(loadingEnd());
        alert("Email sent.");
        dispatch(setResponseDetail(e.res.response));
      }
    })
    .catch(e => {
      dispatch(loadingEnd());
      console.error(e);
      alert("Error sending confirmation email. " + e);
    });
};

/*
 * Fetches (or searches for) responses.
 */
export const fetchResponses = (
  formId,
  searchQuery = "",
  search_by_id = false,
  show_unpaid = false
) => (dispatch, getState) => {
  dispatch(loadingStart());
  let queryStringParameters = searchQuery ? { query: searchQuery } : {};
  if (search_by_id) {
    queryStringParameters["search_by_id"] = "1";
  }
  if (show_unpaid) {
    queryStringParameters["show_unpaid"] = "1";
  }
  return API.get("CFF", `forms/${formId}/responses`, { queryStringParameters })
    .then(e => {
      dispatch(setResponses(e.res));
      dispatch(loadingEnd());
    })
    .catch(e => {
      console.error(e);
      alert("Error fetching form responses. " + e);
      dispatch(loadingEnd());
    });
};
