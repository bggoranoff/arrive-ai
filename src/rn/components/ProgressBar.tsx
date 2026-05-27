import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, ViewStyle } from "react-native";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";

interface Props {
  value: number;
  style?: ViewStyle;
}

export default function ProgressBar({ value, style }: Props) {
  const colors = useThemeColors();
  const clamped = Math.max(0, Math.min(100, value));
  const widthAnim = useRef(new Animated.Value(clamped)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: clamped,
      useNativeDriver: false,
      speed: 12,
      bounciness: 4,
    }).start();
  }, [clamped]);

  const widthInterp = widthAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.track, { backgroundColor: colors.screenBg }, style]}>
      <Animated.View
        style={[styles.fill, { width: widthInterp, backgroundColor: colors.brand }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    backgroundColor: defaultColors.screenBg,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: defaultColors.brand,
    borderRadius: 3,
  },
});
