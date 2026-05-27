import { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { ArrowUp, Sparkles } from "../iconMap";
import ScreenHeader from "../components/ScreenHeader";
import { colors } from "../theme";
import { initialChatThread, cannedReplies } from "../../data/mockData";

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
  const [thread, setThread] = useState<Message[]>(
    initialChatThread.map((m: any, i: number) => ({ ...m, id: String(i) }))
  );
  const [draft, setDraft] = useState("");
  const replyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const listRef = useRef<FlatList>(null);

  const send = () => {
    if (!draft.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: draft.trim(),
    };
    setThread((prev) => [...prev, userMsg]);
    setDraft("");

    clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        text: cannedReplies[Math.floor(Math.random() * cannedReplies.length)],
      };
      setThread((prev) => [...prev, reply]);
    }, 800);
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

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={thread}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
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

        <View style={styles.inputRow}>
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
              draft.trim()
                ? styles.sendButtonActive
                : styles.sendButtonInactive,
            ]}
            onPress={send}
            activeOpacity={0.7}
          >
            <ArrowUp
              size={18}
              color={draft.trim() ? colors.surface : colors.inkMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 12,
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
