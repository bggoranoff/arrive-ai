import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  StyleSheet,
} from "react-native";
import { Plus, ChevronRight, Settings } from "../iconMap";
import IconTile from "../components/IconTile";
import ProgressBar from "../components/ProgressBar";
import PressableScale from "../components/PressableScale";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";
import { t } from "../services/i18n";

interface Props {
  applications: any[];
  onOpenApplication: (appId: string) => void;
  onAddApplication: () => void;
  onOpenSettings: () => void;
  onDeleteApplication: (appId: string) => void;
  language: string;
}

export default function ApplicationList({
  applications,
  onOpenApplication,
  onAddApplication,
  onOpenSettings,
  onDeleteApplication,
  language,
}: Props) {
  const colors = useThemeColors();
  const confirmDelete = (app: any) => {
    Alert.alert(
      t("deleteApplication", language),
      `"${app.title}" — ${t("deleteApplicationConfirm", language)}`,
      [
        { text: t("cancel", language), style: "cancel" },
        {
          text: t("delete", language),
          style: "destructive",
          onPress: () => onDeleteApplication(app.id),
        },
      ],
    );
  };

  const n = applications.length;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.logo}
        />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.ink }]}>{t("myApplications", language)}</Text>
          <Text style={[styles.subtitle, { color: colors.inkMuted }]}>
            {n} {n !== 1 ? t("activeApplicationsPlural", language) : t("activeApplications", language)}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={onOpenSettings}
            activeOpacity={0.7}
          >
            <Settings size={22} color={colors.inkMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.brandSoft }]}
            onPress={onAddApplication}
            activeOpacity={0.7}
          >
            <Plus size={22} color={colors.brand} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {applications.map((app) => (
          <PressableScale
            key={app.id}
            style={[
              styles.card,
              { backgroundColor: colors.surface },
              app.isNew ? [styles.cardNew, { borderColor: colors.brand }] : [styles.cardDefault, { borderColor: colors.cardBorder }],
            ]}
            onPress={() => onOpenApplication(app.id)}
            onLongPress={() => confirmDelete(app)}
            delayLongPress={400}
          >
            <IconTile name={app.icon} size="md" tone="brand" />
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitle, { color: colors.ink }]} numberOfLines={1}>
                  {app.title}
                </Text>
                {app.isNew && (
                  <View style={[styles.newBadge, { backgroundColor: colors.newBadgeBg }]}>
                    <Text style={[styles.newBadgeText, { color: colors.newBadgeText }]}>{t("new", language)}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.cardSubtitle, { color: colors.inkMuted }]}>
                {app.documents.length}{" "}
                {app.documents.length !== 1 ? t("documents", language) : t("document", language)}
                {app.createdAt
                  ? `  ·  ${new Date(app.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`
                  : ""}
              </Text>
              <ProgressBar value={app.progressPct} style={{ marginTop: 12 }} />
            </View>
            <ChevronRight
              size={20}
              color={colors.inkMuted}
              style={{ flexShrink: 0 }}
            />
          </PressableScale>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    marginRight: 12,
    marginTop: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerText: { flex: 1 },
  title: { fontSize: 28, fontWeight: "500", color: defaultColors.ink },
  subtitle: { fontSize: 13, color: defaultColors.inkMuted, marginTop: 2 },
  headerButtons: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingsButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  addButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: defaultColors.brandSoft,
    alignItems: "center", justifyContent: "center",
  },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24, gap: 12 },
  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    padding: 16, backgroundColor: defaultColors.surface,
    borderRadius: 16, borderWidth: 1,
  },
  cardNew: { borderColor: defaultColors.brand },
  cardDefault: { borderColor: defaultColors.cardBorder },
  cardBody: { flex: 1 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  cardTitle: { fontSize: 16, fontWeight: "500", color: defaultColors.ink, flexShrink: 1 },
  cardSubtitle: { fontSize: 13, color: defaultColors.inkMuted, marginTop: 2 },
  newBadge: {
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 10, backgroundColor: defaultColors.newBadgeBg,
  },
  newBadgeText: { fontSize: 11, fontWeight: "600", color: defaultColors.newBadgeText },
});
