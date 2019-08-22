import { IDataOptions } from "../../admin/FormEdit/FormEdit.d";

export interface ResponsesState {
  responseData: IResponse;
  paymentStatusDetailItem: IPaymentStatusDetailItem;
  responses: IResponse[];
  selectedView: string;
  shownResponseDetailId: string;
}

export interface IResponse {
  value: { [e: string]: any };
  payment_trail: IPaymentTrailItem[];
  payment_status_detail: IPaymentStatusDetailItem[];
  paid: boolean;
  amount_paid: string;
  // formId: string;
  // resId: string;
  [propName: string]: any;
}

export interface IPaymentTrailItem {
  value: { [e: string]: any };
  date: { $date: string };
  method: string;
  status: string;
  id: string;
}

export interface IPaymentStatusDetailItem {
  amount: string;
  currency: string;
  date: { $date: string };
  method: string;
  id: string;
  notes?: string;
}
