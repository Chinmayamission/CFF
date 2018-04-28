import * as React from 'react';
import * as DOMPurify from 'dompurify';

function CustomFieldTemplate(props) {
    const {id, classNames, label, help, required, hidden, description, errors, children, schema, uiSchema} = props;
    return (
      <div className={classNames}>
        {!hidden && schema.type != "object" && schema.type != "array" && 
            (<div>
              <label htmlFor={id} className="control-label">
                <span dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(label) }} />
                {required &&
                  <span className="ccmt_cff_required_asterisk"> *</span>}
              </label>
              {/*todo: conditional requiring? */}
            </div>
          )}
        {!hidden && schema.type != "object" && schema.type != "array" && schema.type != "boolean" && description}
        {children}
        {errors}
        {help}
      </div>
    );
  }
  export default CustomFieldTemplate;