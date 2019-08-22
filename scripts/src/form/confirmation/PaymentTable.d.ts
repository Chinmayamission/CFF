import { IPaymentInfo } from "../interfaces";

export interface IFormData {
  [x: string]: any;
}
export interface IPaymentTableProps {
  paymentInfo: IPaymentInfo;
  formData: IFormData;
}
