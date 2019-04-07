import * as React from 'react';
import * as DOMPurify from 'dompurify';

/* Custom object field template that allows for grid classes to be specified.
 * If no className is given in schema modifier, defaults to "col-12".
 */
function ObjectFieldTemplate({ TitleField, properties, title, description }) {
    return (
        <div className="container-fluid">
            <TitleField title={title} />
            <div dangerouslySetInnerHTML={{ "__html": DOMPurify.sanitize(description) }} />
            <div className="row">
                {properties.map(prop => {
                    return (prop.content);
                })}
            </div>
        </div>
    );
}

export default ObjectFieldTemplate;