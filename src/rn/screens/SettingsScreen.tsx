import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Globe, Check, Sun, Moon } from "../iconMap";
import ScreenHeader from "../components/ScreenHeader";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";
import type { ThemeMode } from "../theme";
import { t } from "../services/i18n";

const LANGUAGES = [
  "English",
  "Bulgarian",
  "German",
  "Turkish",
  "Arabic",
  "Ukrainian",
  "Russian",
  "Spanish",
  "French",
  "Polish",
  "Vietnamese",
];

interface Props {
  language: string;
  onChangeLanguage: (lang: string) => void;
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
  onBack: () => void;
}

export default function SettingsScreen({
  language,
  onChangeLanguage,
  themeMode,
  onChangeTheme,
  onBack,
}: Props) {
  const colors = useThemeColors();
  return (
    <View style={styles.container}>
      <ScreenHeader title={t("settings", language)} onBack={onBack} />
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Sun size={18} color={colors.inkMuted} />
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
              {t("theme", language)}
            </Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.inkMuted }]}>
            {t("themeDesc", language)}
          </Text>
          <View
            style={[
              styles.themeRow,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "light" && { backgroundColor: colors.brandSoft },
              ]}
              onPress={() => onChangeTheme("light")}
              activeOpacity={0.7}
            >
              <Sun size={20} color={themeMode === "light" ? colors.brand : colors.inkMuted} />
              <Text
                style={[
                  styles.themeLabel,
                  { color: themeMode === "light" ? colors.brand : colors.ink },
                  themeMode === "light" && { fontWeight: "600" },
                ]}
              >
                {t("light", language)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === "dark" && { backgroundColor: colors.brandSoft },
              ]}
              onPress={() => onChangeTheme("dark")}
              activeOpacity={0.7}
            >
              <Moon size={20} color={themeMode === "dark" ? colors.brand : colors.inkMuted} />
              <Text
                style={[
                  styles.themeLabel,
                  { color: themeMode === "dark" ? colors.brand : colors.ink },
                  themeMode === "dark" && { fontWeight: "600" },
                ]}
              >
                {t("dark", language)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 24 }]}>
          <View style={styles.sectionHeader}>
            <Globe size={18} color={colors.inkMuted} />
            <Text style={[styles.sectionTitle, { color: colors.ink }]}>
              {t("chatLanguage", language)}
            </Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.inkMuted }]}>
            {t("chatLanguageDesc", language)}
          </Text>
          <View
            style={[
              styles.optionList,
              { backgroundColor: colors.surface, borderColor: colors.cardBorder },
            ]}
          >
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.option,
                  { borderBottomColor: colors.cardBorder },
                  lang === language && { backgroundColor: colors.brandSoft },
                ]}
                onPress={() => onChangeLanguage(lang)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.ink },
                    lang === language && { fontWeight: "600", color: colors.brand },
                  ]}
                >
                  {lang}
                </Text>
                {lang === language && <Check size={18} color={colors.brand} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  body: { flex: 1 },
  bodyContent: { paddingHorizontal: 20, paddingBottom: 24 },
  section: { marginTop: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: "600" },
  sectionDesc: { fontSize: 13, marginTop: 4, marginBottom: 12 },
  themeRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  themeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  themeLabel: { fontSize: 15 },
  optionList: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: { fontSize: 15 },
});
