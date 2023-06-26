import * as React from "react";
import { useEffect, useCallback } from "react";
import queryString from "query-string";
import { get, set } from "lodash";
import Loading from "../../common/Loading/Loading";

const Redirect = ({ paymentMethodInfo, formData, push }) => {
  const doRedirect = useCallback(() => {
    let params: any = {};
    if (paymentMethodInfo.specifiedShowFields) {
      params.specifiedShowFields = paymentMethodInfo.specifiedShowFields;
    }
    let initialFormDataKeys;
    try {
      initialFormDataKeys = JSON.parse(paymentMethodInfo.initialFormDataKeys);
    } catch (e) {
      initialFormDataKeys = [];
    }
    let initialFormData: any = {};
    for (let key of initialFormDataKeys) {
      set(initialFormData, key, get(formData, key));
    }
    params.initialFormData = JSON.stringify(initialFormData);
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
      {paymentMethodInfo.skipConfirmationPage && <Loading />}
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
