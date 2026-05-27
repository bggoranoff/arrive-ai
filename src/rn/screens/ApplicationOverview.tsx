import { useRef, useState } from "react";
import PressableScale from "../components/PressableScale";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import {
  Check,
  ChevronRight,
  CirclePlus,
  ChevronLeft as ChevLeft,
  ChevronRight as ChevRight,
} from "../iconMap";
import ScreenHeader from "../components/ScreenHeader";
import IconTile from "../components/IconTile";
import ProgressBar from "../components/ProgressBar";
import { useThemeColors } from "../ThemeContext";
import { colors as defaultColors } from "../theme";
import { t, dayNames } from "../services/i18n";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 70;
const CARD_GAP = 12;

interface Props {
  app: any;
  onBack: () => void;
  onAddDocument: (appId: string) => void;
  onOpenDocument: (appId: string, docId: string) => void;
  onOpenDeadline: (appId: string, day: number) => void;
  onDeleteDocument: (appId: string, docId: string) => void;
  onClearChat: (docId: string) => void;
  language: string;
}

export default function ApplicationOverview({
  app,
  onBack,
  onAddDocument,
  onOpenDocument,
  onOpenDeadline,
  onDeleteDocument,
  onClearChat,
  language,
}: Props) {
  const colors = useThemeColors();
  const [active, setActive] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (CARD_WIDTH + CARD_GAP));
    setActive(Math.max(0, Math.min(2, idx)));
  };

  const scrollToCard = (i: number) => {
    scrollRef.current?.scrollTo({
      x: i * (CARD_WIDTH + CARD_GAP),
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title={app.title} onBack={onBack} />

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carousel}
        style={styles.carouselScroll}
      >
        <OverviewCard app={app} language={language} />
        <DeadlinesCard app={app} onOpenDeadline={onOpenDeadline} language={language} />
        <DocumentsCard
          app={app}
          onAddDocument={onAddDocument}
          onOpenDocument={onOpenDocument}
          onDeleteDocument={onDeleteDocument}
          onClearChat={onClearChat}
          language={language}
        />
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => scrollToCard(i)}
            style={[styles.dot, i === active ? [styles.dotActive, { backgroundColor: colors.brand }] : [styles.dotInactive, { backgroundColor: colors.cardBorder }]]}
          />
        ))}
      </View>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.cardBorder }]}>
        <View style={styles.footerRow}>
          <Text style={[styles.footerLabel, { color: colors.ink }]}>{t("progress", language)}</Text>
          <Text style={[styles.footerPct, { color: colors.brand }]}>{app.progressPct}%</Text>
        </View>
        <ProgressBar value={app.progressPct} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>{children}</View>;
}

function CardHeader({ icon, title }: { icon: string; title: string }) {
  const colors = useThemeColors();
  return (
    <View style={styles.cardHeader}>
      <IconTile name={icon} size="sm" tone="brand" />
      <Text style={[styles.cardHeaderTitle, { color: colors.ink }]}>{title}</Text>
    </View>
  );
}

function OverviewCard({ app, language }: { app: any; language: string }) {
  const colors = useThemeColors();
  return (
    <CardWrapper>
      <CardHeader icon="FileText" title={t("overview", language)} />
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.description, { color: colors.inkMuted }]}>{app.overview.description}</Text>
        <Text style={[styles.sectionTitle, { color: colors.ink }]}>{t("nextSteps", language)}</Text>
        {app.overview.steps.map((step: any, i: number) => (
          <View key={i} style={styles.stepRow}>
            <View
              style={[
                styles.stepCheck,
                step.done ? [styles.stepCheckDone, { backgroundColor: colors.brand }] : [styles.stepCheckPending, { borderColor: colors.cardBorder }],
              ]}
            >
              {step.done && <Check size={12} color={colors.surface} />}
            </View>
            <Text
              style={[
                styles.stepText,
                { color: colors.ink },
                step.done && [styles.stepTextDone, { color: colors.inkMuted }],
              ]}
            >
              {step.text}
            </Text>
          </View>
        ))}
      </ScrollView>
    </CardWrapper>
  );
}

function DeadlinesCard({
  app,
  onOpenDeadline,
  language,
}: {
  app: any;
  onOpenDeadline: (appId: string, day: number) => void;
  language: string;
}) {
  const colors = useThemeColors();
  const cal = app.calendarMonth;
  const firstDay = new Date(cal.year, cal.month, 1);
  const daysInMonth = new Date(cal.year, cal.month + 1, 0).getDate();
  const leadEmpty = (firstDay.getDay() + 6) % 7;

  const deadlineDays = new Set(
    app.deadlines
      .filter(
        (d: any) => d.month === cal.month + 1 && d.year === cal.year
      )
      .map((d: any) => d.day)
  );

  const nextDay = app.nextDeadline?.day ?? null;
  const localDayNames = dayNames(language);

  return (
    <CardWrapper>
      <CardHeader icon="CalendarDays" title={t("deadlines", language)} />
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.calMonthLabel, { color: colors.ink }]}>{cal.monthName} {cal.year}</Text>
        <View style={styles.calGrid}>
          {localDayNames.map((d, i) => (
            <View key={i} style={styles.calCell}>
              <Text style={[styles.calDayName, { color: colors.inkMuted }]}>{d}</Text>
            </View>
          ))}
          {Array.from({ length: leadEmpty }).map((_, i) => (
            <View key={`e${i}`} style={styles.calCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isDeadline = deadlineDays.has(day);
            const isNext = day === nextDay;
            return (
              <TouchableOpacity
                key={day}
                style={styles.calCell}
                onPress={() => isDeadline && onOpenDeadline(app.id, day)}
                activeOpacity={isDeadline ? 0.7 : 1}
              >
                <View
                  style={[
                    styles.calDay,
                    isDeadline && [styles.calDayDeadline, { backgroundColor: colors.deadlineBg }],
                    isNext && [styles.calDayNext, { borderColor: colors.deadlineDot }],
                  ]}
                >
                  <Text
                    style={[
                      styles.calDayText,
                      { color: colors.ink },
                      isDeadline && [styles.calDayDeadlineText, { color: colors.deadlineText }],
                    ]}
                  >
                    {day}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {app.nextDeadline && (
          <View style={styles.nextDeadline}>
            <View style={[styles.nextDeadlineDot, { backgroundColor: colors.deadlineDot }]} />
            <Text style={[styles.nextDeadlineText, { color: colors.deadlineText }]}>
              {t("next", language)}: {app.nextDeadline.day} {app.nextDeadline.monthName} —{" "}
              {app.nextDeadline.label}
            </Text>
          </View>
        )}
      </ScrollView>
    </CardWrapper>
  );
}

function DocumentsCard({
  app,
  onAddDocument,
  onOpenDocument,
  onDeleteDocument,
  onClearChat,
  language,
}: {
  app: any;
  onAddDocument: (appId: string) => void;
  onOpenDocument: (appId: string, docId: string) => void;
  onDeleteDocument: (appId: string, docId: string) => void;
  onClearChat: (docId: string) => void;
  language: string;
}) {
  const colors = useThemeColors();
  const showActions = (doc: any) => {
    Alert.alert(
      t("documentActions", language),
      doc.name,
      [
        { text: t("cancel", language), style: "cancel" },
        {
          text: t("clearChat", language),
          onPress: () => {
            Alert.alert(
              t("clearChat", language),
              t("clearChatConfirm", language),
              [
                { text: t("cancel", language), style: "cancel" },
                {
                  text: t("clearChat", language),
                  style: "destructive",
                  onPress: () => onClearChat(doc.id),
                },
              ],
            );
          },
        },
        {
          text: t("delete", language),
          style: "destructive",
          onPress: () => {
            Alert.alert(
              t("deleteDocument", language),
              t("deleteDocumentConfirm", language),
              [
                { text: t("cancel", language), style: "cancel" },
                {
                  text: t("delete", language),
                  style: "destructive",
                  onPress: () => onDeleteDocument(app.id, doc.id),
                },
              ],
            );
          },
        },
      ],
    );
  };

  return (
    <CardWrapper>
      <CardHeader icon="FileText" title={t("documents", language)} />
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
      >
        {app.documents.map((doc: any) => (
          <PressableScale
            key={doc.id}
            style={[styles.docRow, { borderBottomColor: colors.cardBorder }]}
            onPress={() => onOpenDocument(app.id, doc.id)}
            onLongPress={() => showActions(doc)}
            delayLongPress={400}
          >
            <IconTile name={doc.icon} size="sm" tone="brand" />
            <View style={styles.docBody}>
              <Text style={[styles.docName, { color: colors.ink }]} numberOfLines={1}>
                {doc.name}
              </Text>
              <Text style={[styles.docStatus, { color: colors.inkMuted }]}>{doc.status}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkMuted} />
          </PressableScale>
        ))}
        <TouchableOpacity
          style={styles.addDocButton}
          onPress={() => onAddDocument(app.id)}
          activeOpacity={0.7}
        >
          <CirclePlus size={20} color={colors.brand} />
          <Text style={[styles.addDocText, { color: colors.brand }]}>{t("addDocument", language)}</Text>
        </TouchableOpacity>
      </ScrollView>
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  carouselScroll: {
    flex: 1,
  },
  carousel: {
    paddingHorizontal: 35,
    gap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: defaultColors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: defaultColors.cardBorder,
    overflow: "hidden",
    padding: 16,
  },
  cardScroll: {
    flex: 1,
    marginTop: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: defaultColors.ink,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: defaultColors.brand,
  },
  dotInactive: {
    width: 8,
    backgroundColor: defaultColors.cardBorder,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: defaultColors.surface,
    borderTopWidth: 1,
    borderTopColor: defaultColors.cardBorder,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: defaultColors.ink,
  },
  footerPct: {
    fontSize: 14,
    fontWeight: "600",
    color: defaultColors.brand,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: defaultColors.inkMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: defaultColors.ink,
    marginTop: 16,
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  stepCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCheckDone: {
    backgroundColor: defaultColors.brand,
  },
  stepCheckPending: {
    borderWidth: 1.5,
    borderColor: defaultColors.cardBorder,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: defaultColors.ink,
  },
  stepTextDone: {
    color: defaultColors.inkMuted,
    textDecorationLine: "line-through",
  },
  calMonthLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: defaultColors.ink,
    textAlign: "center",
    marginBottom: 12,
  },
  calGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    paddingVertical: 4,
  },
  calDayName: {
    fontSize: 12,
    fontWeight: "500",
    color: defaultColors.inkMuted,
  },
  calDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  calDayDeadline: {
    backgroundColor: defaultColors.deadlineBg,
  },
  calDayNext: {
    borderWidth: 2,
    borderColor: defaultColors.deadlineDot,
  },
  calDayText: {
    fontSize: 14,
    color: defaultColors.ink,
  },
  calDayDeadlineText: {
    color: defaultColors.deadlineText,
    fontWeight: "600",
  },
  nextDeadline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  nextDeadlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: defaultColors.deadlineDot,
  },
  nextDeadlineText: {
    fontSize: 13,
    color: defaultColors.deadlineText,
    flex: 1,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: defaultColors.cardBorder,
  },
  docBody: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "500",
    color: defaultColors.ink,
  },
  docStatus: {
    fontSize: 12,
    color: defaultColors.inkMuted,
    marginTop: 2,
  },
  addDocButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
  },
  addDocText: {
    fontSize: 14,
    fontWeight: "500",
    color: defaultColors.brand,
  },
});
