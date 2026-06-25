// Day action screen â€” gamified redesign
import { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, ScrollView, Dimensions,
} from "react-native";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withSpring, withSequence, withDelay,
  Easing,
} from "react-native-reanimated";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { AssessmentResult } from "@/lib/engine";
import { getJesseWrapper } from "@/lib/engine";
import { analytics } from "@/lib/analytics";
import { scheduleDailyActionReminder } from "@/lib/notifications";
import { JesseAvatar } from "@/components/JesseAvatar";
import { useAssessmentStore } from "@/hooks/useAssessmentStore";
import { COLORS, FONTS, SPACING, DOMAIN_COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";

const { width: _W } = Dimensions.get("window"); // reserved for future layout use

const DAY_NOTES = (jesse: ReturnType<typeof getJesseWrapper>) => ({
  1: jesse.day1Note,
  2: jesse.day2Note,
  3: jesse.day3Note,
  4: jesse.day4Note,
  5: jesse.day5Note,
  6: jesse.day6Note,
  7: jesse.day7Closing,
});

// Split howTo into steps for display
function parseSteps(howTo: string): string[] {
  // Try numbered "(1)" style first
  const numbered = howTo.match(/\(\d+\)[^(]*/g);
  if (numbered && numbered.length >= 2) {
    return numbered.map((s) => s.replace(/^\(\d+\)\s*/, "").trim());
  }
  // Fall back to sentence split
  return howTo
    .split(/\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
}

// Animated entrance card
function AnimatedCard({
  children,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: object;
}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 420, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 18, stiffness: 120 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

// XP burst particles (purely cosmetic)
function XPBurst({ visible }: { visible: boolean }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8 }),
        withTiming(1, { duration: 200 })
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      );
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;
  return (
    <Animated.View style={[styles.xpBurst, animStyle]}>
      <Text style={styles.xpBurstText}>+50 XP</Text>
    </Animated.View>
  );
}

export default function DayScreen() {
  const router = useRouter();
  const store = useAssessmentStore();
  const params = useLocalSearchParams<{ day: string }>();

  // Read plan and progress from the persistent store â€” not nav params
  const result = store.result as AssessmentResult;
  const day = parseInt(params.day ?? "1", 10);
  const completedDays = store.completedDays;

  // Wait for AsyncStorage — don't crash before data is ready
  if (store.loading || !result) return null;

  const assignment = result.plan[day - 1];
  const jesse = getJesseWrapper(result);
  const notes = DAY_NOTES(jesse);
  const noteText = notes[day as keyof typeof notes] ?? "";
  const domainColor = DOMAIN_COLORS[assignment.domain] ?? COLORS.accent;
  const steps = parseSteps(assignment.action.howTo);

  const [done, setDone] = useState(completedDays.includes(day));
  const [showXP, setShowXP] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  // Track the post-completion navigation timer so we can cancel it if the
  // user leaves the screen first — prevents a stray router.replace firing
  // after unmount (the "propagating navigation" bug) and double-completes.
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (navTimer.current) clearTimeout(navTimer.current);
  }, []);

  const ctaScale = useSharedValue(1);
  const ctaStyle = useAnimatedStyle(() => ({ transform: [{ scale: ctaScale.value }] }));

  const toggleStep = (i: number) => {
    setCheckedSteps((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  };

  const completingRef = useRef(false);

  const handleMarkDone = async () => {
    // Guard against re-entry: `done` state is async, so a rapid double-tap
    // could slip through before it commits. The ref blocks synchronously.
    if (done || completingRef.current) return;
    completingRef.current = true;

    ctaScale.value = withSequence(
      withTiming(0.93, { duration: 80 }),
      withSpring(1.06, { damping: 6 }),
      withTiming(1, { duration: 180 })
    );

    setDone(true);
    setShowXP(true);
    analytics.dayCompleted(day);

    // Persist to AsyncStorage â€” survives restarts
    await store.markDayComplete(day);

    if (day === 7) {
      analytics.planCompleted(completedDays.length + 1);
    } else {
      scheduleDailyActionReminder(day + 1).catch(() => {});
    }

    navTimer.current = setTimeout(() => {
      navTimer.current = null;
      router.replace("/plan" as any);
    }, 1400);
  };

  const streakCount = completedDays.length + (done ? 1 : 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* XP burst overlay */}
      <XPBurst visible={showXP} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>â€¹ Back</Text>
        </TouchableOpacity>

        {/* 7-dot progress stepper */}
        <View style={styles.stepper}>
          {result.plan.map((_, i) => {
            const d = i + 1;
            const isComplete = completedDays.includes(d) || (d === day && done);
            const isCurrent = d === day && !done;
            return (
              <View
                key={d}
                style={[
                  styles.stepDot,
                  isComplete && styles.stepDotDone,
                  isCurrent && styles.stepDotActive,
                ]}
              />
            );
          })}
        </View>

        {/* Streak badge */}
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>ðŸ”¥</Text>
          <Text style={styles.streakCount}>{streakCount}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* â”€â”€ HERO â”€â”€ */}
        <AnimatedCard delay={0}>
          <LinearGradient
            colors={[domainColor + "33", domainColor + "11"]}
            style={styles.hero}
          >
            <View style={styles.heroMeta}>
              <View style={[styles.dayPill, { backgroundColor: domainColor }]}>
                <Text style={styles.dayPillText}>DAY {day}</Text>
              </View>
              <View style={[styles.domainPill, { borderColor: domainColor + "66" }]}>
                <Text style={[styles.domainPillText, { color: domainColor }]}>
                  {assignment.domain === "ALL" ? "All Domains" : assignment.domain}
                </Text>
              </View>
            </View>

            <Text style={styles.actionTitle}>{assignment.action.title}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statIcon}>â±</Text>
                <Text style={styles.statText}>{assignment.action.time}</Text>
              </View>
              <View style={[styles.statChip, styles.xpChip]}>
                <Text style={styles.statIcon}>âš¡</Text>
                <Text style={[styles.statText, { color: COLORS.amber }]}>+50 XP</Text>
              </View>
              {done && (
                <View style={[styles.statChip, styles.doneChip]}>
                  <Text style={styles.statText}>âœ“ Done</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </AnimatedCard>

        {/* â”€â”€ WHY IT MATTERS â”€â”€ */}
        <AnimatedCard delay={100}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>ðŸ’¡</Text>
              <Text style={styles.cardLabel}>Why this matters</Text>
            </View>
            <Text style={styles.socialProof}>{assignment.action.socialProof}</Text>
          </View>
        </AnimatedCard>

        {/* â”€â”€ HOW TO DO IT (numbered steps) â”€â”€ */}
        <AnimatedCard delay={200}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>ðŸ“‹</Text>
              <Text style={styles.cardLabel}>How to do it</Text>
            </View>
            <View style={styles.stepsContainer}>
              {steps.map((step, i) => {
                const checked = checkedSteps.includes(i);
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.stepRow, checked && styles.stepRowDone]}
                    onPress={() => toggleStep(i)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.stepCheck, checked && styles.stepCheckDone]}>
                      {checked && <Text style={styles.stepCheckMark}>âœ“</Text>}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepNumber}>Step {i + 1}</Text>
                      <Text style={[styles.stepText, checked && styles.stepTextDone]}>
                        {step}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </AnimatedCard>

        {/* â”€â”€ JESSE SAYS â”€â”€ */}
        {noteText !== "" && (
          <AnimatedCard delay={300}>
            <LinearGradient
              colors={["rgba(249,115,22,0.12)", "rgba(249,115,22,0.04)"]}
              style={styles.jesseCard}
            >
              <View style={styles.jesseHeader}>
                <JesseAvatar size={44} />
                <View style={styles.jesseHeaderText}>
                  <Text style={styles.jesseName}>Jesse</Text>
                  <Text style={styles.jesseRole}>Legacy Coach</Text>
                </View>
                <View style={styles.jesseQuoteMark}>
                  <Text style={styles.jesseQuoteMarkText}>"</Text>
                </View>
              </View>
              <Text style={styles.jesseNote}>{noteText}</Text>
            </LinearGradient>
          </AnimatedCard>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>

      {/* â”€â”€ STICKY CTA â”€â”€ */}
      <View style={styles.footer}>
        <Animated.View style={[styles.ctaWrap, ctaStyle]}>
          <TouchableOpacity
            onPress={handleMarkDone}
            disabled={done}
            activeOpacity={0.9}
            style={styles.ctaTouchable}
          >
            {done ? (
              <View style={styles.ctaDone}>
                <Text style={styles.ctaText}>âœ“ Day {day} Complete!</Text>
                <Text style={styles.ctaSubText}>Heading to your planâ€¦</Text>
              </View>
            ) : (
              <LinearGradient colors={GRADIENTS.cta} style={styles.ctaGradient}>
                <Text style={styles.ctaText}>
                  {day === 7 ? "ðŸŽ‰ Complete the Plan!" : `Complete Day ${day} â†’`}
                </Text>
                <Text style={styles.ctaSubText}>Earn +50 XP and unlock Day {day + 1}</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  backBtn: { paddingHorizontal: SPACING.xs, paddingVertical: SPACING.sm },
  backText: { color: COLORS.accent, fontSize: FONTS.sizes.body, fontWeight: FONTS.weights.semibold },
  stepper: { flexDirection: "row", gap: 5, alignItems: "center" },
  stepDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    width: 22, height: 8, borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  stepDotDone: { backgroundColor: COLORS.success },
  streakBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: "rgba(249,115,22,0.15)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.3)",
  },
  streakEmoji: { fontSize: 12 },
  streakCount: { color: COLORS.accent, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },

  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.md, gap: SPACING.md },
  bottomPad: { height: SPACING.xl },

  // Hero
  hero: {
    borderRadius: RADIUS.surface,
    padding: SPACING.lg,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroMeta: { flexDirection: "row", gap: SPACING.sm, alignItems: "center" },
  dayPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
  },
  dayPillText: {
    color: COLORS.white,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.extrabold,
    letterSpacing: 1.5,
  },
  domainPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  domainPillText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  actionTitle: {
    color: COLORS.white,
    fontSize: FONTS.sizes.subheading,
    fontWeight: FONTS.weights.bold,
    lineHeight: 28,
  },
  statsRow: { flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" },
  statChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  xpChip: { borderColor: "rgba(251,191,36,0.3)", backgroundColor: "rgba(251,191,36,0.08)" },
  doneChip: { borderColor: "rgba(34,197,94,0.4)", backgroundColor: "rgba(34,197,94,0.1)" },
  statIcon: { fontSize: 12 },
  statText: { color: COLORS.muted, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.medium },

  // Cards
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  cardIcon: { fontSize: 16 },
  cardLabel: {
    color: COLORS.white,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  socialProof: {
    color: COLORS.offWhite,
    fontSize: FONTS.sizes.body,
    lineHeight: 24,
  },

  // Steps
  stepsContainer: { gap: SPACING.sm },
  stepRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    alignItems: "flex-start",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepRowDone: {
    borderColor: "rgba(34,197,94,0.3)",
    backgroundColor: "rgba(34,197,94,0.06)",
  },
  stepCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
    marginTop: 2, flexShrink: 0,
  },
  stepCheckDone: { borderColor: COLORS.success, backgroundColor: COLORS.success },
  stepCheckMark: { color: COLORS.white, fontSize: 12, fontWeight: FONTS.weights.bold },
  stepContent: { flex: 1, gap: 2 },
  stepNumber: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  stepText: {
    color: COLORS.offWhite,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
  },
  stepTextDone: { color: COLORS.subtle, textDecorationLine: "line-through" },

  // Jesse
  jesseCard: {
    borderRadius: RADIUS.surface,
    padding: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: "rgba(249,115,22,0.2)",
  },
  jesseHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  jesseHeaderText: { flex: 1 },
  jesseName: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.bold },
  jesseRole: { color: COLORS.muted, fontSize: FONTS.sizes.xs },
  jesseQuoteMark: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: "rgba(249,115,22,0.15)",
    alignItems: "center", justifyContent: "center",
  },
  jesseQuoteMarkText: { color: COLORS.accent, fontSize: 22, fontWeight: FONTS.weights.extrabold, lineHeight: 28 },
  jesseNote: {
    color: COLORS.offWhite,
    fontSize: FONTS.sizes.body,
    lineHeight: 26,
    fontStyle: "italic",
  },

  // Footer CTA
  footer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaWrap: { borderRadius: RADIUS.pill, overflow: "hidden", ...SHADOWS.cta },
  ctaTouchable: { borderRadius: RADIUS.pill, overflow: "hidden" },
  ctaGradient: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 2,
  },
  ctaDone: {
    paddingVertical: 16,
    alignItems: "center",
    gap: 2,
    backgroundColor: COLORS.success,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: FONTS.weights.bold,
  },
  ctaSubText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: FONTS.sizes.xs,
  },

  // XP burst
  xpBurst: {
    position: "absolute",
    top: "40%",
    alignSelf: "center",
    zIndex: 100,
    backgroundColor: COLORS.amber,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    ...SHADOWS.cta,
  },
  xpBurstText: {
    color: COLORS.background,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extrabold,
    letterSpacing: 1,
  },
});

