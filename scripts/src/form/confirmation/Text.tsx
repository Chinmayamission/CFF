import * as React from "react";
import sanitize from "../../sanitize";

const Text = ({ paymentMethodInfo }) => {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: sanitize(paymentMethodInfo.text) }}
    />
  );
};

export default Text;
