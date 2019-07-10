import React from "react";
export default props => {
  if (props.schema.readOnly === true && props.schema.const !== undefined) {
    return <props.registry.widgets.HiddenWidget {...props} />;
  } else {
    return <props.registry.widgets.RadioWidget {...props} />;
  }
};
