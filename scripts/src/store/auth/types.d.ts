interface IFederatedCredentials {
  expires_at: number,
  provider: string,
  token: string,
  user: {
    email: string, name: string
  }
}
interface IUserAttributes {
  email: string,
  email_verified: boolean,
  name: string,
  "custom:center": string
}
interface IAuthStateSchemaItem {
  schema: Schema,
  uiSchema: UiSchema
}
interface IAuthState {
  loggedIn: boolean,
  user: IUserAttributes,
  userId: string,
  authMethod: string,
  schemas: {
    signIn: IAuthStateSchemaItem,
    signUp: IAuthStateSchemaItem,
    forgotPassword: IAuthStateSchemaItem
  },
  error: string,
  message: string
}