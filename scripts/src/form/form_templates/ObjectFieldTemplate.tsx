import * as React from "react";
import sanitize from "../../sanitize";

/* Custom object field template that allows for grid classes to be specified.
 * If no className is given in schema modifier, defaults to "col".
 */
function ObjectFieldTemplate({ TitleField, properties, title, description }) {
  return (
    <div className="container-fluid">
      <div className="row">
        <TitleField title={title} />
      </div>
      <div className="row">
        <div dangerouslySetInnerHTML={{ __html: sanitize(description) }} />
      </div>
      <div className="row">
        {properties.map(prop => {
          return prop.content;
        })}
      </div>
    </div>
  );
}

export default ObjectFieldTemplate;
