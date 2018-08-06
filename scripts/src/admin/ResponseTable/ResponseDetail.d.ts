import { ResponsesState } from "../../store/responses/types";

export interface IResponseDetailProps extends ResponsesState{
  checkInMode: boolean,
  data: any,
  formId: string,
  responseId: string,
  dataOptions: IDataOptions,
  setResponseDetail: (e: any) => void
}

export interface IResponseDetailState {
  data: any
}