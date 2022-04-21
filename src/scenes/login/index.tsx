/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigation } from "@react-navigation/native";
import React, { FC, JSX, useEffect, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  Image,
  TouchableOpacity,
  AppState
} from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import RoundButton from "../../components/RoundButton";
import { UserDispatchProps, withUser } from "../../contexts/user_context";
import { UserStateProps } from "../../contexts/user_context/actionTypes";
import { PRIMARY, WHITE } from "../../styles/colors";
import { APP_ROUTES, APP_STRINGS } from "../../utils/constants";
import ShouldRender from "../../utils/ShouldRender";
import styles from "./loginStyle";
import { LogoDark, LogoLight } from "../../assets";
import FormTextInput from "../../components/FormTextInput";
import AppText from "../../components/AppText";
import validator from "validator";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import BackgroundService from "react-native-background-actions";

type FormInputType = {
  value: string;
  error?: string | null;
};

interface LoginProps {
  userActions: UserDispatchProps;
  userState: UserStateProps;
}

const Login: FC<LoginProps> = ({
  userActions,
  userState,
}: LoginProps): JSX.Element => {
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const {
    container,
    headerStyle,
    headerLogoStyle,
    inputContainerStyle,
    buttonSectionContainerStyle,
    buttonContainerStyle,
    buttonTextStyle,
    forgotPasswordCotainerStyle,
    signUpButtonCotainerStyle,
    linkButtonTextStyle,
    normalTextStyle,
    footerStyle,
    footerLogoStyle,
    footerTextStyle,
  } = styles;
  const { loginUser, loginWithToken } = userActions;
  const { error, user, loading } = userState;
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);

  const navigation = useNavigation();

  const { isLoggedIn, jwtToken, refreshToken } = user;

  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);


  async function checkToken() {
    const jwt = await AsyncStorage.getItem("jwttoken");
    const refresh = await AsyncStorage.getItem("reftoken");
    console.log("jwt", jwt);
    if (jwt && refresh) {
      loginWithToken(jwt);
    }
  }

  // initial useEffect
  useEffect(() => {
    checkToken();
  }, []);

  useEffect(() => {
    console.log("ligged", isLoggedIn);
    if (user.isLoggedIn) {
      AsyncStorage.setItem("jwttoken", user.jwtToken);
      AsyncStorage.setItem("reftoken", user.refreshToken);
      navigation.navigate(APP_ROUTES.HOME_SCREEN);
    }
  }, [user]);

  useEffect(() => {
    setEmailError(error);
  }, [error]);


  const onEmailChange = useCallback(
    (value) => {
      setEmail(value);
      setEmailError(null);
    },
    [setEmail, setEmailError]
  );

  const onPasswordChange = useCallback(
    (value) => {
      setPassword(value);
      setPasswordError(null);
    },
    [setPassword, setPasswordError]
  );

  const onSubmit = useCallback(() => {
    let currentEmailError = null;
    let currentPasswordError = null;
    if (validator.isEmpty(email)) {
      currentEmailError = "Required Field";
    } else if (!validator.isEmail(email)) {
      currentEmailError = "Invalid Email";
    }
    if (validator.isEmpty(password)) {
      currentPasswordError = "Required Field";
    }
    setEmailError(currentEmailError);
    setPasswordError(currentPasswordError);
    if (currentEmailError || currentPasswordError) {
      return;
    }
    userActions.loginUser(email, password);
  }, [email, password]);

  const sleep = (time: any) =>
    new Promise((resolve) => setTimeout(() => resolve(), time));

  // const uploadDataInBackground = async (taskDataArguments: any) => {
  //   const { delay } = taskDataArguments;
  //   await new Promise(async (resolve) => {
  //     for (let i = 0; BackgroundService.isRunning(); i++) {
  //       console.log(i);
  //       await AsyncStorage.setItem("backtest", `${i}`);
  //       await sleep(delay);
  //     }
  //   });
  // };

  // const backCheck = async () => {
  //   const val = await AsyncStorage.getItem("backtest");
  //   console.log("backCheck", val);

  //   const options = {
  //     taskName: "Example",
  //     taskTitle: "ExampleTask title",
  //     taskDesc: "ExampleTask description",
  //     taskIcon: {
  //       name: "ic_launcher",
  //       type: "mipmap",
  //     },
  //     color: "#ff00ff",
  //     linkingURI: "yourSchemeHere://chat/jane", // See Deep Linking for more info
  //     parameters: {
  //       delay: 1000,
  //     },
  //   };
  //   BackgroundService.start(uploadDataInBackground, options);
  // };

//   useEffect(() => {
//     const subscription = AppState.addEventListener("change", nextAppState => {
//       if (
//         appState.current.match(/inactive|background/) &&
//         nextAppState === "active"
//       ) {
//         console.log("App has come to the foreground!");
//       }

//       appState.current = nextAppState;
//       setAppStateVisible(appState.current);
//       console.log("AppState", appState.current);
//       if(appState.current === 'background'){
//         // backCheck()
//       }
//     });

//   }, []);

  return (
    <View style={container}>
      <ShouldRender if={loadingData}>
        <ActivityIndicator animating size="large" color={WHITE} />
      </ShouldRender>
      {/* Header section */}
      <View style={headerStyle}>
        <Image source={LogoDark} style={headerLogoStyle} resizeMode="contain" />
      </View>
      {/* body section section */}
      <View style={inputContainerStyle}>
        <FormTextInput
          onChangeText={onEmailChange}
          value={email}
          fullWidth
          label="Email"
          placeHolder="name@email.com"
          leftIconName="mail"
          error={emailError}
        />
        <FormTextInput
          onChangeText={onPasswordChange}
          value={password}
          secureTextEntry={!showPassword}
          fullWidth
          label="Password"
          placeHolder="Password"
          rightButtonIconName={showPassword ? "eye" : "eye-slash"}
          error={passwordError}
          onRightButtonPress={() => {
            setShowPassword(!showPassword);
          }}
        />
      </View>
      {/* Button section */}
      <View style={buttonSectionContainerStyle}>
        <View style={buttonContainerStyle}>
          <RoundButton
            textStyle={buttonTextStyle}
            title="Login"
            backgroundColor="#009dff"
            borderRadius={50}
            onPress={onSubmit}
            loading={loading}
          />
        </View>
      </View>
      {/* footer section */}
      <View style={footerStyle}>
        <Image
          source={LogoLight}
          style={footerLogoStyle}
          resizeMode="contain"
        />
        <AppText style={footerTextStyle}>
          2021. Copyright info here. All rights reserved.
        </AppText>
      </View>
    </View>
  );
};

export default withUser(Login);
