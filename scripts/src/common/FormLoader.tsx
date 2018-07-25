/// <reference path="./common.d.ts"/>
import {get} from 'lodash-es';
import {API} from "aws-amplify";
import createSchemas from "./CreateSchemas";

interface IGetFormResponse {
    res: any,
    responseId: string,
    response: IResponseDBEntry
}

export module FormLoader {
    export function getForm(apiEndpoint, formId, opts) {
        // todo: allow response editing here, too.
        return API.get("CFF", `forms/${formId}` + (opts.include_s_sm_versions ? "?versions=1": ""), {});
    }
    export function getFormAndCreateSchemas(apiEndpoint, formId, authKey, specifiedShowFields, handleError) {
        return this.getForm(apiEndpoint, formId, {"authKey": authKey})
            .then((e: IGetFormResponse) => createSchemas(e.res, specifiedShowFields, e.responseId, e.response.value)).catch(handleError);
    }

}

export default FormLoader;