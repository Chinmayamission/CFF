import { API } from "aws-amplify";
import { ResponsesState, IFormResponseTableDisplayData } from "./types";
import { get, concat, assign } from "lodash-es";
import { flatten } from "flat";
import Headers from "../../admin/util/Headers";

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

export const setResponses = (responses: Response[]) => ({
  type: "SET_RESPONSES",
  responses
});

export const setFormResponseTableDisplayData = (data: IFormResponseTableDisplayData) => ({
  type: "SET_FORM_RESPONSES_TABLE_DISPLAY_DATA",
  ...data
})


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

export const fetchResponses = (formId) => (dispatch, getState) => {
  return API.get("CFF", `forms/${formId}/responses`, {}).then(e => {
    dispatch(setResponses(e.res));
    const data = e.res.sort((a, b) => Date.parse(a.date_created) - Date.parse(b.date_created));
    // data = data.sort((a,b) => Date.parse(a.date_created) - Date.parse(b.date_created));
    let headerNamesToShow = ["DATE_LAST_MODIFIED", "DATE_CREATED", "PAYMENT_INFO_TOTAL", "AMOUNT_PAID"];

    let propertyHeaders = [];
    for (let item of data) {
      for (let i in flatten(item.value)) {
        if (!~propertyHeaders.indexOf(i)) {
          propertyHeaders.push(i);
        }
      }
    }
    let data2 = data.map((e, index) => {
      let valueToAssign = {
        "ID": e["_id"]["$oid"],
        "PAID": e.paid,
        "PAYMENT_HISTORY": e.PAYMENT_HISTORY,
        "IPN_HISTORY": e.IPN_HISTORY,
        "DATE_CREATED": e.date_created.$date,
        // "NUMERIC_ID": index + 1,
        "DATE_LAST_MODIFIED": e.date_modified.$date,
        "PAYMENT_INFO_TOTAL": formatPayment(e.paymentInfo.total, e.paymentInfo.currency),
        "AMOUNT_PAID": formatPayment(e.amount_paid, e.paymentInfo.currency),
        "UPDATE_HISTORY": e.UPDATE_HISTORY,
        //"PAYMENT_INFO_ITEMS": '"' + JSON.stringify(e.paymentInfo.items) + '"',
        "CONFIRMATION_EMAIL_INFO": e.confirmationEmailInfo
      };
      assign(e.value, valueToAssign);

      return e.value;
    });
    let dataOptions = getState().form.renderedForm.dataOptions; // this.props.form.dataOptions;
    let colsToAggregate = [];
    let tableName = "mainTable";

    let defaultHeaders = concat(
      ["ID", "PAID"],
      propertyHeaders,
      headerNamesToShow
    );
    let headerObjs = Headers.makeHeaderObjsFromKeys(
      get(dataOptions, `${tableName}.columnOrder`, defaultHeaders)
    );

    // Set possible rows to unwind, equal to top-level array items.
    let possibleFieldsToUnwind = [];
    if (dataOptions.unwindTables) {
      possibleFieldsToUnwind = Object.keys(dataOptions.unwindTables);
    }
    else {
      for (let fieldName in getState().form.renderedForm.schema.properties) {
        let fieldValue = getState().form.renderedForm.schema.properties[fieldName];
        if (fieldValue.type == "array") {
          possibleFieldsToUnwind.push(fieldName);
          dataOptions[fieldName] = {};
        }
      }
    }
    dispatch(setFormResponseTableDisplayData({
      tableHeaders: headerObjs, tableHeadersDisplayed: headerObjs,
      tableData: data2, tableDataDisplayed: data2,
      possibleFieldsToUnwind,
      dataOptions,
      colsToAggregate,
      tableDataOrigObject: data,
      rowToUnwind: null // todo change default.
    }))

    // this.setState({
      // tableHeaders: headerObjs, tableHeadersDisplayed: headerObjs,
      // tableData: data2, tableDataDisplayed: data2,
      // possibleFieldsToUnwind,
      // dataOptions,
      colsToAggregate
    // }, () => {
    //   if (this.props.match.params.tableViewName && this.props.match.params.tableViewName != "all" && this.state.rowToUnwind != this.props.match.params.tableViewName) {
    //     this.showUnwindTable(this.props.match.params.tableViewName);
    //   }
    // });
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