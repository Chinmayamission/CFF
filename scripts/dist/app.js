webpackJsonp([0],{

/***/ 139:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(1);
var react_jsonschema_form_1 = __webpack_require__(25);
var deref = __webpack_require__(30);
var axios_1 = __webpack_require__(34);
var FormConfirmationPage_1 = __webpack_require__(140);
var STATUS_FORM_LOADING = 0;
var STATUS_FORM_RENDERED = 2;
var STATUS_FORM_SUBMITTED = 4;
function ObjectFieldTemplate(_a) {
    var TitleField = _a.TitleField, properties = _a.properties, title = _a.title, description = _a.description;
    return (React.createElement("div", { className: "container-fluid p-0" },
        React.createElement(TitleField, { title: title }),
        React.createElement("div", null, description),
        React.createElement("div", { className: "row" }, properties.map(function (prop) {
            if (prop.content.props.uiSchema.classNames == "twoColumn") {
                prop.content.props.uiSchema.classNames = "col-12 col-sm-6";
            }
            if (!prop.content.props.uiSchema.classNames) {
                prop.content.props.uiSchema.classNames = "col-12";
            }
            return (prop.content);
        }))));
}
function transformErrors(errors) {
    return errors.map(function (error) {
        if (error.name === "pattern") {
            error.message = "Please enter a value in the correct format.";
        }
        return error;
    });
}
var PhoneWidget = function (props) {
    return (React.createElement("input", { type: "tel", className: "inputPhone", value: props.value, required: props.required, onChange: function (event) { return props.onChange(event.target.value); } }));
};
var BaseInputWidget = function (props) {
    var options = props.options;
    var visible = options.visible, required = options.required;
    if (false) {
    }
    else {
        return (React.createElement("input", { type: "text", className: "custom", value: props.value, required: required, onChange: function (event) { return props.onChange(event.target.value); } }));
    }
};
BaseInputWidget.defaultProps = {
    options: {
        visible: false,
        required: false
    }
};
var widgets = {
    phoneWidget: PhoneWidget,
};
var fields = {};
var schema = {};
var uiSchema = {};
var This;
var log = console.log;
var FormPage = (function (_super) {
    __extends(FormPage, _super);
    function FormPage(props) {
        var _this = _super.call(this, props) || this;
        This = _this;
        _this.state = {
            status: STATUS_FORM_LOADING,
            schema: { "title": "ABC", "type": "object" },
            uiSchema: { "title": "status" },
            step: 0,
            data: {}
        };
        return _this;
    }
    FormPage.prototype.unescapeJSON = function (json) {
        return JSON.parse(JSON.stringify(json).replace(/\\\\u0024/g, "$"));
    };
    FormPage.prototype.populateSchemaWithOptions = function (schema, options) {
        for (var key in schema) {
            var schemaItem = schema[key];
            if (!options.hasOwnProperty(key)) {
                if (!~["type", "properties"].indexOf(key)) {
                    delete schema[key];
                }
                continue;
            }
            if (this.isObject(schemaItem)) {
                if (options[key] === Object(options[key])) {
                    if (schemaItem["properties"])
                        this.populateSchemaWithOptions(schemaItem["properties"], options[key]);
                    else
                        this.overwriteFlatJSON(schemaItem, options[key]);
                }
            }
            else {
                schema[key] = options[key];
            }
        }
    };
    FormPage.prototype.overwriteFlatJSON = function (oldObj, newObj) {
        for (var i in newObj) {
            oldObj[i] = newObj[i];
        }
    };
    FormPage.prototype.isObject = function (obj) {
        return Object(obj) === obj && !Array.isArray(obj);
    };
    FormPage.prototype.removeKeysBasedOnTest = function (obj, testFn) {
        for (var i in obj) {
            if (!obj.hasOwnProperty(i))
                continue;
            if (testFn(i)) {
                continue;
            }
            else if (this.isObject(obj[i])) {
                this.removeKeysBasedOnTest(obj[i], testFn);
            }
            else {
                delete obj[i];
            }
        }
        return obj;
    };
    FormPage.prototype.filterUiSchema = function (obj) {
        return this.removeKeysBasedOnTest(obj, function (attr) {
            var searchString = "ui:";
            return attr && (attr.substr(0, searchString.length) === searchString || attr == "classNames");
        });
    };
    FormPage.prototype.componentDidMount = function () {
        var _this = this;
        var formId = this.props.formId;
        var schemaModifiersUrl = "http://registration.chinmayamission.com/forms/" + formId + "/data/schemaWithModifiers";
        axios_1.default.get(schemaModifiersUrl, { "responseType": "json" })
            .then(function (response) { return response.data; })
            .then(this.unescapeJSON)
            .then(function (data) {
            var options = data["schemaModifiers"];
            var uiSchema = options;
            var schema = data["schema"];
            console.log(schema);
            schema = deref(schema);
            console.log(schema);
            _this.populateSchemaWithOptions(schema["properties"], options);
            _this.filterUiSchema(uiSchema);
            console.log(options, uiSchema, schema);
            This.setState({ uiSchema: uiSchema, schema: schema, status: STATUS_FORM_RENDERED });
        });
    };
    FormPage.prototype.goBackToFormPage = function () {
        This.setState({ status: STATUS_FORM_RENDERED });
    };
    FormPage.prototype.onSubmit = function (data) {
        var formData = data.formData;
        var token = document.getElementsByName("csrfmiddlewaretoken")[0].value;
        var instance = axios_1.default.create({
            headers: {
                "X-CSRFToken": document.getElementsByName("csrfmiddlewaretoken")[0].value,
                "Content-Type": "application/json"
            }
        });
        instance.post("", formData).then(function (response) {
            console.log("success!", response);
            This.setState({ status: STATUS_FORM_SUBMITTED, data: formData });
        }).catch(function (err) {
            alert("Error. " + err);
        });
    };
    FormPage.prototype.render = function () {
        if (this.state.status == STATUS_FORM_LOADING) {
            return (React.createElement("div", { className: 'my-nice-tab-container' },
                React.createElement("div", { className: 'loading-state' }, "Loading...")));
        }
        else if (this.state.status == STATUS_FORM_RENDERED) {
            return (React.createElement("div", { className: "App" },
                React.createElement(react_jsonschema_form_1.default, { schema: this.state.schema, uiSchema: this.state.uiSchema, formData: this.state.data, widgets: widgets, fields: fields, ObjectFieldTemplate: ObjectFieldTemplate, transformErrors: transformErrors, onChange: function () { return log('changed'); }, onSubmit: this.onSubmit, onError: function () { return log('errors'); } })));
        }
        else if (this.state.status == STATUS_FORM_SUBMITTED) {
            return (React.createElement(FormConfirmationPage_1.default, { schema: this.state.schema, uiSchema: this.state.uiSchema, data: this.state.data, goBack: this.goBackToFormPage }));
        }
    };
    return FormPage;
}(React.Component));
exports.default = FormPage;


/***/ }),

/***/ 140:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(1);
var payment_1 = __webpack_require__(141);
var This;
var FormConfirmationPage = (function (_super) {
    __extends(FormConfirmationPage, _super);
    function FormConfirmationPage(props) {
        var _this = _super.call(this, props) || this;
        This = _this;
        _this.state = {
            "paid": false,
            "paymentTransactionInfo": "",
        };
        return _this;
    }
    FormConfirmationPage.prototype.onPaymentComplete = function (message) {
        This.setState({
            "paid": true,
            "paymentTransactionInfo": JSON.stringify(message, null, 2),
        });
    };
    FormConfirmationPage.prototype.onPaymentError = function (message) {
        alert("There was an error. " + message);
        console.log("error", message);
    };
    FormConfirmationPage.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", { className: "App FormConfirmationPage" },
            React.createElement("h1", null,
                this.props.schema.title,
                " - Confirmation Page"),
            !this.state.paid && React.createElement("button", { className: "btn btn-primary", onClick: this.props.goBack }, "Back to form page"),
            React.createElement("table", { className: "table table-striped" },
                React.createElement("tbody", null, Object.keys(this.props.data).map(function (item, index) { return (React.createElement("tr", { key: index },
                    React.createElement("th", null, item),
                    React.createElement("td", null, _this.props.data[item]))); }))),
            (this.state.paid) ?
                React.createElement("div", null,
                    React.createElement("h1", null, "Thanks for paying!"),
                    React.createElement("p", null, "Please print this page for your confirmation."),
                    React.createElement("pre", null, this.state.paymentTransactionInfo)) :
                React.createElement(payment_1.default, { schema: this.props.schema, onPaymentComplete: this.onPaymentComplete, onPaymentError: this.onPaymentError }),
            "}"));
    };
    return FormConfirmationPage;
}(React.Component));
exports.default = FormConfirmationPage;


/***/ }),

/***/ 141:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(1);
var paypal_1 = __webpack_require__(142);
var CCAvenue_1 = __webpack_require__(143);
var Components = {
    "paypal": paypal_1.default,
    "ccavenue": CCAvenue_1.default
};
var Payment = (function (_super) {
    __extends(Payment, _super);
    function Payment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Payment.prototype.render = function () {
        var _this = this;
        if (!this.props.schema.paymentMethods) {
            return "";
        }
        var paymentMethods = Object.keys(this.props.schema.paymentMethods);
        return paymentMethods.map(function (paymentMethod) {
            var MyComponent = Components[paymentMethod];
            console.log('option is', paymentMethod);
            var props = {
                "paymentInfo": _this.props.schema.paymentInfo,
                "paymentMethodInfo": _this.props.schema.paymentMethods[paymentMethod],
                "key": paymentMethod,
                "onPaymentComplete": _this.props.onPaymentComplete,
                "onPaymentError": _this.props.onPaymentError
            };
            return React.createElement(MyComponent, props);
        });
    };
    return Payment;
}(React.Component));
exports.default = Payment;


/***/ }),

/***/ 142:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(1);
var ReactDOM = __webpack_require__(14);
var react_async_script_loader_1 = __webpack_require__(133);
var This;
var Paypal = (function (_super) {
    __extends(Paypal, _super);
    function Paypal(props) {
        var _this = _super.call(this, props) || this;
        This = _this;
        return _this;
    }
    Paypal.prototype.payment = function (data, actions) {
        return actions.payment.create({
            payment: {
                transactions: [
                    {
                        amount: { total: This.props.paymentInfo.total,
                            currency: This.props.paymentInfo.currency }
                    }
                ]
            }
        });
    };
    Paypal.prototype.onAuthorize = function (data, actions) {
        console.log('on authorize', data);
        if (data.error === 'INSTRUMENT_DECLINED') {
            actions.restart();
        }
        return actions.payment.execute().then(function (payment) {
            console.log("Done!", payment);
            This.props.onPaymentComplete(payment);
        }).catch(function (e) {
            console.log("Error", e);
            This.props.onPaymentError(e);
        });
    };
    ;
    Paypal.prototype.onCancel = function (data, actions) {
    };
    Paypal.prototype.onError = function (err) {
        This.props.onPaymentError(err);
    };
    Paypal.prototype.onClick = function () {
    };
    Paypal.prototype.render = function () {
        if (this.props.isScriptLoaded && this.props.isScriptLoadSucceed) {
            var PayPalButton = window.paypal.Button.driver('react', { React: React, ReactDOM: ReactDOM });
            var client = this.props.paymentMethodInfo.client;
            var env = this.props.paymentMethodInfo.env || "sandbox";
            return (React.createElement(PayPalButton, { env: env, client: client, commit: true, payment: this.payment, onAuthorize: this.onAuthorize, onCancel: this.onCancel, onError: this.onError, onClick: this.onClick }));
        }
        else {
            return (React.createElement("div", null, "PayPal loading..."));
        }
    };
    Paypal.prototype.componentDidMount = function () {
    };
    return Paypal;
}(React.Component));
exports.default = react_async_script_loader_1.default(["https://www.paypalobjects.com/api/checkout.js"])(Paypal);


/***/ }),

/***/ 143:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(1);
var CCAvenue = (function (_super) {
    __extends(CCAvenue, _super);
    function CCAvenue() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CCAvenue.prototype.render = function () {
        return React.createElement("div", null);
    };
    return CCAvenue;
}(React.Component));
exports.default = CCAvenue;


/***/ }),

/***/ 144:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(1);
var This;
var FormAdminPage = (function (_super) {
    __extends(FormAdminPage, _super);
    function FormAdminPage(props) {
        var _this = _super.call(this, props) || this;
        This = _this;
        _this.state = {};
        return _this;
    }
    FormAdminPage.prototype.render = function () {
        return (React.createElement("div", { className: "App FormAdminPage" }, "Hi"));
    };
    return FormAdminPage;
}(React.Component));
exports.default = FormAdminPage;


/***/ }),

/***/ 40:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(1);
var ReactDOM = __webpack_require__(14);
var FormPage_1 = __webpack_require__(139);
var FormAdminPage_1 = __webpack_require__(144);
var formRenderElement = document.getElementById('gcmw-cff-render');
if (formRenderElement) {
    ReactDOM.render(React.createElement(FormPage_1.default, { formId: formRenderElement.getAttribute('data-form-id') }), formRenderElement);
}
var formAdminElement = document.getElementById('gcmw-cff-admin');
if (formAdminElement) {
    ReactDOM.render(React.createElement(FormAdminPage_1.default, null), formAdminElement);
}


/***/ })

},[40]);