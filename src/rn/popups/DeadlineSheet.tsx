import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CalendarDays, Bell } from "../iconMap";
import BottomSheet from "../components/BottomSheet";
import { colors } from "../theme";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Props {
  open: boolean;
  onClose: () => void;
  deadline: any;
  app: any;
}

export default function DeadlineSheet({
  open,
  onClose,
  deadline,
  app,
}: Props) {
  if (!deadline) return null;

  const dateStr = `${deadline.day} ${monthNames[deadline.month - 1]} ${deadline.year}`;

  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <CalendarDays size={22} color={colors.deadlineText} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.dateText}>{dateStr}</Text>
            <Text style={styles.label}>{deadline.label}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Application</Text>
          <Text style={styles.infoValue}>{app.title}</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.remindButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Bell size={16} color={colors.surface} />
            <Text style={styles.remindButtonText}>Remind me</Text>
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
    backgroundColor: colors.deadlineBg,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  dateText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.ink,
  },
  label: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
  infoCard: {
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: colors.screenBg,
    padding: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.inkMuted,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.ink,
    marginTop: 4,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  closeButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.ink,
  },
  remindButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.brand,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  remindButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.surface,
  },
});
