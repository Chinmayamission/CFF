import * as React from "react";
import { useEffect, useCallback } from "react";
import queryString from "query-string";
import { set } from "lodash";

const Redirect = ({ paymentMethodInfo, formData, push }) => {
  const doRedirect = useCallback(() => {
    let params: any = {};
    if (paymentMethodInfo.specifiedShowFields) {
      params.specifiedShowFields = paymentMethodInfo.specifiedShowFields;
    }
    if (paymentMethodInfo.initialFormDataKeys) {
      let initialFormData: any = {};
      for (let key of paymentMethodInfo.initialFormDataKeys) {
        set(initialFormData, key, formData[key]);
      }
      params.initialFormData = JSON.stringify(initialFormData);
    }
    let url = `${window.location.protocol}//${window.location.host}/v2/forms/${
      paymentMethodInfo.formId
    }?${queryString.stringify(params)}`;
    window.location.href = url;
  }, [paymentMethodInfo, formData]);

  useEffect(() => {
    if (paymentMethodInfo.skipConfirmationPage) {
      doRedirect();
    }
  }, [paymentMethodInfo.skipConfirmationPage, doRedirect]);

  return (
    <div>
      <input
        type="submit"
        className="btn btn-primary"
        onClick={doRedirect}
        value={paymentMethodInfo.payButtonText || "Continue with Payment"}
      />
    </div>
  );
};

export default Redirect;
