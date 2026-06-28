// One-question-at-a-time quiz screen
import { useState, useRef, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { QUESTIONS, type Answer } from "@/lib/engine";
import { COLORS, FONTS, SPACING, DOMAIN_COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";
import { analytics } from "@/lib/analytics";

// In-memory answer store for the current quiz session. Survives back/forward
// navigation (which only carries forward params), so returning to a question
// can show the answer the user already picked. Reset when the quiz restarts
// (questionIndex 0 with no prior answers). No DB needed — it lives for the
// lifetime of the quiz flow.
const answerStore = new Map<string, string>();

export default function QuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    questionIndex: string;
    answers: string;
  }>();

  const qIndex = parseInt(params.questionIndex ?? "0", 10);
  const previousAnswers: Answer[] = params.answers ? JSON.parse(params.answers) : [];

  // Seed the store from incoming params and, on a fresh start, clear stale
  // answers from a previous run-through.
  if (qIndex === 0 && previousAnswers.length === 0) answerStore.clear();
  previousAnswers.forEach((a) => answerStore.set(a.questionId, a.value));

  const question = QUESTIONS[qIndex];
  const [selected, setSelected] = useState<string | null>(null);

  const isLast = qIndex === QUESTIONS.length - 1;
  const progress = (qIndex + 1) / QUESTIONS.length;
  const domainColor = DOMAIN_COLORS[question.domain] ?? COLORS.accent;

  const insets = useSafeAreaInsets();

  // Track the auto-advance timer so we can cancel it if the user leaves the
  // screen (or the question changes) before it fires.
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advancingRef = useRef(false);

  // Re-arm the screen every time it gains focus — including when the user
  // presses Back to return to a previous question. Without this, advancingRef
  // stays `true` from when we navigated away, which blocks re-selecting an
  // answer after going back. We also restore the answer the user previously
  // gave for THIS question (if any) so it shows pre-selected on return.
  useFocusEffect(
    useCallback(() => {
      advancingRef.current = false;
      // Restore the previously chosen answer for this question (from the
      // session store) so it shows pre-selected when returning via Back.
      setSelected(answerStore.get(question.id) ?? null);
      return () => {
        if (advanceTimer.current) clearTimeout(advanceTimer.current);
      };
    }, [question.id])
  );

  // Navigate forward using the chosen value directly (not the async `selected`
  // state) so auto-advance fires immediately and reliably.
  const goNext = useCallback(
    (value: string) => {
      if (advancingRef.current) return;
      advancingRef.current = true;
      analytics.questionAnswered(qIndex + 1, value);

      // Record this answer in the session store, then build the forward list
      // from the store as an upsert (so changing a prior answer after going
      // back replaces it rather than duplicating).
      answerStore.set(question.id, value);
      const updatedAnswers: Answer[] = QUESTIONS.slice(0, qIndex + 1)
        .map((q) => {
          const v = answerStore.get(q.id);
          return v ? { questionId: q.id, value: v } : null;
        })
        .filter((a): a is Answer => a !== null);

      if (isLast) {
        router.push({
          pathname: "/email",
          params: { answers: JSON.stringify(updatedAnswers) },
        });
      } else {
        router.push({
          pathname: "/question",
          params: {
            questionIndex: String(qIndex + 1),
            answers: JSON.stringify(updatedAnswers),
          },
        });
      }
    },
    [qIndex, isLast, question.id, router]
  );

  // Tapping an answer: highlight it, then (for Q1–11) auto-advance after a brief
  // beat so the user sees their choice register. The last question waits for the
  // explicit "See My Results" button instead.
  const handleSelect = (value: string) => {
    if (advancingRef.current) return;
    setSelected(value);
    if (!isLast) {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
      advanceTimer.current = setTimeout(() => goNext(value), 250);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right"]}>
      <LinearGradient colors={GRADIENTS.quiz} style={styles.container}>

        {/* Top bar: back button + counter */}
        <View style={[styles.topBar, { paddingTop: insets.top + SPACING.md }]}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={styles.topCounter}>{qIndex + 1} / {QUESTIONS.length}</Text>
          <View style={styles.backBtn} />{/* spacer */}
        </View>

        {/* Progress bar */}
        <View style={styles.progressBar}>
          <LinearGradient colors={GRADIENTS.progress} style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.meta}>
            <View style={[styles.domainBadge, { backgroundColor: domainColor + "22", borderColor: domainColor }]}>
              <Text style={[styles.domainLabel, { color: domainColor }]}>{question.domain}</Text>
            </View>
          </View>

          <Text style={styles.questionText}>{question.text}</Text>

          <View style={styles.options}>
            {question.options.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[styles.option, selected === opt.value && styles.optionSelected]}
                onPress={() => handleSelect(opt.value)}
                activeOpacity={0.85}
              >
                <View style={[styles.radio, selected === opt.value && styles.radioSelected]}>
                  {selected === opt.value && <View style={styles.radioDot} />}
                </View>
                <Text style={[styles.optionText, selected === opt.value && styles.optionTextSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Q1–11 auto-advance on tap (no button). Only the final question shows
            a button, giving a deliberate beat before results. A hint replaces
            the button on earlier questions so the screen feels intentional. */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + SPACING.xl }]}>
          {isLast ? (
            <TouchableOpacity
              style={[styles.nextWrap, !selected && styles.nextDisabled]}
              onPress={() => selected && goNext(selected)}
              disabled={!selected}
              activeOpacity={0.9}
            >
              <LinearGradient colors={GRADIENTS.cta} style={styles.nextButton}>
                <Text style={styles.nextText}>See My Results</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <Text style={styles.tapHint}>Tap an answer to continue</Text>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    minWidth: 60,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  backText: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
  },
  topCounter: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
  },
  progressFill: {
    height: 4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING["2xl"],
    paddingBottom: SPACING["2xl"],
    gap: SPACING.sm,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: SPACING.xl,
  },
  domainBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
  },
  domainLabel: {
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  counter: {
    color: COLORS.muted,
    fontFamily: FONTS.families.body,
    fontSize: FONTS.sizes.sm,
  },
  questionText: {
    color: COLORS.white,
    fontFamily: FONTS.families.display,
    fontSize: FONTS.sizes.subheading,
    fontWeight: FONTS.weights.semibold,
    lineHeight: 32,
    marginBottom: SPACING.xl,
  },
  options: { gap: SPACING.sm },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  optionSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.surface2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.muted,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: { borderColor: COLORS.accent },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  optionText: {
    color: COLORS.offWhite,
    fontFamily: FONTS.families.bodyMedium,
    fontSize: FONTS.sizes.body,
    flex: 1,
  },
  optionTextSelected: {
    color: COLORS.white,
    fontWeight: FONTS.weights.semibold,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
    minHeight: 56,
    justifyContent: "center",
  },
  tapHint: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.sm,
    textAlign: "center",
    fontWeight: FONTS.weights.medium,
  },
  nextWrap: {
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    ...SHADOWS.cta,
  },
  nextButton: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  nextDisabled: { opacity: 0.4 },
  nextText: {
    color: COLORS.white,
    fontFamily: FONTS.families.display,
    fontSize: 17,
    fontWeight: FONTS.weights.bold,
  },
});
