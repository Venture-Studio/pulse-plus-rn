import { DEVELOPMENT_BASE_URL } from "@env";
import { APP_URLS } from "../../../utils/constants";
import axios from "axios";
import UserDataParser from "./parser";

// create token for agora video call
export const loginUserApi = (email: string, password: string) =>
  new Promise((resolve, reject) => {
    const reqBody = { email, password }; //dummy user request body
    axios
      .post(`${APP_URLS.API_URL}auth/signin`, reqBody)
      .then((response) => {
        // handle success
        console.log("user data", response.data)
        const user = UserDataParser(response?.data);
        resolve(user);
      })
      .catch((error) => {
        console.log("user error", error)
        // handle error
        reject(error.message);
      });
  });

  export const loginWithTokenApi = (token: string) =>
  new Promise((resolve, reject) => {
    const reqBody = { token }; //dummy user request body
    axios
      .get(`${APP_URLS.API_URL}auth/signin?token=${token}`)
      .then((response) => {
        // handle success
        console.log("user data", response.data)
        const user = UserDataParser(response?.data);
        resolve(user);
      })
      .catch((error) => {
        console.log("user error", error)
        // handle error
        reject(error.message);
      });
  });

