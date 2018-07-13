
interface IFormShareProps extends ISharedFormAdminPageProps {
  data: any,
  refreshData: () => any
}

interface IFormShareState {
  permissions: any,
  users: any,
  possiblePermissions: string[],
  newUserId: string
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