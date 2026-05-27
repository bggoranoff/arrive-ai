import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronLeft } from "../iconMap";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";

interface Props {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}

export default function ScreenHeader({ title, onBack, right }: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <ChevronLeft size={24} color={colors.ink} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.ink }]} numberOfLines={1}>
        {title}
      </Text>
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    marginLeft: -8,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "500",
    color: defaultColors.ink,
    paddingRight: 8,
  },
  right: {
    flexShrink: 0,
  },
});
