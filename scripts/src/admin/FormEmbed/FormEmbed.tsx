import React from "react";
import queryString from "query-string";

export function Embed(props: {
  formId: string;
  responseId?: string;
  mode?: string;
}) {
  let params: any = {};
  if (props.responseId) {
    params.responseId = props.responseId;
  }
  if (props.mode) {
    params.mode = props.mode;
  }
  const url = `${window.location.protocol}//${window.location.host}/v2/forms/${
    props.formId
  }?${queryString.stringify(params)}`;
  return (
    <iframe
      frameBorder="0"
      style={{ width: "100%", height: "100%" }}
      src={url}
    ></iframe>
  );
}
