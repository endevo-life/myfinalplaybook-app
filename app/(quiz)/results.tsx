import { useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { AssessmentResult } from "@/lib/engine";
import { getJesseWrapper } from "@/lib/engine";
import { analytics } from "@/lib/analytics";
import { downloadPDF } from "@/lib/pdf";
import { JesseAvatar } from "@/components/JesseAvatar";
import { COLORS, FONTS, SPACING, BAND_COLORS, BAND_TONES, DOMAIN_COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ result: string; email: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [pdfLoading, setPdfLoading] = useState(false);

  // Parse the result param defensively. A malformed or absent payload — e.g. a
  // raw deep link to /results, or a hot-reload that drops navigation params —
  // must not crash the screen on result.domainResults.map(...). We treat it as
  // "no result" and bounce home instead of throwing.
  const result = useMemo<AssessmentResult | null>(() => {
    try {
      const r = params.result ? JSON.parse(params.result) : null;
      return r && Array.isArray(r.domainResults) && Array.isArray(r.plan)
        ? (r as AssessmentResult)
        : null;
    } catch {
      return null;
    }
  }, [params.result]);

  useEffect(() => {
    if (!result) {
      router.replace("/" as any);
      return;
    }
    analytics.resultViewed(result.totalScore, result.band, result.weakestDomain);
  }, [result]);

  if (!result) return null;

  const jesse = getJesseWrapper(result);
  const bandColor = BAND_COLORS[result.band] ?? COLORS.accent;

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadPDF(result);
    } catch (e) {
      console.warn("PDF generation failed:", e);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "top"]}>
      <LinearGradient colors={GRADIENTS.quiz} style={styles.container}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>

          {/* Score hero */}
          <View style={styles.heroCard}>
            <Text style={styles.heroLabel}>Your Legacy Readiness Score</Text>
            <Text style={[styles.heroScore, { color: bandColor }]}>{result.percentReady}%</Text>
            <View style={[styles.bandBadge, { backgroundColor: bandColor + "18", borderColor: bandColor }]}>
              <Text style={[styles.bandText, { color: bandColor }]}>{result.band}</Text>
            </View>
            <Text style={styles.bandTone}>{BAND_TONES[result.band]}</Text>
          </View>

          {/* Jesse opening */}
          <View style={styles.jesseCard}>
            <View style={styles.jesseHeader}>
              <JesseAvatar size={48} />
              <View style={styles.jesseHeaderText}>
                <Text style={styles.jesseLabel}>Jesse</Text>
                <Text style={styles.jesseName}>Your Legacy Coach</Text>
              </View>
            </View>
            <Text style={styles.jesseText}>{jesse.opening}</Text>
          </View>

          {/* Domain breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your 4 Domains</Text>
            {result.domainResults.map((dr) => (
              <View key={dr.domain} style={styles.domainRow}>
                <View style={styles.domainNameRow}>
                  <View style={[styles.domainDot, { backgroundColor: DOMAIN_COLORS[dr.domain] }]} />
                  <Text style={styles.domainName}>{dr.domain}</Text>
                  {dr.rank === 1 && (
                    <View style={styles.weakestTag}>
                      <Text style={styles.weakestTagText}>Weakest</Text>
                    </View>
                  )}
                  <Text style={styles.domainScore}>{dr.score}/6</Text>
                </View>
                <View style={styles.barBg}>
                  <LinearGradient
                    colors={[DOMAIN_COLORS[dr.domain], COLORS.amber]}
                    style={[styles.barFill, { width: `${dr.percent}%` as any }]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Full 7-day plan — view only, intentionally not interactive */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your 7-Day Plan</Text>
            <View style={styles.planList}>
              {result.plan.map((assignment) => {
                const domainColor = DOMAIN_COLORS[assignment.domain] ?? COLORS.accent;
                const isDay1 = assignment.day === 1;
                return (
                  <View
                    key={assignment.day}
                    style={[styles.planDayCard, isDay1 && { borderColor: domainColor }]}
                  >
                    <View style={[styles.planDayBadge, { backgroundColor: domainColor + "22" }]}>
                      <Text style={[styles.planDayNumber, { color: domainColor }]}>{assignment.day}</Text>
                    </View>
                    <View style={styles.planDayContent}>
                      <Text style={styles.planDayDomain}>
                        {assignment.domain === "ALL" ? "All Domains" : assignment.domain}
                      </Text>
                      <Text style={styles.planDayTitle}>{assignment.action.title}</Text>
                      <Text style={styles.planDayTime}>{assignment.action.time}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Download PDF — branded ENDevo report */}
          <TouchableOpacity
            style={styles.pdfBtn}
            onPress={handleDownloadPDF}
            disabled={pdfLoading}
            activeOpacity={0.8}
          >
            {pdfLoading
              ? <ActivityIndicator color={COLORS.accent} size="small" />
              : <Text style={styles.pdfBtnText}>Download My Plan (PDF)</Text>
            }
          </TouchableOpacity>

          <Text style={styles.fine}>One action a day. 7 days. Your legacy, protected.</Text>

        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING["2xl"],
    gap: SPACING.xl,
  },
  heroCard: {
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  heroLabel: {
    color: COLORS.muted,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.tiny,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  heroScore: {
    fontFamily: FONTS.families.display,
    fontSize: 72,
    fontWeight: FONTS.weights.extrabold,
    lineHeight: 80,
  },
  bandBadge: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
  },
  bandText: {
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    letterSpacing: 1,
  },
  bandTone: {
    color: COLORS.offWhite,
    fontFamily: FONTS.families.body,
    fontSize: FONTS.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
    marginTop: SPACING.xs,
  },
  jesseCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  jesseHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  jesseHeaderText: { flex: 1, gap: 2 },
  jesseLabel: {
    color: COLORS.accent,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  jesseName: { color: COLORS.muted, fontFamily: FONTS.families.body, fontSize: FONTS.sizes.xs },
  jesseText: { color: COLORS.offWhite, fontFamily: FONTS.families.body, fontSize: FONTS.sizes.body, lineHeight: 24 },
  section: { gap: SPACING.md },
  sectionTitle: {
    color: COLORS.white,
    fontFamily: FONTS.families.display,
    fontSize: FONTS.sizes.subheading,
    fontWeight: FONTS.weights.bold,
  },
  domainRow: { gap: SPACING.xs },
  domainNameRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  domainDot: { width: 10, height: 10, borderRadius: 5 },
  domainName: {
    color: COLORS.white,
    fontFamily: FONTS.families.bodyMedium,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.medium,
    flex: 1,
  },
  weakestTag: {
    backgroundColor: COLORS.danger + "22",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  weakestTagText: {
    color: COLORS.dangerSoft,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
  },
  domainScore: { color: COLORS.muted, fontFamily: FONTS.families.body, fontSize: FONTS.sizes.sm },
  barBg: { height: 6, backgroundColor: COLORS.border, borderRadius: 3 },
  barFill: { height: 6, borderRadius: 3 },
  planList: { gap: SPACING.sm },
  planDayCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },
  planDayBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  planDayNumber: {
    fontFamily: FONTS.families.display,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.bold,
  },
  planDayContent: { flex: 1, gap: 2 },
  planDayDomain: {
    color: COLORS.muted,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  planDayTitle: {
    color: COLORS.white,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    lineHeight: 20,
  },
  planDayTime: { color: COLORS.muted, fontFamily: FONTS.families.body, fontSize: FONTS.sizes.xs },
  pdfBtn: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 14,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    minHeight: 50,
  },
  pdfBtnText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: FONTS.weights.semibold,
    fontFamily: FONTS.families.bodySemibold,
  },
  fine: { color: COLORS.muted, fontFamily: FONTS.families.body, fontSize: FONTS.sizes.tiny, textAlign: "center" },
});
