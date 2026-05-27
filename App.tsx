import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { initialApplications } from "./src/data/mockData";
import { colors } from "./src/rn/theme";

import ApplicationList from "./src/rn/screens/ApplicationList";
import ApplicationOverview from "./src/rn/screens/ApplicationOverview";
import ScanDocument from "./src/rn/screens/ScanDocument";
import DocumentChat from "./src/rn/screens/DocumentChat";

import AddApplicationSheet from "./src/rn/popups/AddApplicationSheet";
import CameraGallerySheet from "./src/rn/popups/CameraGallerySheet";
import DeadlineSheet from "./src/rn/popups/DeadlineSheet";

const SCREEN_WIDTH = Dimensions.get("window").width;

type ScreenName = "list" | "overview" | "scan" | "document";

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
  const [applications, setApplications] = useState(
    () => JSON.parse(JSON.stringify(initialApplications))
  );
  const [stack, setStack] = useState<StackEntry[]>([
    { screen: "list", params: {}, anim: new Animated.Value(0) },
  ]);
  const [popup, setPopup] = useState<Popup | null>(null);
  const animating = useRef(false);

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
    setApplications((prev: any[]) => {
      if (prev.find((a) => a.id === catalogId)) return prev;
      return [
        ...prev,
        {
          id: catalogId,
          icon: "FileText",
          title: catalogId,
          progressPct: 0,
          isNew: true,
          docsRequired: 3,
          overview: {
            description: "New application.",
            steps: [{ text: "Scan first document", done: false }],
          },
          documents: [],
          deadlines: [],
          nextDeadline: null,
          calendarMonth: { month: 5, year: 2026, monthName: "June" },
        },
      ];
    });
    closePopup();
  }, [closePopup]);

  const handleCapture = useCallback(() => {
    const topEntry = stack[stack.length - 1];
    const appId = topEntry.params.appId;
    const newDoc = {
      id: `doc-${Date.now()}`,
      icon: "FileText",
      name: "Scanned document",
      status: "Processing",
    };
    setApplications((prev: any[]) =>
      prev.map((a) =>
        a.id === appId ? { ...a, documents: [...a.documents, newDoc] } : a
      )
    );
    pop();
    setTimeout(() => {
      push("document", { appId, docId: newDoc.id });
    }, 300);
  }, [stack, pop, push]);

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
          />
        );
        break;
      case "overview":
        content = app ? (
          <ApplicationOverview
            app={app}
            onBack={pop}
            onAddDocument={(appId) => push("scan", { appId })}
            onOpenDocument={(appId, docId) =>
              push("document", { appId, docId })
            }
            onOpenDeadline={(appId, day) => {
              const dl = app.deadlines.find((d: any) => d.day === day);
              if (dl) openPopup("deadline", { deadline: dl, app });
            }}
          />
        ) : null;
        break;
      case "scan":
        content = (
          <ScanDocument
            onBack={pop}
            onCapture={handleCapture}
            onOpenGalleryPopup={() => openPopup("cameraGallery")}
          />
        );
        break;
      case "document":
        content = doc ? (
          <DocumentChat document={doc} onBack={pop} />
        ) : null;
        break;
    }

    return (
      <Animated.View
        key={`${entry.screen}-${index}`}
        style={[
          styles.screen,
          { transform: [{ translateX: entry.anim }] },
          index < stack.length - 1 && !animating.current && styles.screenHidden,
        ]}
      >
        {content}
      </Animated.View>
    );
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.screenContainer}>
          {stack.map(renderScreen)}
        </View>

        <AddApplicationSheet
          open={popup?.type === "addApp"}
          onClose={closePopup}
          onPick={handleAddApplication}
          existingIds={applications.map((a: any) => a.id)}
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
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.screenBg,
  },
  screenContainer: {
    flex: 1,
    position: "relative",
  },
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.screenBg,
  },
  screenHidden: {
    opacity: 0,
  },
});
