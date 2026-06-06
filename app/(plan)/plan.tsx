// Plan home — reads everything from the persistent store, no nav params needed
import { useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { AssessmentResult } from "@/lib/engine";
import { analytics } from "@/lib/analytics";
import { scheduleDailyActionReminder } from "@/lib/notifications";
import { useAssessmentStore } from "@/hooks/useAssessmentStore";
import { COLORS, FONTS, SPACING, DOMAIN_COLORS, BAND_COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";

export default function PlanHomeScreen() {
  const router = useRouter();
  const store = useAssessmentStore();

  const result = store.result as AssessmentResult | null;
  const completedDays = store.completedDays;

  useEffect(() => {
    if (store.loading) return; // wait for AsyncStorage to finish loading
    if (!result) {
      // Store loaded and empty — no completed quiz, send back to intro
      router.replace("/" as any);
      return;
    }
    if (completedDays.length === 0) {
      scheduleDailyActionReminder(1).catch(() => {});
    }
  }, [result, store.loading]);

  // Still loading from AsyncStorage — show nothing yet (prevents flash redirect)
  if (store.loading) return null;
  if (!result) return null;

  const handleDayPress = (day: number) => {
    analytics.dayOpened(day);
    router.push({ pathname: "/day" as any, params: { day: String(day) } });
  };

  const handleStartOver = async () => {
    await store.reset();
    router.replace("/" as any);
  };

  const bandColor = BAND_COLORS[result.band] ?? COLORS.accent;
  const doneCount = completedDays.length;

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={GRADIENTS.quiz} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>

          {/* Header */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greeting}>Hi {result.name}</Text>
                <Text style={styles.title}>Your 7-Day Plan</Text>
              </View>
              <TouchableOpacity onPress={handleStartOver} style={styles.restartBtn} activeOpacity={0.7}>
                <Text style={styles.restartText}>Restart</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>{doneCount} of 7 days complete</Text>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={GRADIENTS.progress}
                  style={[styles.progressFill, { width: `${(doneCount / 7) * 100}%` as any }]}
                />
              </View>
            </View>
          </View>

          {/* Day cards */}
          <View style={styles.dayList}>
            {result.plan.map((assignment) => {
              const isDone = completedDays.includes(assignment.day);
              const domainColor = DOMAIN_COLORS[assignment.domain] ?? COLORS.accent;
              return (
                <TouchableOpacity
                  key={assignment.day}
                  style={[styles.dayCard, isDone && styles.dayCardDone]}
                  onPress={() => handleDayPress(assignment.day)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.dayBadge, { backgroundColor: isDone ? COLORS.success : domainColor + "22" }]}>
                    <Text style={[styles.dayNumber, { color: isDone ? "#fff" : domainColor }]}>
                      {isDone ? "✓" : assignment.day}
                    </Text>
                  </View>
                  <View style={styles.dayContent}>
                    <Text style={styles.dayDomain}>
                      {assignment.domain === "ALL" ? "All Domains" : assignment.domain}
                    </Text>
                    <Text style={styles.dayTitle} numberOfLines={2}>{assignment.action.title}</Text>
                    <Text style={styles.dayTime}>{assignment.action.time}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Day 7 upsell */}
          {doneCount === 7 && (
            <View style={[styles.upgradeCard, { borderColor: bandColor }]}>
              <Text style={styles.upgradeTitle}>Ready for the full picture?</Text>
              <Text style={styles.upgradeBody}>
                The Q40 assessment gives you a complete 40-question deep-dive across all 6 domains — plus a personalised project plan.
              </Text>
              <TouchableOpacity
                style={styles.upgradeButtonWrap}
                onPress={() => analytics.upgradeClicked("day7_summary", "q40_unlock")}
                activeOpacity={0.9}
              >
                <LinearGradient colors={GRADIENTS.cta} style={styles.upgradeButton}>
                  <Text style={styles.upgradeButtonText}>Learn More →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.lg, paddingTop: SPACING.xl, paddingBottom: SPACING["2xl"], gap: SPACING.xl },
  headerCard: {
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  greeting: { color: COLORS.muted, fontSize: FONTS.sizes.sm },
  title: { color: COLORS.white, fontSize: FONTS.sizes.heading, fontWeight: FONTS.weights.bold },
  restartBtn: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  restartText: { color: COLORS.muted, fontSize: FONTS.sizes.xs },
  progressRow: { gap: SPACING.xs },
  progressText: { color: COLORS.muted, fontSize: FONTS.sizes.xs },
  progressBar: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  dayList: { gap: SPACING.sm },
  dayCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: COLORS.surface, borderRadius: 14, padding: SPACING.md,
    borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md, ...SHADOWS.card,
  },
  dayCardDone: { opacity: 0.7 },
  dayBadge: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  dayNumber: { fontSize: FONTS.sizes.lg, fontWeight: FONTS.weights.bold },
  dayContent: { flex: 1, gap: 2 },
  dayDomain: { fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 1 },
  dayTitle: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.medium, lineHeight: 20 },
  dayTime: { color: COLORS.muted, fontSize: FONTS.sizes.xs },
  chevron: { color: COLORS.muted, fontSize: 22, fontWeight: FONTS.weights.bold },
  upgradeCard: { borderRadius: 16, borderWidth: 1, padding: SPACING.lg, backgroundColor: COLORS.card, gap: SPACING.md, ...SHADOWS.card },
  upgradeTitle: { color: COLORS.white, fontSize: FONTS.sizes.subheading, fontWeight: FONTS.weights.bold },
  upgradeBody: { color: COLORS.offWhite, fontSize: FONTS.sizes.sm, lineHeight: 20 },
  upgradeButtonWrap: { borderRadius: RADIUS.pill, overflow: "hidden", ...SHADOWS.cta },
  upgradeButton: { paddingVertical: SPACING.sm, alignItems: "center" },
  upgradeButtonText: { color: COLORS.white, fontSize: FONTS.sizes.base, fontWeight: FONTS.weights.bold },
});
