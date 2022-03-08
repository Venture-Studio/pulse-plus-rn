import React, { FC, useCallback } from "react";
import { TextInput, TextInputProps, TextStyle, View } from "react-native";
import { FontWeightType } from "../utils/types";

interface AppTextProps extends TextInputProps {
  fontWeight?: FontWeightType;
  italic?: boolean;
  style?: TextStyle | TextStyle[];
}

const AppText: FC<AppTextProps> = ({
  fontWeight = "regular",
  italic = false,
  style,
  children,
  ...textInputProps
}) => {
  const getWeight = useCallback(() => {
    if (fontWeight === "regular" && italic) {
      return "";
    }
    return fontWeight
      ?.split("-")
      .map((str) => str.charAt(0).toUpperCase() + str.slice(1))
      .join("");
  }, [fontWeight, italic]);

  return (
    <View>
      <TextInput
        style={[
          { fontFamily: `Mulish-${getWeight()}${italic ? "Italic" : ""}` },
          ...(Array.isArray(style) ? style : [style]),
        ]}
        {...textInputProps}
      >
        {children}
      </TextInput>
    </View>
  );
};

export default AppText;
