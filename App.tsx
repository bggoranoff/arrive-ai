import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View, Modal, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initialApplications, applicationTemplates } from "./src/data/mockData";
import {
  loadApplications,
  saveApplications,
  loadLanguage,
  saveLanguage,
  loadTheme,
  saveTheme,
  saveChatThread,
  migrateIfNeeded,
} from "./src/rn/services/storage";
import { getColors, type ThemeMode } from "./src/rn/theme";
import { t } from "./src/rn/services/i18n";
import { ThemeProvider } from "./src/rn/ThemeContext";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { chatCompletion } from "./src/rn/services/lyceum";
import ApplicationList from "./src/rn/screens/ApplicationList";
import ApplicationOverview from "./src/rn/screens/ApplicationOverview";
import DocumentChat from "./src/rn/screens/DocumentChat";
import SettingsScreen from "./src/rn/screens/SettingsScreen";

import AddApplicationSheet from "./src/rn/popups/AddApplicationSheet";
import CameraGallerySheet from "./src/rn/popups/CameraGallerySheet";
import DeadlineSheet from "./src/rn/popups/DeadlineSheet";

const SCREEN_WIDTH = Dimensions.get("window").width;

type ScreenName = "list" | "overview" | "scan" | "document" | "settings";

interface StackEntry {
  screen: ScreenName;
  params: Record<string, any>;
  anim: Animated.Value;
}

interface Popup {
  type: "addApp" | "deadline" | "cameraGallery";
  params?: Record<string, any>;
}

export default function App() {
  const [scanning, setScanning] = useState(false);
  const [applications, setApplications] = useState(
    () => JSON.parse(JSON.stringify(initialApplications))
  );
  const [language, setLanguage] = useState("English");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const colors = getColors(themeMode);
  const [ready, setReady] = useState(false);
  const [stack, setStack] = useState<StackEntry[]>([
    { screen: "list", params: {}, anim: new Animated.Value(0) },
  ]);
  const [popup, setPopup] = useState<Popup | null>(null);
  const animating = useRef(false);

  useEffect(() => {
    migrateIfNeeded().then(() =>
      Promise.all([loadApplications(), loadLanguage(), loadTheme()]).then(
        ([savedApps, savedLang, savedTheme]) => {
          if (savedApps) setApplications(savedApps);
          setLanguage(savedLang);
          setThemeMode(savedTheme);
          setReady(true);
        }
      )
    );
  }, []);

  useEffect(() => {
    if (ready) saveApplications(applications);
  }, [applications, ready]);

  const push = useCallback((screen: ScreenName, params: Record<string, any> = {}) => {
    if (animating.current) return;
    animating.current = true;
    const anim = new Animated.Value(SCREEN_WIDTH);
    setStack((prev) => [...prev, { screen, params, anim }]);
    Animated.timing(anim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      animating.current = false;
    });
  }, []);

  const pop = useCallback(() => {
    if (animating.current || stack.length <= 1) return;
    animating.current = true;
    const top = stack[stack.length - 1];
    Animated.timing(top.anim, {
      toValue: SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setStack((prev) => prev.slice(0, -1));
      animating.current = false;
    });
  }, [stack]);

  const openPopup = useCallback((type: Popup["type"], params?: Record<string, any>) => {
    setPopup({ type, params });
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, []);

  const handleAddApplication = useCallback((catalogId: string) => {
    const tmpl = (applicationTemplates as any)[catalogId];
    if (!tmpl) return;
    const now = new Date();
    setApplications((prev: any[]) => [
      ...prev,
      {
        id: `${catalogId}-${Date.now()}`,
        icon: tmpl.icon,
        title: tmpl.title,
        progressPct: 0,
        isNew: true,
        docsRequired: tmpl.requiredDocs.length,
        createdAt: now.toISOString(),
        overview: {
          description: tmpl.description,
          steps: tmpl.requiredDocs.map((text: string) => ({ text, done: false })),
        },
        documents: [],
        deadlines: [],
        nextDeadline: null,
        calendarMonth: { month: now.getMonth(), year: now.getFullYear(), monthName: now.toLocaleString(undefined, { month: "long" }) },
      },
    ]);
    closePopup();
  }, [closePopup]);

  const handleChangeLanguage = useCallback((lang: string) => {
    setLanguage(lang);
    saveLanguage(lang);
  }, []);

  const handleChangeTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode);
    saveTheme(mode);
  }, []);

  const handleClearChat = useCallback((docId: string) => {
    saveChatThread(docId, []);
  }, []);

  const handleDeleteApplication = useCallback((appId: string) => {
    setApplications((prev: any[]) => prev.filter((a) => a.id !== appId));
  }, []);

  const handleDeleteDocument = useCallback((appId: string, docId: string) => {
    setApplications((prev: any[]) =>
      prev.map((a) => {
        if (a.id !== appId) return a;
        const doc = a.documents.find((d: any) => d.id === docId);
        const stepIdx = doc?.matchedStepIndex ?? -1;
        const docs = a.documents.filter((d: any) => d.id !== docId);
        const updatedSteps = stepIdx >= 0 && a.overview?.steps?.[stepIdx]
          ? a.overview.steps.map((s: any, i: number) =>
              i === stepIdx ? { ...s, done: false } : s
            )
          : a.overview?.steps;
        const doneCount = updatedSteps?.filter((s: any) => s.done).length ?? 0;
        const totalSteps = updatedSteps?.length ?? 1;
        return {
          ...a,
          documents: docs,
          overview: { ...a.overview, steps: updatedSteps },
          progressPct: Math.round((doneCount / totalSteps) * 100),
        };
      })
    );
  }, []);

  const launchPicker = useCallback(async (appId: string, source: "camera" | "gallery") => {
    try {
      if (source === "camera") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert("Camera access needed", "Enable camera access for Expo Go in Settings.");
          return;
        }
      }

      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8 });

      if (result.canceled || !result.assets?.[0]) return;

      setScanning(true);
      const imageUri = result.assets[0].uri;
      const docId = `doc-${Date.now()}`;

      const app = applications.find((a: any) => a.id === appId);
      const steps = app?.overview?.steps?.map((s: any) => s.text) ?? [];

      let docName = "Scanned document";
      let summary = "";
      let matchedStep = -1;

      try {
        const b64 = await FileSystem.readAsStringAsync(imageUri, { encoding: "base64" });
        const stepsJson = JSON.stringify(steps);
        const raw = await chatCompletion(
          [
            {
              role: "system",
              content: `You are a document classifier for an immigration app. The user scanned a document for their "${app?.title}" application. The application has these checklist steps: ${stepsJson}. Identify the document and respond with ONLY a JSON object (no markdown): {"name": "document name in English", "summary": "1-2 sentence description", "matched_step_index": <index of matching step or -1>}`,
            },
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${b64}` } },
                { type: "text", text: "What document is this?" },
              ],
            },
          ],
          { maxTokens: 300, temperature: 0.1 },
        );
        const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const parsed = JSON.parse(cleaned);
        docName = parsed.name || docName;
        summary = parsed.summary || "";
        matchedStep = typeof parsed.matched_step_index === "number" ? parsed.matched_step_index : -1;
      } catch (e) {
        console.error("[scan] recognition failed:", e);
      }

      const newDoc = {
        id: docId,
        icon: "FileText",
        name: docName,
        status: "Scanned",
        summary,
        imageUri,
        matchedStepIndex: matchedStep,
      };

      setApplications((prev: any[]) =>
        prev.map((a) => {
          if (a.id !== appId) return a;
          const docs = [...a.documents, newDoc];
          const updatedSteps = matchedStep >= 0 && a.overview?.steps?.[matchedStep]
            ? a.overview.steps.map((s: any, i: number) =>
                i === matchedStep ? { ...s, done: true } : s
              )
            : a.overview?.steps;
          const doneCount = updatedSteps?.filter((s: any) => s.done).length ?? 0;
          const totalSteps = updatedSteps?.length ?? 1;
          return {
            ...a,
            documents: docs,
            overview: { ...a.overview, steps: updatedSteps },
            progressPct: Math.round((doneCount / totalSteps) * 100),
          };
        })
      );
      setScanning(false);
      push("document", { appId, docId });
    } catch (e: any) {
      setScanning(false);
      Alert.alert("Error", e.message);
    }
  }, [push, applications]);

  const handleAddDocument = useCallback((appId: string) => {
    Alert.alert(
      t("addDocument", language),
      undefined,
      [
        { text: t("cancel", language), style: "cancel" },
        {
          text: t("takePhoto", language),
          onPress: () => launchPicker(appId, "camera"),
        },
        {
          text: t("chooseFromGallery", language),
          onPress: () => launchPicker(appId, "gallery"),
        },
      ],
    );
  }, [language, launchPicker]);

  const renderScreen = (entry: StackEntry, index: number) => {
    const app = applications.find((a: any) => a.id === entry.params.appId);
    const doc = app?.documents?.find(
      (d: any) => d.id === entry.params.docId
    );

    let content: React.ReactNode;
    switch (entry.screen) {
      case "list":
        content = (
          <ApplicationList
            applications={applications}
            onOpenApplication={(id) => push("overview", { appId: id })}
            onAddApplication={() => openPopup("addApp")}
            onOpenSettings={() => push("settings")}
            onDeleteApplication={handleDeleteApplication}
            language={language}
          />
        );
        break;
      case "overview":
        content = app ? (
          <ApplicationOverview
            app={app}
            onBack={pop}
            onAddDocument={handleAddDocument}
            onOpenDocument={(appId, docId) =>
              push("document", { appId, docId })
            }
            onOpenDeadline={(appId, day) => {
              const dl = app.deadlines.find((d: any) => d.day === day);
              if (dl) openPopup("deadline", { deadline: dl, app });
            }}
            onDeleteDocument={handleDeleteDocument}
            onClearChat={handleClearChat}
            language={language}
          />
        ) : null;
        break;
      case "document":
        content = doc ? (
          <DocumentChat document={doc} onBack={pop} language={language} />
        ) : null;
        break;
      case "settings":
        content = (
          <SettingsScreen
            language={language}
            onChangeLanguage={handleChangeLanguage}
            themeMode={themeMode}
            onChangeTheme={handleChangeTheme}
            onBack={pop}
          />
        );
        break;
    }

    return (
      <Animated.View
        key={`${entry.screen}-${index}`}
        style={[
          styles.screen,
          { backgroundColor: colors.screenBg },
          { transform: [{ translateX: entry.anim }] },
          index < stack.length - 1 && !animating.current && styles.screenHidden,
        ]}
      >
        {content}
      </Animated.View>
    );
  };

  return (
    <ThemeProvider value={colors}>
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.screenBg }]}>
        <StatusBar style={themeMode === "dark" ? "light" : "dark"} />
        <View style={styles.screenContainer}>
          {stack.map(renderScreen)}
        </View>

        <AddApplicationSheet
          open={popup?.type === "addApp"}
          onClose={closePopup}
          onPick={handleAddApplication}
          language={language}
        />
        <CameraGallerySheet
          open={popup?.type === "cameraGallery"}
          onClose={closePopup}
          onChoose={(source) => {
            closePopup();
            if (source === "camera") {
              const topEntry = stack[stack.length - 1];
              if (topEntry.screen !== "scan") {
                push("scan", topEntry.params);
              }
            }
          }}
        />
        <DeadlineSheet
          open={popup?.type === "deadline"}
          onClose={closePopup}
          deadline={popup?.params?.deadline ?? null}
          app={popup?.params?.app ?? null}
          language={language}
        />
      </SafeAreaView>
      <Modal visible={scanning} transparent animationType="fade">
        <View style={styles.scanOverlay}>
          <View style={[styles.scanCard, { backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.brand} />
            <Text style={[styles.scanText, { color: colors.ink }]}>
              {t("analyzing", language)}
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
    position: "relative",
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
  },
  screenHidden: {
    opacity: 0,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanCard: {
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  scanText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
