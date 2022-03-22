import { DEVELOPMENT_BASE_URL } from "@env";
import { APP_URLS } from "../../../utils/constants";
import axios from "axios";
import UserDataParser from "./parser";

export const loginUserApi = (email: string, password: string) =>
  new Promise((resolve, reject) => {
    const reqBody = { email, password };
    axios
      .post(`${APP_URLS.API_URL}auth/signin`, reqBody)
      .then((response) => {
        // handle success
        console.log("user data", response.data);
        const user = UserDataParser(response?.data);
        resolve(user);
      })
      .catch((error) => {
        console.log("user error", error);
        // handle error
        reject(error.message);
      });
  });

export const loginWithTokenApi = (token: string) =>
  new Promise((resolve, reject) => {
    const reqBody = { token };
    axios
      .get(`${APP_URLS.API_URL}auth/signin?token=${token}`)
      .then((response) => {
        const user = UserDataParser(response?.data);
        resolve(user);
      })
      .catch((error) => {
        reject(error.message);
      });
  });

export const refreshTokenApi = () =>
  new Promise((resolve, reject) => {
    axios
      .get(`${APP_URLS.API_URL}auth/refresh`)
      .then((response) => {
        console.log("refresh", response.data);
        const user = UserDataParser(response?.data);
        resolve(user);
      })
      .catch((error) => {
        reject(error.message);
      });
  });

export const postSleepData = (data: any) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${APP_URLS.API_URL}sleep`, { sleep: data })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.message);
      });
  });

export const postHeartRateData = (data: any) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${APP_URLS.API_URL}heartrate`, { heartrate: data })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.message);
      });
  });

export const postWorkoutData = (data: any) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${APP_URLS.API_URL}workout`, { workouts: data })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.message);
      });
  });

export const postActivityData = (data: any) =>
  new Promise((resolve, reject) => {
    axios
      .post(`${APP_URLS.API_URL}activity`, { activity: data })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.message);
      });
  });

export const postRawData = (name: string, data: any, timestamp: string) =>
  new Promise((resolve, reject) => {
    console.log(timestamp);
    axios
      .post(`${APP_URLS.API_URL}apple`, {
        type: name,
        data: data,
        timestamp: timestamp
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.message);
      });
  });

export const getLatest = (name: string) =>
  new Promise<any>((resolve, reject) => {
    axios
      .get(`${APP_URLS.API_URL}apple/latest?type=${name}`)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err.message);
      });
  });
