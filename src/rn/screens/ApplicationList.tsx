import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Plus, ChevronRight } from "../iconMap";
import IconTile from "../components/IconTile";
import ProgressBar from "../components/ProgressBar";
import { colors } from "../theme";

interface Props {
  applications: any[];
  onOpenApplication: (appId: string) => void;
  onAddApplication: () => void;
}

export default function ApplicationList({
  applications,
  onOpenApplication,
  onAddApplication,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>My Applications</Text>
          <Text style={styles.subtitle}>
            {applications.length} active application
            {applications.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddApplication}
          activeOpacity={0.7}
        >
          <Plus size={22} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {applications.map((app) => (
          <TouchableOpacity
            key={app.id}
            style={[
              styles.card,
              app.isNew ? styles.cardNew : styles.cardDefault,
            ]}
            onPress={() => onOpenApplication(app.id)}
            activeOpacity={0.8}
          >
            <IconTile name={app.icon} size="md" tone="brand" />
            <View style={styles.cardBody}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {app.title}
                </Text>
                {app.isNew && (
                  <View style={styles.newBadge}>
                    <Text style={styles.newBadgeText}>New</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardSubtitle}>
                {app.documents.length} document
                {app.documents.length !== 1 ? "s" : ""}
              </Text>
              <ProgressBar value={app.progressPct} style={{ marginTop: 12 }} />
            </View>
            <ChevronRight
              size={20}
              color={colors.inkMuted}
              style={{ flexShrink: 0 }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "500",
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
  },
  cardNew: {
    borderColor: colors.brand,
  },
  cardDefault: {
    borderColor: colors.cardBorder,
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.ink,
    flexShrink: 1,
  },
  cardSubtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: colors.newBadgeBg,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.newBadgeText,
  },
});
