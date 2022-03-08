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
import { widthPercentageToDP } from "react-native-responsive-screen";
import Icon from "react-native-vector-icons/AntDesign";
import axios from "axios";
import moment from "moment";
import _ from "lodash";
import { FormatActivityData, FormatSleepData } from "./helpers";

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
    buttonStyle
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

  function onMessage(data: any) {
    console.log("🚀 ~ file: index.tsx ~ line 39 ~ onMessage ~ data", data);
  }

  useEffect(() => {
    console.log(`${APP_URLS.API_URL}auth/signin?token=${user.jwtToken}`);
  }, [mounted]);

  useEffect(() => {
    console.log("webRef", webRef.current);
  }, [webRef]);

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
      axios
        .post(`${APP_URLS.API_URL}activity`, { activity: endPointData })
        .then((res) => {
          setActivitySynced(true);
        })
        .catch((err) => {
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

  async function syncSleepData() {
    const res = await axios.get(`${APP_URLS.API_URL}sleep/latest`);
    const latest = res?.data?.sleep?.[0].bedtime_stop;

    const options = {
      startDate:
        latest ?? moment(new Date()).subtract(3, "months").toISOString(),
      endDate: new Date().toISOString(),
    };
    AppleHealthKit.getSleepSamples(
      options,
      (err: Object, results: Array<HealthValue>) => {
        if (err) {
          return;
        }
        if (results.length === 0) {
          setSleepSynced(true);
          return;
        }
        const endPointData = _.values(FormatSleepData(results));
        console.log("endPointData", endPointData);
        axios
          .post(`${APP_URLS.API_URL}sleep`, { sleep: endPointData })
          .then((res) => {
            setSleepSynced(true);
          })
          .catch((err) => {
            console.log("errsleep", err);
          });
      }
    );
  }

  async function syncHeartRateData() {
    const res = await axios.get(`${APP_URLS.API_URL}heartrate/latest`);
    const latest = res?.data?.timestamp;

    const options = {
      startDate:
        latest ?? moment(new Date()).subtract(3, "months").toISOString(),
      endDate: new Date().toISOString(),
    };
    AppleHealthKit.getHeartRateSamples(
      options,
      (callbackError: string, results: HealthValue[]) => {
        if (results.length === 0) {
          setHeartSynced(true);
          return;
        }
        /* Samples are now collected from HealthKit */
        const endPointData = results.map((item) => {
          return {
            timestamp: item.startDate,
            value: item.value,
          };
        });
        const reqBody = { heartrate: endPointData };
        axios
          .post(`${APP_URLS.API_URL}heartrate`, reqBody)
          .then((res) => {
            setHeartSynced(true);
          })
          .catch((err) => {
            console.log("err", err);
          });
      }
    );
  }

  async function syncWorkoutData() {
    const res = await axios.get(`${APP_URLS.API_URL}workout/latest`);
    const latest = res?.data?.workouts?.[0]?.time_end;

    const options = {
      startDate:
        latest ?? moment(new Date()).subtract(3, "months").toISOString(),
      endDate: new Date().toISOString(),
    };
    AppleHealthKit.getAnchoredWorkouts(options, (err: Object, results) => {
      if (err) {
        return;
      }
      if (results.data.length === 0) {
        setWorkoutSynced(true);
        return;
      }
      const endPointData = results.data.map((item: any) => {
        return {
          time_start: item.start,
          time_end: item.end,
          calories: item.calories,
        };
      });

      axios
        .post(`${APP_URLS.API_URL}workout`, { workouts: endPointData })
        .then((res) => {
          setWorkoutSynced(true);
        })
        .catch((err) => {
          console.log("errworkout", err);
        });
    });
  }

  async function syncStepsData() {
    const res = await axios.get(`${APP_URLS.API_URL}activity/latest`);
    const latest = res?.data?.activity?.[0]?.date;

    const options = {
      startDate:
        latest ?? moment(new Date()).subtract(3, "months").toISOString(),
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getBasalEnergyBurned(options, (err: Object, results) => {
      if (err) {
        return;
      }
      setBasalEnergyData(results);
    });

    AppleHealthKit.getActiveEnergyBurned(options, (err: Object, results) => {
      if (err) {
        return;
      }
      setActiveEnergyData(results);
    });

    AppleHealthKit.getDailyStepCountSamples(options, (err: Object, results) => {
      if (err) {
        return;
      }
      setStepsData(results);
    });
  }

  const connectToApple = React.useCallback(() => {
    setMounted(true);
    setActivitySynced(false);
    setWorkoutSynced(false);
    setHeartSynced(false);
    setSleepSynced(false);
    setSyncing(true);

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      /* Called after we receive a response from the system */

      if (error) {
        console.log("[ERROR] Cannot grant permissions!");
      }

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
          uri: `https://www.pulse.plus/`,
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
