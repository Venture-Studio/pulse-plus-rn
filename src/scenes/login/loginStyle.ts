import { StyleSheet } from "react-native";
import { RFPercentage as RP } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { PRIMARY, WHITE } from "../../styles/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    flexDirection: "column",
  },
  textStyle: {
    alignSelf: "center",
    flex: 0.5,
    fontSize: RP(3),
    color: PRIMARY,
  },
  loginButton: {
    position: "absolute",
    alignSelf: "center",
    width: wp("55%"),
  },
  headerStyle: {
    backgroundColor: "#F9F8FA",
    width: wp("100%"),
    top: 0,
    paddingLeft: wp("5%"),
  },
  headerLogoStyle: {
    height: wp("30%"),
    width: wp("30%"),
  },
  inputContainerStyle: {
    paddingHorizontal: wp("5%"),
  },
  buttonSectionContainerStyle: {
    alignItems: "center",
    marginTop: hp("3%"),
  },
  buttonContainerStyle: {
    width: wp("60%"),
  },
  buttonTextStyle: {
    fontSize: RP(2.8),
    color: "white",
    fontWeight: "bold",
  },
  forgotPasswordCotainerStyle: {
    marginTop: hp("1%"),
  },
  signUpButtonCotainerStyle: {
    flexDirection: "row",
  },
  linkButtonTextStyle: {
    fontSize: RP(2.3),
    color: "#009dff",
    fontWeight: "bold",
  },
  normalTextStyle: {
    fontSize: RP(2.3),
    fontWeight: "bold",
  },
  footerStyle: {
    backgroundColor: "#3F225F",
    padding: wp("3%"),
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  footerLogoStyle: {
    height: wp("25%"),
    width: wp("25%"),
  },
  footerTextStyle: {
    fontSize: RP(2),
    color: "white",
  },
});

export default styles;
