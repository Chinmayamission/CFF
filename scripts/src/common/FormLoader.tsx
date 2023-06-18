import API from "@aws-amplify/api";
import createSchemas from "./CreateSchemas";
import { IResponse } from "../store/responses/types";

interface IGetFormResponse {
  res: any;
  responseId: string;
  response: IResponse;
}

export namespace FormLoader {
  export function getForm(apiEndpoint, formId, opts) {
    // todo: allow response editing here, too.
    return API.get(
      "CFF",
      `forms/${formId}` + (opts.include_s_sm_versions ? "?versions=1" : ""),
      {}
    );
  }
  export function getFormAndCreateSchemas(
    apiEndpoint,
    formId,
    authKey,
    specifiedShowFields,
    initialFormData,
    handleError
  ) {
    return this.getForm(apiEndpoint, formId, { authKey: authKey })
      .then((e: IGetFormResponse) =>
        createSchemas(
          e.res,
          specifiedShowFields,
          initialFormData,
          e.responseId,
          e.response && e.response.value
        )
      )
      .catch(handleError);
  }
}

export default FormLoader;
