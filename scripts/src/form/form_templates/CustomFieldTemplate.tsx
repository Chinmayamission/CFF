import * as React from 'react';
import sanitize from "../../sanitize";

function CustomFieldTemplate(props) {
    const {id, classNames, label, help, required, hidden, description, errors, children, schema, uiSchema} = props;
    return (
      <div className={classNames}>
        {!hidden &&
            (<div>
              <label htmlFor={id} className="control-label">
                <span dangerouslySetInnerHTML={{ "__html": sanitize(label) }} />
                {required &&
                  <span className="ccmt_cff_required_asterisk"> *</span>}
              </label>
            </div>
          )}
        {!hidden && description}
        {children}
        {errors}
        {help}
      </div>
    );
  }
  export default CustomFieldTemplate;