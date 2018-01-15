import * as React from 'react';
import * as DOMPurify from 'dompurify';

function CustomFieldTemplate(props) {
    {console.log(props.required)}
    const {id, classNames, label, help, required, description, errors, children, schema} = props;
    return (
      <div className={classNames}>
        {schema.type != "object" && schema.type != "array" && 
            (<div>
              <label htmlFor={id} className="control-label">
                <span dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(label) }} />
                {label && required &&
                  <span className="ccmt_cff_required_asterisk">(*)</span>}
              </label>
              {/*description*/}
            </div>
          )}
        {children}
        {errors}
        {help}
      </div>
    );
  }
  export default CustomFieldTemplate;