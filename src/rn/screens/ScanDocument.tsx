import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Camera, Image as ImageIcon, RotateCw } from "../iconMap";
import ScreenHeader from "../components/ScreenHeader";
import { colors } from "../theme";

interface Props {
  onBack: () => void;
  onCapture: () => void;
  onOpenGalleryPopup: () => void;
}

function Bracket({
  top,
  bottom,
  left,
  right,
}: {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
}) {
  return (
    <View
      style={[
        styles.bracket,
        top !== undefined && { top: 16 },
        bottom !== undefined && { bottom: 16 },
        left !== undefined && { left: 16 },
        right !== undefined && { right: 16 },
        top !== undefined && left !== undefined && styles.bracketTL,
        top !== undefined && right !== undefined && styles.bracketTR,
        bottom !== undefined && left !== undefined && styles.bracketBL,
        bottom !== undefined && right !== undefined && styles.bracketBR,
      ]}
    />
  );
}

export default function ScanDocument({
  onBack,
  onCapture,
  onOpenGalleryPopup,
}: Props) {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Scan document" onBack={onBack} />

      <View style={styles.content}>
        <View style={styles.viewfinder}>
          <Bracket top left />
          <Bracket top right />
          <Bracket bottom left />
          <Bracket bottom right />
          <View style={styles.dashedLine} />
          <Text style={styles.hintOverlay}>
            Position document within the frame
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.sideButton}
            onPress={onOpenGalleryPopup}
            activeOpacity={0.7}
          >
            <ImageIcon size={24} color={colors.ink} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.shutter}
            onPress={onCapture}
            activeOpacity={0.8}
          >
            <Camera size={28} color={colors.surface} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideButton} activeOpacity={0.7}>
            <RotateCw size={24} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.hintCard}>
          <Text style={styles.hintTitle}>Tips for best results</Text>
          <Text style={styles.hintBody}>
            Place document on a flat, well-lit surface. Avoid shadows and glare.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  viewfinder: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#0f1115",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  bracket: {
    position: "absolute",
    width: 24,
    height: 24,
  },
  bracketTL: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderTopLeftRadius: 6,
  },
  bracketTR: {
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderTopRightRadius: 6,
  },
  bracketBL: {
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderBottomLeftRadius: 6,
  },
  bracketBR: {
    borderBottomWidth: 2,
    borderRightWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    borderBottomRightRadius: 6,
  },
  dashedLine: {
    position: "absolute",
    left: 40,
    right: 40,
    top: "50%",
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.3)",
  },
  hintOverlay: {
    position: "absolute",
    bottom: 24,
    textAlign: "center",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
  },
  sideButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.screenBg,
    alignItems: "center",
    justifyContent: "center",
  },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  hintCard: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
  },
  hintBody: {
    fontSize: 13,
    color: colors.inkMuted,
    marginTop: 4,
    lineHeight: 18,
  },
});
