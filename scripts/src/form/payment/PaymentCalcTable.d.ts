import { IPaymentInfo, Data, IResponseMetadata } from "../interfaces";

export interface IPaymentCalcTableProps {
  formData: Data;
  responseMetadata: IResponseMetadata;
  paymentCalcInfo: IPaymentCalcInfo;
}

export interface IPaymentCalcTableState {
  paymentInfo: IPaymentInfo;
}

export interface IPaymentCalcInfo extends IPaymentInfo {}
