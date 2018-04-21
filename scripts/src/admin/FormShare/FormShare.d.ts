
interface IFormShareProps extends ISharedFormAdminPageProps {
  data: any
}

interface IFormShareState {
  permissions: any,
  users: any,
  possiblePermissions: string[]
}

interface IUserRowProps {
  user: any,
  permissions: any,
  possiblePermissions: string[],
  onPermissionsChange: (string, string, boolean) => void
}

interface IUserRowState {
}

interface IPermission {
  [x: string]: boolean
}