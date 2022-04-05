import { User } from "../../../utils/models";

const UserDataParser = (res: any): User => ({
  email: res?.userData?.email ?? "",
  firstName: res?.userData?.firstName ?? "",
  lastName: res?.userData?.lastName,
  isEmailConfirmed: res?.userData?.isEmailConfirmed ?? false,
  connectedDevices: res?.userData?.connectedDevices ?? [],
  jwtToken: res?.jwtToken ?? "",
  refreshToken: res?.refreshToken ?? "",
  isLoggedIn: true
});

export default UserDataParser;
