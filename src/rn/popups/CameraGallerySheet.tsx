import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, Image as ImageIcon } from "../iconMap";
import BottomSheet from "../components/BottomSheet";
import { colors } from "../theme";

interface Props {
  open: boolean;
  onClose: () => void;
  onChoose: (source: "camera" | "gallery") => void;
}

export default function CameraGallerySheet({
  open,
  onClose,
  onChoose,
}: Props) {
  return (
    <BottomSheet open={open} onClose={onClose}>
      <View style={styles.content}>
        <Text style={styles.title}>Add a document</Text>
        <Text style={styles.subtitle}>
          Choose how you'd like to add your document.
        </Text>

        <View style={styles.options}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => onChoose("camera")}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <Camera size={22} color={colors.brand} />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Take a photo</Text>
              <Text style={styles.optionSubtitle}>
                Use your camera to scan
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => onChoose("gallery")}
            activeOpacity={0.7}
          >
            <View style={styles.optionIcon}>
              <ImageIcon size={22} color={colors.brand} />
            </View>
            <View style={styles.optionBody}>
              <Text style={styles.optionTitle}>Choose from gallery</Text>
              <Text style={styles.optionSubtitle}>
                Select an existing photo
              </Text>
            </View>
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
  options: {
    marginTop: 16,
    gap: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderRadius: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  optionBody: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.ink,
  },
  optionSubtitle: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 2,
  },
});
