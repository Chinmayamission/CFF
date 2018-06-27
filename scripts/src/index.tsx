import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App";
import aws_exports from "./aws_exports";
import Amplify, {Auth} from "aws-amplify";

Amplify.configure(aws_exports);

declare var MODE: any;
declare var API_VERSION: any;
let ENDPOINT_URL = "";
switch (MODE) {
  case "dev":
    ENDPOINT_URL = `https://ewnywds4u7.execute-api.us-east-1.amazonaws.com/api/`;
    break;
  case "beta":
    ENDPOINT_URL = `https://5fd3dqj2dc.execute-api.us-east-1.amazonaws.com/api/`;
    break;
  case "prod":
  default:
    ENDPOINT_URL = `https://xpqeqfjgwd.execute-api.us-east-1.amazonaws.com/${API_VERSION}/`;
    break;
}

ReactDOM.render(<App />, document.getElementById('ccmt-cff-main'));
import "./form.tsx";