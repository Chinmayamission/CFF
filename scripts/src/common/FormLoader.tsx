/// <reference path="./common.d.ts"/>
import {get} from 'lodash-es';
import {API} from "aws-amplify";
import createSchemas from "./CreateSchemas";

export module FormLoader {
    export function getForm(apiEndpoint, formId, opts) {
        // todo: allow response editing here, too.
        return API.get("CFF", `forms/${formId}` + (opts.include_s_sm_versions ? "?versions=1": ""), {})
                .then(response => response.res);
    }
    export function getFormAndCreateSchemas(apiEndpoint, formId, authKey, specifiedShowFields, handleError) {
        return this.getForm(apiEndpoint, formId, {"authKey": authKey})
            .then(e => createSchemas(e, specifiedShowFields)).catch(handleError);
    }
    export function loadResponseAndCreateSchemas(apiEndpoint, formId, authKey, specifiedShowFields, responseId, handleError) {
        return this.getForm(apiEndpoint, formId, {"authKey": authKey, "responseId": responseId})
            .then(e => createSchemas(e, specifiedShowFields)).catch(handleError);
    }

}

export default FormLoader;