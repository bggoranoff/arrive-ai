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
import { colors } from "../theme";
import { applicationCatalog } from "../../data/mockData";

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (catalogId: string) => void;
  existingIds: string[];
}

export default function AddApplicationSheet({
  open,
  onClose,
  onPick,
  existingIds,
}: Props) {
  const available = applicationCatalog.filter(
    (c: any) => !existingIds.includes(c.id)
  );

  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <Text style={styles.title}>Add an application</Text>
        <Text style={styles.subtitle}>
          Choose from available applications below.
        </Text>
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {available.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.row}
              onPress={() => onPick(item.id)}
              activeOpacity={0.7}
            >
              <IconTile name={item.icon} size="md" tone="brand" />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
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
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: colors.inkMuted,
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
    color: colors.ink,
  },
  rowSubtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
});
