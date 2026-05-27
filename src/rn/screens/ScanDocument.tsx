import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon } from "../iconMap";
import ScreenHeader from "../components/ScreenHeader";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";
import { t } from "../services/i18n";

interface Props {
  onBack: () => void;
  onCapture: (imageUri: string) => void;
  onOpenGalleryPopup?: () => void;
  language?: string;
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
  language = "English",
}: Props) {
  const colors = useThemeColors();
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (source: "camera" | "gallery") => {
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        console.log("[scan] camera permission:", perm.status, "canAskAgain:", perm.canAskAgain);
        if (perm.status !== "granted") {
          Alert.alert(
            "Camera access needed",
            "Go to Settings > Expo Go and enable Camera, then try again.",
          );
          return;
        }
      }

      console.log("[scan] launching", source);
      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });

      console.log("[scan] result:", result.canceled ? "canceled" : result.assets?.[0]?.uri?.slice(0, 50));

      if (result.canceled || !result.assets?.[0]) return;
      setPreview(result.assets[0].uri);
    } catch (e: any) {
      console.error("[scan] error:", e.message);
      Alert.alert("Error", e.message);
    }
  };

  const confirm = () => {
    if (!preview) return;
    setBusy(true);
    onCapture(preview);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={t("scanDocument", language)} onBack={onBack} />

      <View style={styles.content}>
        <View style={styles.viewfinder}>
          {preview ? (
            <Image
              source={{ uri: preview }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />
          ) : (
            <>
              <Bracket top left />
              <Bracket top right />
              <Bracket bottom left />
              <Bracket bottom right />
              <View style={styles.dashedLine} />
              <Text style={styles.hintOverlay}>
                {t("scanHint", language)}
              </Text>
            </>
          )}
        </View>

        {preview ? (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.retakeButton, { backgroundColor: colors.screenBg, borderColor: colors.cardBorder }]}
              onPress={() => setPreview(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.retakeText, { color: colors.ink }]}>
                {t("retake", language)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.shutter, { backgroundColor: colors.brand }, busy && { opacity: 0.5 }]}
              onPress={confirm}
              disabled={busy}
              activeOpacity={0.8}
            >
              {busy ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={[styles.confirmText, { color: colors.surface }]}>
                  {t("usePhoto", language)}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.sideButton, { backgroundColor: colors.screenBg }]}
              onPress={() => pick("gallery")}
              activeOpacity={0.7}
            >
              <ImageIcon size={24} color={colors.ink} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shutter, { backgroundColor: colors.brand }]}
              onPress={() => pick("camera")}
              activeOpacity={0.8}
            >
              <Camera size={28} color={colors.surface} />
            </TouchableOpacity>

            <View style={[styles.sideButton, { backgroundColor: colors.screenBg }]} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  bracket: { position: "absolute", width: 24, height: 24 },
  bracketTL: {
    borderTopWidth: 2, borderLeftWidth: 2,
    borderColor: "rgba(255,255,255,0.8)", borderTopLeftRadius: 6,
  },
  bracketTR: {
    borderTopWidth: 2, borderRightWidth: 2,
    borderColor: "rgba(255,255,255,0.8)", borderTopRightRadius: 6,
  },
  bracketBL: {
    borderBottomWidth: 2, borderLeftWidth: 2,
    borderColor: "rgba(255,255,255,0.8)", borderBottomLeftRadius: 6,
  },
  bracketBR: {
    borderBottomWidth: 2, borderRightWidth: 2,
    borderColor: "rgba(255,255,255,0.8)", borderBottomRightRadius: 6,
  },
  dashedLine: {
    position: "absolute", left: 40, right: 40, top: "50%",
    borderTopWidth: 1, borderStyle: "dashed",
    borderColor: "rgba(255,255,255,0.3)",
  },
  hintOverlay: {
    position: "absolute", bottom: 24, textAlign: "center",
    fontSize: 13, color: "rgba(255,255,255,0.6)",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 20,
    marginBottom: 8,
  },
  sideButton: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: defaultColors.screenBg,
    alignItems: "center", justifyContent: "center",
  },
  shutter: {
    height: 50, borderRadius: 25,
    paddingHorizontal: 24,
    backgroundColor: defaultColors.brand,
    alignItems: "center", justifyContent: "center",
    shadowColor: defaultColors.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  retakeButton: {
    height: 50, borderRadius: 25,
    paddingHorizontal: 24,
    backgroundColor: defaultColors.screenBg,
    borderWidth: 1, borderColor: defaultColors.cardBorder,
    alignItems: "center", justifyContent: "center",
  },
  retakeText: {
    fontSize: 15, fontWeight: "600", color: defaultColors.ink,
  },
  confirmText: {
    fontSize: 15, fontWeight: "600", color: defaultColors.surface,
  },
});
