import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { ChevronRight } from "../iconMap";
import BottomSheet from "../components/BottomSheet";
import IconTile from "../components/IconTile";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";
import { applicationCatalog } from "../../data/mockData";
import { t } from "../services/i18n";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (catalogId: string) => void;
  language?: string;
}

export default function AddApplicationSheet({
  open,
  onClose,
  onPick,
  language = "English",
}: Props) {
  const colors = useThemeColors();
  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.ink }]}>{t("addApplication", language)}</Text>
        <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
          {t("chooseApplication", language)}
        </Text>
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {applicationCatalog.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.row}
              onPress={() => onPick(item.id)}
              activeOpacity={0.7}
            >
              <IconTile name={item.icon} size="md" tone="brand" />
              <View style={styles.rowBody}>
                <Text style={[styles.rowTitle, { color: colors.ink }]}>{item.title}</Text>
                <Text style={[styles.rowSubtitle, { color: colors.inkMuted }]}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={18} color={colors.inkMuted} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "500",
    color: defaultColors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: defaultColors.inkMuted,
    marginTop: 4,
  },
  list: {
    marginTop: 16,
    maxHeight: 440,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: defaultColors.ink,
  },
  rowSubtitle: {
    fontSize: 13,
    color: defaultColors.inkMuted,
    marginTop: 2,
  },
});
