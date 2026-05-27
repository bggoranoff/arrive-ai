import { View, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number;
  style?: ViewStyle;
}

export default function ProgressBar({ value, style }: Props) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <View style={[styles.track, style]}>
      <View style={[styles.fill, { width: `${clamped}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 6,
    width: "100%",
    borderRadius: 3,
    backgroundColor: colors.screenBg,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.brand,
    borderRadius: 3,
  },
});
