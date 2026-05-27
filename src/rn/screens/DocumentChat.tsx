import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
  Platform,
  StyleSheet,
} from "react-native";
import { ArrowUp, Sparkles } from "../iconMap";
import ScreenHeader from "../components/ScreenHeader";
import { colors } from "../theme";
import { initialChatThread } from "../../data/mockData";
import { chatCompletion, type ChatMessage } from "../services/lyceum";
import { loadChatThread, saveChatThread } from "../services/storage";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

interface Props {
  document: any;
  onBack: () => void;
}

export default function DocumentChat({ document: doc, onBack }: Props) {
  const defaultThread = initialChatThread.map((m: any, i: number) => ({
    ...m,
    id: String(i),
  }));
  const [thread, setThread] = useState<Message[]>(defaultThread);
  const [draft, setDraft] = useState("");
  const listRef = useRef<FlatList>(null);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    loadChatThread(doc.id).then((saved) => {
      if (saved) setThread(saved);
    });
  }, [doc.id]);

  useEffect(() => {
    if (thread !== defaultThread) {
      saveChatThread(doc.id, thread);
    }
  }, [thread]);

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
      const history: ChatMessage[] = [
        {
          role: "system",
          content: `You are ArriveAI, a friendly document assistant for immigrants in Germany. The user is looking at a document called "${doc.name}". Help them understand it and answer questions about how to fill it out. Be concise and practical. Always respond in English, even if the document names are in German.`,
        },
        ...thread.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.text,
        })),
        { role: "user" as const, content: userText },
      ];

      const content = await chatCompletion(history);

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
    <View
      style={[
        styles.bubble,
        item.role === "user" ? styles.bubbleUser : styles.bubbleAssistant,
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          item.role === "user"
            ? styles.bubbleTextUser
            : styles.bubbleTextAssistant,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title={doc.name} onBack={onBack} />

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
            loading ? (
              <View style={[styles.bubble, styles.bubbleAssistant]}>
                <Text style={[styles.bubbleText, styles.bubbleTextAssistant]}>
                  Thinking...
                </Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <Sparkles size={20} color={colors.brand} />
              <View style={styles.summaryBody}>
                <Text style={styles.summaryTitle}>Document summary</Text>
                <Text style={styles.summaryDesc}>
                  Ask questions about this document or request help filling it
                  out.
                </Text>
              </View>
            </View>
          }
        />

        <View style={[styles.inputRow, { marginBottom: keyboardHeight || 12 }]}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Ask about this document..."
            placeholderTextColor={colors.inkMuted}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              draft.trim() && !loading
                ? styles.sendButtonActive
                : styles.sendButtonInactive,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    marginBottom: 16,
  },
  summaryBody: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
  },
  summaryDesc: {
    fontSize: 13,
    color: colors.inkMuted,
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
    backgroundColor: colors.brand,
    borderBottomRightRadius: 6,
  },
  bubbleAssistant: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: colors.surface,
  },
  bubbleTextAssistant: {
    color: colors.ink,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
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
    backgroundColor: colors.brand,
  },
  sendButtonInactive: {
    backgroundColor: colors.screenBg,
  },
});
