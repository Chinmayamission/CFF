import React, { useState } from "react";
import Form from "@rjsf/core";
import "./SubmitInputGroupWidget.scss";

export default ({ schema, uiSchema, value, onChange, id }) => {
  const [data, setData] = useState(value);
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="cff-submitinputgroupwidget">
        <Form
          tagName="div"
          schema={schema}
          uiSchema={uiSchema}
          formData={data}
          onChange={e => e.formData !== undefined && setData(e.formData)}
          idPrefix={id + "_widget"}
        >
          <></>
        </Form>
        <span
          className="oi oi-check icon"
          onClick={() => onChange(data)}
        ></span>
      </div>
    );
  } else {
    return (
      <div className="cff-submitinputgroupwidget">
        {value}
        <span
          className="oi oi-pencil icon"
          onClick={() => setEditing(true)}
        ></span>
      </div>
    );
  }
};
