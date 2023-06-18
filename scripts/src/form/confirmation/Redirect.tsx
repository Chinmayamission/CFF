import * as React from "react";
import { useEffect, useCallback } from "react";
import queryString from "query-string";
import { set } from "lodash";
import { connect } from "react-redux";
import { push } from "connected-react-router";

const Redirect = ({ paymentMethodInfo, formData, push }) => {
  const doRedirect = useCallback(() => {
    let params: any = {};
    if (paymentMethodInfo.specifiedShowFields) {
      params.specifiedShowFields = JSON.stringify(
        paymentMethodInfo.specifiedShowFields
      );
    }
    if (paymentMethodInfo.initialFormDataKeys) {
      let initialFormData: any = {};
      for (let key of paymentMethodInfo.initialFormDataKeys) {
        set(initialFormData, key, formData[key]);
      }
      params.initialFormData = JSON.stringify(initialFormData);
    }
    let url = `/v2/forms/${paymentMethodInfo.formId}?${queryString.stringify(
      params
    )}`;
    push(url);
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

const mapStateToProps = state => {};

const mapDispatchToProps = dispatch => ({
  push: (e: string) => dispatch(push(`./${e}`))
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Redirect);
