import { Schema, UiSchema } from "../../form/interfaces";

export interface IFederatedCredentials {
  expires_at: number,
  provider: string,
  token: string,
  user: {
    email: string, name: string
  }
}
export interface IUserAttributes {
  email: string,
  email_verified: boolean,
  name: string
}
export interface IAuthStateSchemaItem {
  schema: Schema,
  uiSchema: UiSchema
}
export interface IAuthState {
  loggedIn: boolean,
  user: IUserAttributes,
  userId: string,
  schemas: {
    signIn: IAuthStateSchemaItem,
    signUp: IAuthStateSchemaItem,
    forgotPassword: IAuthStateSchemaItem,
    forgotPasswordSubmit: IAuthStateSchemaItem
  },
  error: string,
  message: string,
  authPage: "forgotPassword" | "forgotPasswordSubmit" | "signIn" | "signUp",
  cognitoUser: any,
  loginUrl: string
}