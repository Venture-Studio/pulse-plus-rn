import { StyleSheet } from "react-native";
import { RFPercentage } from "react-native-responsive-fontsize";
import { PRIMARY } from "../../styles/colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: PRIMARY,
    fontSize: RFPercentage(3),
  },
  bottomCardConatainer: {
    width: "100%",
    paddingBottom: hp("3%"),
    backgroundColor: "#FCFCFC",
    position: "absolute",
    bottom: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomCardConatainerHidderOn: {
    paddingBottom: 0,
  },
  hideButtonContainer: {
    width: "100%",
    top: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: hp('3%'),
  },
  hideButtonText: {
    color: "#009CFF",
  },
  connectionButtonContainer: {
    width: "95%",
    backgroundColor: "white",
    flexDirection: "row",
    padding: hp('3%'),
    justifyContent: "space-between",
    borderRadius: 20,
    borderColor: "#E8E7E7",
    borderStyle: "solid",
    borderWidth: 2,
  },
  connectionButtonSubContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logonContainer: {
    flexDirection: "row",
  },
  logoText: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#818181",
  },
  logoTextConnected: {
    color: "black",
  },
  buttonStyle: {
    width: wp('40%'),
    borderColor: "#009CFF",
    borderWidth: 2,
    borderStyle: "solid",
    backgroundColor: "rgba(1,1,1,0)",
  },
  buttonStyleDisabled: {
    borderColor: "#F2F2F2",
  },
});

export default styles;
