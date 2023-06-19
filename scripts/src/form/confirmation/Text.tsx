import * as React from "react";

const Text = ({ paymentMethodInfo }) => {
  return <div className="alert alert-info">{paymentMethodInfo.text}</div>;
};

export default Text;
