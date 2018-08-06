interface IResponseDetailProps {
  checkInMode: boolean,
  data: any,
  formId: string,
  responseId: string,
  dataOptions: IDataOptions,
  setResponseDetail: (e: any) => void
}

interface IResponseDetailState {
  data: any
}