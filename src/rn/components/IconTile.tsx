import { View, StyleSheet } from "react-native";
import { getIcon } from "../iconMap";
import { colors } from "../theme";

const sizeMap = {
  sm: { box: 36, radius: 8, icon: 18 },
  md: { box: 44, radius: 12, icon: 22 },
  lg: { box: 48, radius: 12, icon: 24 },
};

const toneMap = {
  brand: { bg: colors.brandSoft, fg: colors.brand },
  deadline: { bg: colors.deadlineBg, fg: colors.deadlineText },
  muted: { bg: colors.screenBg, fg: colors.inkMuted },
};

interface Props {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: "brand" | "deadline" | "muted";
}

export default function IconTile({ name, size = "md", tone = "brand" }: Props) {
  const s = sizeMap[size];
  const t = toneMap[tone];
  const Icon = getIcon(name);

  return (
    <View
      style={[
        styles.box,
        {
          width: s.box,
          height: s.box,
          borderRadius: s.radius,
          backgroundColor: t.bg,
        },
      ]}
    >
      <Icon size={s.icon} color={t.fg} />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
