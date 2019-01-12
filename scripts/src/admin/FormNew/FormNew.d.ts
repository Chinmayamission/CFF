import { IAdminState } from "scripts/src/store/admin/types";

export interface IFormNewProps extends IAdminState {
    createForm: (x?: string) => void
}