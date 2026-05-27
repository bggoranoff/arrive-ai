import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
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
import { colors } from "../theme";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 70;
const CARD_GAP = 12;

interface Props {
  app: any;
  onBack: () => void;
  onAddDocument: (appId: string) => void;
  onOpenDocument: (appId: string, docId: string) => void;
  onOpenDeadline: (appId: string, day: number) => void;
}

export default function ApplicationOverview({
  app,
  onBack,
  onAddDocument,
  onOpenDocument,
  onOpenDeadline,
}: Props) {
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
        <OverviewCard app={app} />
        <DeadlinesCard app={app} onOpenDeadline={onOpenDeadline} />
        <DocumentsCard
          app={app}
          onAddDocument={onAddDocument}
          onOpenDocument={onOpenDocument}
        />
      </ScrollView>

      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => scrollToCard(i)}
            style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.footerLabel}>Progress</Text>
          <Text style={styles.footerPct}>{app.progressPct}%</Text>
        </View>
        <ProgressBar value={app.progressPct} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

function CardWrapper({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function CardHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.cardHeader}>
      <IconTile name={icon} size="sm" tone="brand" />
      <Text style={styles.cardHeaderTitle}>{title}</Text>
    </View>
  );
}

function OverviewCard({ app }: { app: any }) {
  return (
    <CardWrapper>
      <CardHeader icon="FileText" title="Overview" />
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.description}>{app.overview.description}</Text>
        <Text style={styles.sectionTitle}>Next steps</Text>
        {app.overview.steps.map((step: any, i: number) => (
          <View key={i} style={styles.stepRow}>
            <View
              style={[
                styles.stepCheck,
                step.done ? styles.stepCheckDone : styles.stepCheckPending,
              ]}
            >
              {step.done && <Check size={12} color={colors.surface} />}
            </View>
            <Text
              style={[
                styles.stepText,
                step.done && styles.stepTextDone,
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
}: {
  app: any;
  onOpenDeadline: (appId: string, day: number) => void;
}) {
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
  const dayNames = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <CardWrapper>
      <CardHeader icon="CalendarDays" title="Deadlines" />
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.calMonthLabel}>{cal.monthName} {cal.year}</Text>
        <View style={styles.calGrid}>
          {dayNames.map((d) => (
            <View key={d} style={styles.calCell}>
              <Text style={styles.calDayName}>{d}</Text>
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
                    isDeadline && styles.calDayDeadline,
                    isNext && styles.calDayNext,
                  ]}
                >
                  <Text
                    style={[
                      styles.calDayText,
                      isDeadline && styles.calDayDeadlineText,
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
            <View style={styles.nextDeadlineDot} />
            <Text style={styles.nextDeadlineText}>
              Next: {app.nextDeadline.day} {app.nextDeadline.monthName} —{" "}
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
}: {
  app: any;
  onAddDocument: (appId: string) => void;
  onOpenDocument: (appId: string, docId: string) => void;
}) {
  return (
    <CardWrapper>
      <CardHeader icon="FileText" title="Documents" />
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
      >
        {app.documents.map((doc: any) => (
          <TouchableOpacity
            key={doc.id}
            style={styles.docRow}
            onPress={() => onOpenDocument(app.id, doc.id)}
            activeOpacity={0.7}
          >
            <IconTile name={doc.icon} size="sm" tone="brand" />
            <View style={styles.docBody}>
              <Text style={styles.docName} numberOfLines={1}>
                {doc.name}
              </Text>
              <Text style={styles.docStatus}>{doc.status}</Text>
            </View>
            <ChevronRight size={18} color={colors.inkMuted} />
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.addDocButton}
          onPress={() => onAddDocument(app.id)}
          activeOpacity={0.7}
        >
          <CirclePlus size={20} color={colors.brand} />
          <Text style={styles.addDocText}>Add document</Text>
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
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
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
    color: colors.ink,
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
    backgroundColor: colors.brand,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.cardBorder,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
  },
  footerPct: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.brand,
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.inkMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.ink,
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
    backgroundColor: colors.brand,
  },
  stepCheckPending: {
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  stepTextDone: {
    color: colors.inkMuted,
    textDecorationLine: "line-through",
  },
  calMonthLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.ink,
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
    color: colors.inkMuted,
  },
  calDay: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  calDayDeadline: {
    backgroundColor: colors.deadlineBg,
  },
  calDayNext: {
    borderWidth: 2,
    borderColor: colors.deadlineDot,
  },
  calDayText: {
    fontSize: 14,
    color: colors.ink,
  },
  calDayDeadlineText: {
    color: colors.deadlineText,
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
    backgroundColor: colors.deadlineDot,
  },
  nextDeadlineText: {
    fontSize: 13,
    color: colors.deadlineText,
    flex: 1,
  },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  docBody: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
  },
  docStatus: {
    fontSize: 12,
    color: colors.inkMuted,
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
    color: colors.brand,
  },
});
