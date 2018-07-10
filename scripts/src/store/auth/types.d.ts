interface IFederatedCredentials {
  expires_at: number,
  provider: string,
  token: string,
  user: {
    email: string, name: string
  }
}
interface IUser {
  id: string,
  email: string,
  name: string
}
interface IAuthState {
  loggedIn: boolean,
  user: IUser,
  userId: string,
  authMethod: string
}