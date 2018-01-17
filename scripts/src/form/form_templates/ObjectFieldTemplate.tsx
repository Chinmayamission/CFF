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
                    let customClasses = {
                        "twoColumn": "col-12 col-sm-12 col-md-6",
                        "threeColumn": "col-12 col-sm-6 col-md-4",
                        "fourColumn": "col-6 col-sm-6 col-md-3",
                        "fiveColumn": "col-6 col-sm-4 col-md-2",
                        "sixColumn": "col-6 col-sm-4 col-md-2",
                        "flex": "col",
                        "full": "col-12"
                    };
                    if (!prop.content.props.uiSchema.classNames) {
                        prop.content.props.uiSchema.classNames = "col-12";
                    }
                    for (let customClass in customClasses) {
                        prop.content.props.uiSchema.classNames = prop.content.props.uiSchema.classNames.replace(customClass, customClasses[customClass]);
                    }
                    return (prop.content);
                })}
            </div>
        </div>
    );
}

export default ObjectFieldTemplate;