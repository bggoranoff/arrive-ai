import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { CalendarDays, Bell, Calendar } from "../iconMap";
import BottomSheet from "../components/BottomSheet";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";
import * as ExpoCalendar from "expo-calendar";
import * as Notifications from "expo-notifications";
import { t } from "../services/i18n";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

interface Props {
  open: boolean;
  onClose: () => void;
  deadline: any;
  app: any;
  language?: string;
}

async function getDefaultCalendarId(): Promise<string | null> {
  const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
  if (status !== "granted") return null;

  const calendars = await ExpoCalendar.getCalendarsAsync(
    ExpoCalendar.EntityTypes.EVENT,
  );

  const defaultCal =
    calendars.find((c) => c.allowsModifications && c.source?.name === "iCloud") ??
    calendars.find((c) => c.allowsModifications && c.source?.name === "Default") ??
    calendars.find((c) => c.allowsModifications);

  return defaultCal?.id ?? null;
}

export default function DeadlineSheet({
  open,
  onClose,
  deadline,
  app,
  language = "English",
}: Props) {
  const colors = useThemeColors();
  if (!deadline) return null;

  const deadlineDate = new Date(deadline.year, deadline.month - 1, deadline.day);
  const dateStr = deadlineDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const addToCalendar = async () => {
    try {
      const calId = await getDefaultCalendarId();
      if (!calId) {
        Alert.alert(
          t("calendarPermission", language),
          t("calendarPermissionDesc", language),
        );
        return;
      }

      const startDate = new Date(
        deadline.year,
        deadline.month - 1,
        deadline.day,
        9,
        0,
      );
      const endDate = new Date(
        deadline.year,
        deadline.month - 1,
        deadline.day,
        10,
        0,
      );

      await ExpoCalendar.createEventAsync(calId, {
        title: `${app.title}: ${deadline.label}`,
        startDate,
        endDate,
        notes: `ArriveAI deadline for your ${app.title} application.`,
        alarms: [{ relativeOffset: -60 }],
      });

      Alert.alert(
        t("addedToCalendar", language),
        t("addedToCalendarDesc", language),
      );
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const setReminder = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          t("notificationPermission", language),
          t("notificationPermissionDesc", language),
        );
        return;
      }

      const reminderDate = new Date(
        deadline.year,
        deadline.month - 1,
        deadline.day,
        9,
        0,
      );

      const now = new Date();
      if (reminderDate <= now) {
        Alert.alert(
          t("pastDeadline", language),
          t("pastDeadlineDesc", language),
        );
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `ArriveAI: ${app.title}`,
          body: deadline.label,
          sound: true,
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: reminderDate },
      });

      Alert.alert(
        t("reminderSet", language),
        `${dateStr} — 9:00`,
      );
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: colors.deadlineBg }]}>
            <CalendarDays size={22} color={colors.deadlineText} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.dateText, { color: colors.ink }]}>{dateStr}</Text>
            <Text style={[styles.label, { color: colors.inkMuted }]}>
              {deadline.label}
            </Text>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.screenBg }]}>
          <Text style={[styles.infoLabel, { color: colors.inkMuted }]}>
            {t("application", language)}
          </Text>
          <Text style={[styles.infoValue, { color: colors.ink }]}>{app.title}</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={addToCalendar}
            activeOpacity={0.7}
          >
            <Calendar size={18} color={colors.brand} />
            <Text style={[styles.actionText, { color: colors.ink }]}>
              {t("addToCalendarBtn", language)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.brand, borderColor: colors.brand }]}
            onPress={setReminder}
            activeOpacity={0.7}
          >
            <Bell size={18} color={colors.surface} />
            <Text style={[styles.actionText, { color: colors.surface }]}>
              {t("setReminder", language)}
            </Text>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  dateText: { fontSize: 17, fontWeight: "600" },
  label: { fontSize: 14, marginTop: 2 },
  infoCard: {
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoLabel: { fontSize: 12, fontWeight: "500" },
  infoValue: { fontSize: 15, fontWeight: "500", marginTop: 4 },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
