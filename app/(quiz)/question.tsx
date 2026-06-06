// One-question-at-a-time quiz screen
import { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { QUESTIONS, type Answer } from "@/lib/engine";
import { COLORS, FONTS, SPACING, DOMAIN_COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";
import { analytics } from "@/lib/analytics";

export default function QuestionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    questionIndex: string;
    answers: string;
  }>();

  const qIndex = parseInt(params.questionIndex ?? "0", 10);
  const previousAnswers: Answer[] = params.answers ? JSON.parse(params.answers) : [];

  const question = QUESTIONS[qIndex];
  const [selected, setSelected] = useState<string | null>(null);

  // Reset selection whenever the question changes (component is reused by expo-router)
  useEffect(() => {
    setSelected(null);
  }, [qIndex]);
  const isLast = qIndex === QUESTIONS.length - 1;
  const progress = (qIndex + 1) / QUESTIONS.length;
  const domainColor = DOMAIN_COLORS[question.domain] ?? COLORS.accent;

  const handleSelect = (value: string) => setSelected(value);

  const handleNext = () => {
    if (!selected) return;
    analytics.questionAnswered(qIndex + 1, selected);

    const updatedAnswers: Answer[] = [
      ...previousAnswers,
      { questionId: question.id, value: selected },
    ];

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
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={GRADIENTS.quiz} style={styles.container}>

        {/* Top bar: back button + counter */}
        <View style={styles.topBar}>
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

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextWrap, !selected && styles.nextDisabled]}
            onPress={handleNext}
            disabled={!selected}
            activeOpacity={0.9}
          >
            <LinearGradient colors={GRADIENTS.cta} style={styles.nextButton}>
              <Text style={styles.nextText}>{isLast ? "See My Results" : "Next →"}</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl,
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
