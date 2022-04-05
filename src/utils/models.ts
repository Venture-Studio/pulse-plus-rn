export interface User {
  email?: string;
  firstName: string;
  isEmailConfirmed: boolean;
  lastName: string;
  connectedDevices: string[];
  jwtToken: string;
  refreshToken: string;
  isLoggedIn: boolean
}
