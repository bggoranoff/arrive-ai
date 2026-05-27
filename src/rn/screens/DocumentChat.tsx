import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
  Modal,
  Image,
  Animated,
  Alert,
  StyleSheet,
} from "react-native";
import { ArrowUp, Sparkles, FileText, X, RotateCw } from "../iconMap";
import ScreenHeader from "../components/ScreenHeader";
import FadeIn from "../components/FadeIn";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";
import { chatCompletion, type ChatMessage } from "../services/lyceum";
import { loadChatThread, saveChatThread } from "../services/storage";
import { t } from "../services/i18n";
import {
  getDocumentImageBase64,
  getDocumentImageSource,
} from "../services/documentImages";
import * as FileSystem from "expo-file-system/legacy";

function ThinkingBubble({ colors, language }: { colors: any; language: string }) {
  const pulse = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, []);
  return (
    <FadeIn duration={200}>
      <Animated.View
        style={[
          styles.bubble,
          styles.bubbleAssistant,
          { backgroundColor: colors.surface, borderColor: colors.cardBorder, opacity: pulse },
        ]}
      >
        <Text style={[styles.bubbleText, styles.bubbleTextAssistant, { color: colors.ink }]}>
          {t("thinking", language)}
        </Text>
      </Animated.View>
    </FadeIn>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface Props {
  document: any;
  onBack: () => void;
  language?: string;
}

export default function DocumentChat({ document: doc, onBack, language = "English" }: Props) {
  const colors = useThemeColors();
  const hasImage = !!(doc.imageKey || doc.imageUri);
  const [thread, setThread] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);
  const [loading, setLoading] = useState(hasImage);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const imageSource = doc.imageKey
    ? getDocumentImageSource(doc.imageKey)
    : doc.imageUri
      ? { uri: doc.imageUri }
      : undefined;
  const imageBase64 = useRef<string | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      console.log("[chat] init: imageKey =", doc.imageKey, "imageUri =", doc.imageUri);
      try {
        if (doc.imageKey) {
          const b64 = await getDocumentImageBase64(doc.imageKey);
          imageBase64.current = b64;
          console.log("[chat] init: image from key =", b64 ? `${b64.length} chars` : "null");
        } else if (doc.imageUri) {
          const b64 = await FileSystem.readAsStringAsync(doc.imageUri, {
            encoding: "base64",
          });
          imageBase64.current = b64;
          console.log("[chat] init: image from uri =", b64 ? `${b64.length} chars` : "null");
        } else {
          console.log("[chat] init: no image source");
        }
      } catch (e: any) {
        console.error("[chat] init: image load error:", e.message);
      }

      const saved = await loadChatThread(doc.id);
      if (cancelled) return;

      if (saved && saved.length > 0) {
        setThread(saved);
        initialized.current = true;
        setLoading(false);
        return;
      }

      if (!imageBase64.current) {
        const fallback = doc.summary
          ? `${doc.summary}\n\n${t("askAboutFields", language)}`
          : t("askMeAnything", language);
        setThread([{ id: "init", role: "assistant", text: fallback }]);
        initialized.current = true;
        setLoading(false);
        return;
      }

      try {
        const greeting = await chatCompletion(
          [
            {
              role: "system",
              content: `You are ArriveAI, a friendly document assistant for immigrants in Germany. The user just scanned a document. Briefly describe what this document is, what it's used for, and mention a couple of key fields you can see. Keep it to 2-3 sentences. Respond in ${language}.`,
            },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${imageBase64.current}` },
                },
                { type: "text", text: "I just scanned this document." },
              ],
            },
          ],
          { maxTokens: 300, temperature: 0.3 },
        );
        if (!cancelled) {
          setThread([{ id: "init", role: "assistant", text: greeting }]);
        }
      } catch {
        if (!cancelled) {
          const fallback = doc.summary
            ? `${doc.summary}\n\n${t("askAboutFields", language)}`
            : t("askMeAnything", language);
          setThread([{ id: "init", role: "assistant", text: fallback }]);
        }
      } finally {
        if (!cancelled) {
          initialized.current = true;
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [doc.id]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (initialized.current) {
      saveChatThread(doc.id, thread);
    }
  }, [thread]);

  const loadImage = async (): Promise<string | null> => {
    try {
      if (doc.imageKey) {
        return await getDocumentImageBase64(doc.imageKey);
      } else if (doc.imageUri) {
        return await FileSystem.readAsStringAsync(doc.imageUri, {
          encoding: "base64",
        });
      }
    } catch (e: any) {
      console.error("[chat] image load failed:", e.message);
    }
    return null;
  };

  const send = async () => {
    if (!draft.trim() || loading) return;
    const userText = draft.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: userText,
    };
    setThread((prev) => [...prev, userMsg]);
    setDraft("");
    setLoading(true);

    try {
      if (!imageBase64.current) {
        imageBase64.current = await loadImage();
      }
      console.log("[chat] send: image loaded =", imageBase64.current ? `${imageBase64.current.length} chars` : "NO");

      const history: ChatMessage[] = [
        {
          role: "system",
          content: `You are ArriveAI, a friendly document assistant for immigrants in Germany. The user is looking at a document called "${doc.name}". Help them understand it and answer questions about how to fill it out. Be concise and practical. Always respond in ${language}.`,
        },
      ];

      if (imageBase64.current) {
        history.push({
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64.current}`,
              },
            },
            {
              type: "text",
              text: "I scanned this document. Please help me understand it.",
            },
          ],
        });
      }

      for (const m of thread) {
        history.push({
          role: m.role as "user" | "assistant",
          content: m.text,
        });
      }
      history.push({ role: "user", content: userText });

      const content = await chatCompletion(history, {
        maxTokens: imageBase64.current ? 1500 : 1000,
      });

      setThread((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: content,
        },
      ]);
    } catch (err: any) {
      setThread((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: `Error: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <FadeIn duration={250}>
      <View
        style={[
          styles.bubble,
          item.role === "user"
            ? [styles.bubbleUser, { backgroundColor: colors.brand }]
            : [styles.bubbleAssistant, { backgroundColor: colors.surface, borderColor: colors.cardBorder }],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            item.role === "user"
              ? [styles.bubbleTextUser, { color: colors.surface }]
              : [styles.bubbleTextAssistant, { color: colors.ink }],
          ]}
        >
          {item.text}
        </Text>
      </View>
    </FadeIn>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={doc.name}
        onBack={onBack}
        right={
          imageSource ? (
            <TouchableOpacity
              style={[styles.viewDocButton, { backgroundColor: colors.brandSoft }]}
              onPress={() => setImageViewerOpen(true)}
              activeOpacity={0.7}
            >
              <FileText size={20} color={colors.brand} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={styles.body}>
        <FlatList
          ref={listRef}
          data={thread}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          ListFooterComponent={
            loading ? <ThinkingBubble colors={colors} language={language} /> : null
          }
          ListHeaderComponent={
            <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <Sparkles size={20} color={colors.brand} />
              <View style={styles.summaryBody}>
                <Text style={[styles.summaryTitle, { color: colors.ink }]}>{doc.name}</Text>
                <Text style={[styles.summaryDesc, { color: colors.inkMuted }]}>
                  {doc.summary || "Ask questions about this document or request help filling it out."}
                </Text>
              </View>
            </View>
          }
        />

        <View style={[styles.inputRow, { marginBottom: keyboardHeight || 12, backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <TextInput
            style={[styles.input, { color: colors.ink }]}
            value={draft}
            onChangeText={setDraft}
            placeholder={t("askAboutDocument", language)}
            placeholderTextColor={colors.inkMuted}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              draft.trim() && !loading
                ? [styles.sendButtonActive, { backgroundColor: colors.brand }]
                : [styles.sendButtonInactive, { backgroundColor: colors.screenBg }],
            ]}
            onPress={send}
            disabled={loading}
            activeOpacity={0.7}
          >
            <ArrowUp
              size={18}
              color={draft.trim() ? colors.surface : colors.inkMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {imageSource && (
        <Modal
          visible={imageViewerOpen}
          animationType="fade"
          transparent
          onRequestClose={() => setImageViewerOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setImageViewerOpen(false)}
              activeOpacity={0.7}
            >
              <X size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={imageSource}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  messages: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  summaryCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 12,
    backgroundColor: defaultColors.surface,
    borderWidth: 1,
    borderColor: defaultColors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  summaryBody: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: defaultColors.ink,
  },
  summaryDesc: {
    fontSize: 13,
    color: defaultColors.inkMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  bubbleUser: {
    alignSelf: "flex-end",
    backgroundColor: defaultColors.brand,
    borderBottomRightRadius: 6,
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    backgroundColor: defaultColors.surface,
    borderWidth: 1,
    borderColor: defaultColors.cardBorder,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: defaultColors.surface,
  },
  bubbleTextAssistant: {
    color: defaultColors.ink,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 24,
    backgroundColor: defaultColors.surface,
    borderWidth: 1,
    borderColor: defaultColors.cardBorder,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: defaultColors.ink,
    paddingVertical: 6,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: defaultColors.brand,
  },
  sendButtonInactive: {
    backgroundColor: defaultColors.screenBg,
  },
  viewDocButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: defaultColors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalImage: {
    width: "90%",
    height: "80%",
  },
});
