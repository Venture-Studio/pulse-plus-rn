import {
  NavigationContainerRef,
  useFocusEffect,
} from "@react-navigation/native";
import React, { FC, JSX, useEffect, useRef, useState } from "react";
import { Dimensions, Text, View, TouchableOpacity } from "react-native";
import NotchHelper from "../../components/NotchHelper";
import RoundButton from "../../components/RoundButton";
import AppText from "../../components/AppText";
import { withUser } from "../../contexts/user_context";
import { UserStateProps } from "../../contexts/user_context/actionTypes";
import { APP_STRINGS, APP_URLS, AppleDataTypes } from "../../utils/constants";
import ShouldRender from "../../utils/ShouldRender";
import styles from "./homeStyles";
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from "react-native-health";
import { WebView } from "react-native-webview";
import Icon from "react-native-vector-icons/AntDesign";
import moment from "moment";
import _ from "lodash";
import {
  postRawData,
  getLatest,
} from "../../contexts/user_context/api";

interface HomeProps {
  navigation: NavigationContainerRef;
  userState: UserStateProps;
}

/* Permission options */
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.ActivitySummary,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.BasalEnergyBurned,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
    write: [AppleHealthKit.Constants.Permissions.Steps],
  },
} as HealthKitPermissions;

const Home: FC<HomeProps> = ({
  navigation,
  userState,
}: HomeProps): JSX.Element => {
  const {
    container,
    title,
    bottomCardConatainer,
    bottomCardConatainerHidderOn,
    hideButtonContainer,
    hideButtonText,
    connectionButtonContainer,
    connectionButtonSubContainer,
    logonContainer,
    logoText,
    logoTextConnected,
    buttonStyle,
  } = styles;

  const [mounted, setMounted] = useState<boolean>(false);
  const [webUrl, setWebUrl] = useState<string>("");
  const { user } = userState;
  const webRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [sleepSynced, setSleepSynced] = useState(false);
  const [activitySynced, setActivitySynced] = useState(false);
  const [workoutSynced, setWorkoutSynced] = useState(false);
  const [heartSynced, setHeartSynced] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [stepsData, setStepsData] = useState<any>(null);
  const [basalEnergyData, setBasalEnergyData] = useState<any>(null);
  const [activeEnergyData, setActiveEnergyData] = useState<any>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setWebUrl(`${APP_URLS.API_URL}auth/signin?token=${user.jwtToken}`);
  }, [user.jwtToken]);

  useEffect(() => {
    try {
      if (stepsData && activeEnergyData && basalEnergyData) {
        if (stepsData.length === 0) {
          sendRawData(AppleDataTypes.ActivityError, ["Empty steps array found"]);
        }
        if (activeEnergyData.length === 0) {
          sendRawData(AppleDataTypes.ActivityError, [
            "Empty activeEnergy array found",
          ]);
        }
        if (basalEnergyData.length === 0) {
          sendRawData(AppleDataTypes.ActivityError, [
            "Empty basalEnergy array found",
          ]);
        }
        const data = [
          {
            basalEnergy: basalEnergyData,
            activeEnergy: activeEnergyData,
            steps: stepsData,
          },
        ];
        sendRawData("activity", data);
        setStepsData(null);
        setActiveEnergyData(null);
        setBasalEnergyData(null);
      }
    } catch (error) {
      setActivitySynced(true);
      sendRawData(AppleDataTypes.ActivityError, [error]);
    }

  }, [stepsData, activeEnergyData, basalEnergyData]);

  useEffect(() => {
    if (activitySynced && heartSynced && sleepSynced && workoutSynced) {
      setSyncing(false);
      setConnected(true);
    }
  }, [activitySynced, heartSynced, sleepSynced, workoutSynced]);

  function setPostRawDataState(name: string) {
    if (name === AppleDataTypes.Sleep) {
      setSleepSynced(true);
    } else if (name === AppleDataTypes.Heartrate) {
      setHeartSynced(true);
    } else if (name === AppleDataTypes.Workout) {
      setWorkoutSynced(true);
    } else if (name === AppleDataTypes.Activity) {
      setActivitySynced(true);
    }
  }

  async function sendRawData(name: string, data: any) {
    postRawData(name, data, moment(new Date()).toISOString())
      .then((res) => {
        setPostRawDataState(name);
      })
      .catch((err) => {
        setPostRawDataState(name);
      });
  }

  async function syncSleepData() {
    try {
      const res = await getLatest("sleep").catch((err) => {
        sendRawData(AppleDataTypes.SleepError, err);
      });
      const latest = res?.data?.timestamp;

      const options = {
        startDate:
          latest ?? moment(new Date()).subtract(3, "months").toISOString(),
        endDate: new Date().toISOString(),
      };
      AppleHealthKit.getSleepSamples(
        options,
        (err: Object, results: Array<HealthValue>) => {
          if (err) {
            sendRawData(AppleDataTypes.SleepError, err);
            setSleepSynced(true);
            return;
          }
          if (results.length === 0) {
            sendRawData(AppleDataTypes.SleepError, ["Empty array found"]);
            setSleepSynced(true);
            return;
          }
          sendRawData(AppleDataTypes.Sleep, results);
        }
      );
    } catch (error) {
      setSleepSynced(true);
      sendRawData(AppleDataTypes.SleepError, [error]);
    }
  }

  async function syncHeartRateData() {
    try {
      const res = await getLatest("heartrate").catch((err) => {
        sendRawData(AppleDataTypes.Heartrate, err);
      });
      const latest = res?.data?.timestamp;
      const options = {
        startDate:
          latest ?? moment(new Date()).subtract(3, "months").toISOString(),
        endDate: new Date().toISOString(),
      };
      AppleHealthKit.getHeartRateSamples(
        options,
        (callbackError: string, results: HealthValue[]) => {
          if (callbackError) {
            sendRawData(AppleDataTypes.HeartrateError, callbackError);
            setHeartSynced(true);
            return;
          }
          if (results.length === 0) {
            setHeartSynced(true);
            sendRawData(AppleDataTypes.HeartrateError, ["Empty array found"]);
            return;
          }
          sendRawData(AppleDataTypes.Heartrate, results);
        }
      );
    } catch (error) {
      setHeartSynced(true);
      sendRawData(AppleDataTypes.HeartrateError, [error]);
    }
  }

  async function syncWorkoutData() {
    try {
      const res = await getLatest("workout").catch((err) => {
        sendRawData(AppleDataTypes.WorkoutError, err);
      });
      const latest = res?.data?.timestamp;

      const options = {
        startDate:
          latest ?? moment(new Date()).subtract(3, "months").toISOString(),
        endDate: new Date().toISOString(),
      };
      AppleHealthKit.getAnchoredWorkouts(options, (err: Object, results) => {
        if (err) {
          setWorkoutSynced(true);
          sendRawData(AppleDataTypes.WorkoutError, err);
          return;
        }
        if (results.data.length === 0) {
          setWorkoutSynced(true);
          sendRawData(AppleDataTypes.WorkoutError, ["Empty array found"]);
          return;
        }
        sendRawData(AppleDataTypes.Workout, results.data);
      });
    } catch (error) {
      setWorkoutSynced(true);
      sendRawData(AppleDataTypes.WorkoutError, [error]);
    }
  }

  async function syncStepsData() {
    try {
      const res = await getLatest("activity").catch((err) => {
        sendRawData(AppleDataTypes.ActivityError, err);
      });
      const latest = res?.data?.timestamp;

      const options = {
        startDate:
          latest ?? moment(new Date()).subtract(3, "months").toISOString(),
        endDate: new Date().toISOString(),
      };

      AppleHealthKit.getBasalEnergyBurned(options, (err: Object, results) => {
        if (err) {
          sendRawData(AppleDataTypes.Heartrate, err);
          setActivitySynced(true);
          return;
        }
        setBasalEnergyData(results);
      });

      AppleHealthKit.getActiveEnergyBurned(options, (err: Object, results) => {
        if (err) {
          sendRawData(AppleDataTypes.ActivityError, err);
          setActivitySynced(true);
          return;
        }
        setActiveEnergyData(results);
      });

      AppleHealthKit.getDailyStepCountSamples(
        options,
        (err: Object, results) => {
          if (err) {
            sendRawData(AppleDataTypes.ActivityError, err);
            setActivitySynced(true);
            return;
          }
          setStepsData(results);
        }
      );
    } catch (error) {
      setActivitySynced(true);
      sendRawData(AppleDataTypes.ActivityError, [error]);
    }
  }

  const connectToApple = React.useCallback(() => {
    setMounted(true);

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      /* Called after we receive a response from the system */

      if (error) {
        console.log("[ERROR] Cannot grant permissions!");
        return;
      }
      setActivitySynced(false);
      setWorkoutSynced(false);
      setHeartSynced(false);
      setSleepSynced(false);
      setSyncing(true);

      /* Can now read or write to HealthKit */

      const options = {
        startDate: new Date(2022, 1, 1).toISOString(),
        endDate: new Date().toISOString(),
      };
      syncHeartRateData();
      syncSleepData();
      syncWorkoutData();
      syncStepsData();
    });

    return () => {
      setMounted(false);
    };
  }, []);

  const windowWidth = Dimensions.get("window").width;

  return (
    <View style={container}>
      <NotchHelper />
      <WebView
        ref={webRef}
        automaticallyAdjustContentInsets
        startInLoadingState
        style={{ width: windowWidth }}
        javaScriptEnabled
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        limitsNavigationsToAppBoundDomains
        nativeConfig
        onLoadEnd={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.log("WebView load end url: ", nativeEvent.url);
          webRef?.current.postMessage("Data from React Native App");
        }}
        source={{
          uri: `https://www.pulse.plus/dashboard`,
          headers: {
            Cookie: `auth-cookie-jwt=${user.jwtToken}; auth-cookie-refresh=${user.refreshToken}`,
          },
        }}
        sharedCookiesEnabled={true}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
        }}
      />

      <View
        style={[
          bottomCardConatainer,
          hidden ? bottomCardConatainerHidderOn : {},
        ]}
      >
        <View style={hideButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              setHidden(!hidden);
            }}
          >
            <AppText style={hideButtonText}>
              {hidden ? "Connect to apple watch" : "Hide"}
            </AppText>
          </TouchableOpacity>
        </View>
        <ShouldRender if={!hidden}>
          <View style={connectionButtonContainer}>
            <View style={connectionButtonSubContainer}>
              <View style={logonContainer}>
                <Icon
                  size={25}
                  name="apple1"
                  color={connected ? "black" : "#818181"}
                />
                <AppText style={[logoText, connected ? logoTextConnected : {}]}>
                  WATCH
                </AppText>
              </View>
              <ShouldRender if={connected}>
                <View>
                  <AppText>Connected</AppText>
                </View>
              </ShouldRender>
            </View>

            <RoundButton
              onPress={connectToApple}
              title={syncing ? "Syncing" : connected ? "Sync" : "Connect"}
              borderRadius={50}
              textStyle={{ fontSize: 18 }}
              loading={syncing}
              activityIndicatorColor={"#009CFF"}
              buttonStyle={buttonStyle}
            />
          </View>
        </ShouldRender>
      </View>
    </View>
  );
};

export default withUser(Home);
