import React from "react";
export default (props) => {
    if (props.readonly === true && props.const !== undefined) {
        return <props.registry.widgets.HiddenWidget {...props} />;
    }
    else {
        return <props.registry.widgets.RadioWidget {...props} />;
    }
}