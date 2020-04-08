import { IAdminState } from "scripts/src/store/admin/types";

export interface IFormManageProps extends IAdminState {
  createForm: (x?: string) => void;
}
