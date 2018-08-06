import { API } from "aws-amplify";


export const editResponse = (responseId, path, value) => (dispatch) => {
  return API.patch("CFF", `responses/${responseId}`, {
    "body":
    {
      "path": `value.${path}`,
      "value": value
    }
  });
};