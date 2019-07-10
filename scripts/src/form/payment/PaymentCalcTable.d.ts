import { IPaymentInfo, Data } from "../interfaces";

export interface IPaymentCalcTableProps {
  formData: Data;
  paymentCalcInfo: IPaymentCalcInfo;
}

export interface IPaymentCalcTableState {
  paymentInfo: IPaymentInfo;
}

export interface IPaymentCalcInfo extends IPaymentInfo {}
