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
import { APP_STRINGS, APP_URLS } from "../../utils/constants";
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
import { FormatActivityData, FormatSleepData } from "./helpers";
import {
  postSleepData,
  postHeartRateData,
  postWorkoutData,
  postActivityData,
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
    if (stepsData && activeEnergyData && basalEnergyData) {
      const endPointData = _.values(
        FormatActivityData(stepsData, activeEnergyData, basalEnergyData)
      );
      if (endPointData.length === 0) {
        setActivitySynced(true);
        return;
      }
      postActivityData(endPointData)
        .then((res) => {
          setActivitySynced(true);
        })
        .catch((err) => {
          sendRawData("activity-data-post-error", err);
          console.log("erractivity", err);
        });
      setStepsData(null);
      setActiveEnergyData(null);
      setBasalEnergyData(null);
    }
  }, [stepsData, activeEnergyData, basalEnergyData]);

  useEffect(() => {
    if (activitySynced && heartSynced && sleepSynced && workoutSynced) {
      setSyncing(false);
      setConnected(true);
    }
  }, [activitySynced, heartSynced, sleepSynced, workoutSynced]);

  function setPostRawDataState(name: string) {
    if (name === "sleep") {
      setSleepSynced(true);
    } else if (name === "heartrate") {
      setHeartSynced(true);
    } else if (name === "workout") {
      setWorkoutSynced(true);
    } else if (
      (name === "basalenergy" ||
        name === "activeenergy" ||
        name === "stepcount") &&
      stepsData &&
      activeEnergyData &&
      basalEnergyData
    ) {
      setActivitySynced(true);
    }
  }

  async function sendRawData(name: string, data: any) {
    postRawData(name, data)
      .then((res) => {
        setPostRawDataState(name);
        console.log("raw data posted", res);
      })
      .catch((err) => {
        setPostRawDataState(name);
      });
  }

  async function syncSleepData() {
    const res = await getLatest("sleep").catch((err) => {
      sendRawData("sleep-latest-fetch-error", err);
    });
    const latest = res?.data?.sleep?.[0]?.bedtime_stop;

    const options = {
      startDate:
        latest ?? moment(new Date()).subtract(3, "months").toISOString(),
      endDate: new Date().toISOString(),
    };
    AppleHealthKit.getSleepSamples(
      options,
      (err: Object, results: Array<HealthValue>) => {
        if (err) {
          sendRawData("sleep-data-fetch-error", err);
          return;
        }
        if (results.length === 0) {
          setSleepSynced(true);
          return;
        }
        sendRawData("sleep", results);
        console.log("sleep", results);
        const endPointData = _.values(FormatSleepData(results));
        postSleepData(endPointData)
          .then((res) => {
            setSleepSynced(true);
          })
          .catch((err) => {
            sendRawData("sleep-data-post-error", err);
          });
      }
    );
  }

  async function syncHeartRateData() {
    const res = await getLatest("heartrate").catch((err) => {
      sendRawData("heartrate-latest-fetch-error", err);
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
          sendRawData("heartrate-data-fetch-error", callbackError);
          return;
        }

        if (results.length === 0) {
          setHeartSynced(true);
          return;
        }
        sendRawData("heartrate", results);
        /* Samples are now collected from HealthKit */
        const endPointData = results.map((item) => {
          return {
            timestamp: item.startDate,
            value: item.value,
          };
        });
        postHeartRateData(endPointData)
          .then((res) => {
            setHeartSynced(true);
          })
          .catch((err) => {
            sendRawData("heartrate-data-post-error", err);
            console.log("err", err);
          });
      }
    );
  }

  async function syncWorkoutData() {
    const res = await getLatest("workout").catch((err) => {
      sendRawData("workout-latest-fetch-error", err);
    });
    const latest = res?.data?.workouts?.[0]?.time_end;

    const options = {
      startDate:
        latest ?? moment(new Date()).subtract(3, "months").toISOString(),
      endDate: new Date().toISOString(),
    };
    AppleHealthKit.getAnchoredWorkouts(options, (err: Object, results) => {
      if (err) {
        sendRawData("workout-data-fetch-error", err);
        return;
      }
      if (results.data.length === 0) {
        setWorkoutSynced(true);
        return;
      }
      sendRawData("workout", results.data);
      const endPointData = results.data.map((item: any) => {
        return {
          time_start: item.start,
          time_end: item.end,
          calories: item.calories,
        };
      });

      postWorkoutData(endPointData)
        .then((res) => {
          setWorkoutSynced(true);
        })
        .catch((err) => {
          sendRawData("workout-data-post-error", err);
        });
    });
  }

  async function syncStepsData() {
    const res = await getLatest("activity").catch((err) => {
      sendRawData("activity-latest-fetch-error", err);
    });
    const latest = res?.data?.activity?.[0]?.date;

    const options = {
      startDate:
        latest ?? moment(new Date()).subtract(3, "months").toISOString(),
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getBasalEnergyBurned(options, (err: Object, results) => {
      if (err) {
        sendRawData("basal-energy-data-fetch-error", err);
        return;
      }
      sendRawData("basalenergy", results);
      setBasalEnergyData(results);
    });

    AppleHealthKit.getActiveEnergyBurned(options, (err: Object, results) => {
      if (err) {
        sendRawData("active-energy-data-fetch-error", err);
        return;
      }
      sendRawData("activeenergy", results);
      setActiveEnergyData(results);
    });

    AppleHealthKit.getDailyStepCountSamples(options, (err: Object, results) => {
      if (err) {
        sendRawData("step-data-fetch-error", err);
        return;
      }
      sendRawData("stepcount", results);
      setStepsData(results);
    });
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
