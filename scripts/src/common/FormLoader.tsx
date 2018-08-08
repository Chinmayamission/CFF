import {get} from 'lodash-es';
import {API} from "aws-amplify";
import createSchemas from "./CreateSchemas";
import { IResponse } from '../store/responses/types';

interface IGetFormResponse {
    res: any,
    responseId: string,
    response: IResponse
}

export module FormLoader {
    export function getForm(apiEndpoint, formId, opts) {
        // todo: allow response editing here, too.
        return API.get("CFF", `forms/${formId}` + (opts.include_s_sm_versions ? "?versions=1": ""), {});
    }
    export function getFormAndCreateSchemas(apiEndpoint, formId, authKey, specifiedShowFields, handleError) {
        return this.getForm(apiEndpoint, formId, {"authKey": authKey})
            .then((e: IGetFormResponse) => createSchemas(e.res, specifiedShowFields, e.responseId, e.response && e.response.value )).catch(handleError)
    }

}

export default FormLoader;