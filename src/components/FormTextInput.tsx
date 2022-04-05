import React, { FC, useCallback } from "react";
import {
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { FontWeightType } from "../utils/types";
import AppText from "./AppText";
import AppTextInput from "./AppTextInput";
import Icon from "react-native-vector-icons/AntDesign";
import FIcon from "react-native-vector-icons/FontAwesome";
import ShouldRender from "../utils/ShouldRender";
import { RFPercentage as RF } from "react-native-responsive-fontsize";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const styles = StyleSheet.create({
  containerStyle: {
    marginTop: hp("3%"),
  },
  labelText: {
    fontSize: RF(2.5),
  },
  inputContainerStyle: {
    width: "100%",
    marginTop: hp('1.5%'),
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#b7becc",
    padding: wp('3%'),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 5,
  },
  inputContainerErrorStyle: {
    borderColor: "red",
    backgroundColor: "#ffecec",
  },
  textContainerStyle: {
    flexDirection: "row",
    alignItems: "center",
  },
  textStyle: {
    fontSize: RF(2.5),
    marginLeft: wp('2%'),
    width: wp('65%'),
  },
  errorContainerStyle: {
    marginTop: hp('2%'),
    flexDirection: "row",
    alignItems: "center",
  },
  errorTextStyle: {
    color: "red",
    fontSize: RF(2.3),
    marginLeft: wp('2%'),
  },
});

interface FormTextInputProps extends TextInputProps {
  label: string;
  placeHolder: string;
  width?: number | string;
  fullWidth?: boolean;
  error?: string | null;
  leftIconName?: string;
  rightButtonIconName?: string;
  onRightButtonPress?: () => void;
}

const FormTextInput: FC<FormTextInputProps> = ({
  label,
  placeHolder,
  width,
  fullWidth,
  error,
  leftIconName,
  rightButtonIconName,
  onRightButtonPress,
  ...textInputProps
}) => {
  const {
    containerStyle,
    labelText,
    inputContainerStyle,
    inputContainerErrorStyle,
    textContainerStyle,
    textStyle,
    errorContainerStyle,
    errorTextStyle
  } = styles;

  return (
    <View style={[{ width: fullWidth ? "100%" : width }, containerStyle]}>
      <AppText style={labelText}>{label}</AppText>
      <View
        style={[inputContainerStyle, error ? inputContainerErrorStyle : {}]}
      >
        <View style={textContainerStyle}>
          <ShouldRender if={leftIconName}>
            <Icon size={28} name={leftIconName} color="#6d7d93" />
          </ShouldRender>
          <AppTextInput
            placeholder={placeHolder}
            {...textInputProps}
            style={textStyle}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {
          <ShouldRender if={rightButtonIconName}>
            <View>
              <TouchableOpacity onPress={onRightButtonPress}>
                <FIcon size={28} name={rightButtonIconName} color="#6d7d93" />
              </TouchableOpacity>
            </View>
          </ShouldRender>
        }
      </View>
      <ShouldRender if={error}>
        <View style={errorContainerStyle}>
          <Icon name={"exclamationcircleo"} color="red" size={20} />
          <AppText style={errorTextStyle}>{error}</AppText>
        </View>
      </ShouldRender>
    </View>
  );
};

export default FormTextInput;
