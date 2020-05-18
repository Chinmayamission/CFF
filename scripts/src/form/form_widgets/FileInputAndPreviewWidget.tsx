import React from "react";
import FileWidget from "@rjsf/core/lib/components/widgets/FileWidget";

/*
From https://github.com/TreeHacks/application-portal-frontend/blob/4d5c542498499c18bba1d0e3cfded0ff50964464/src/FormPage/FormPage.tsx#L64
*/

function base64MimeType(encoded) {
  var result = null;

  if (typeof encoded !== "string") {
    return result;
  }

  var mime = encoded.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);

  if (mime && mime.length) {
    result = mime[1];
  }

  return result;
}

const FilePreviewWidget = props => {
  if (!props.value) {
    return <div>No file uploaded.</div>;
  }
  if (!props.value.startsWith("http")) {
    return <div>File uploaded.</div>;
  }
  return (
    <div>
      <iframe
        src={props.value}
        style={Object.assign({ width: "100%", minHeight: 400 }, props.style)}
      ></iframe>
    </div>
  );
};

const FileInputAndPreviewWidget = props => {
  const output = [];

  if (props.value) {
    output.push(
      <FilePreviewWidget
        key="preview"
        {...props}
        style={{ marginBottom: 10 }}
      />
    );
  } else {
    output.push(
      <FileWidget
        key="file"
        {...props}
        value={undefined}
        onChange={v => {
          props.onChange(v);
        }}
      />
    );
  }

  return output;
};

export default FileInputAndPreviewWidget;
