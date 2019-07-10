import { ResponsesState, IResponse } from "../../store/responses/types";

export interface IResponseDetailProps extends ResponsesState {
  setResponseDetail: (e: IResponse) => void;
  fetchResponseDetail: (e: string) => void;
  responseId: string;
}

export interface IResponseDetailState {}
