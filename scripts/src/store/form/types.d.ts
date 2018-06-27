interface IFederatedCredentials {
  expires_at: number,
  provider: string,
  token: string,
  user: {
    email: string, name: string
  }
}
interface IUserCredentials {
  id: string,
  email: string,
  name: string
}