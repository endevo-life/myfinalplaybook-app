import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { AssessmentResult } from "@/lib/engine";
import { getJesseWrapper } from "@/lib/engine";
import { analytics } from "@/lib/analytics";
import { downloadPDF } from "@/lib/pdf";
import { JesseAvatar } from "@/components/JesseAvatar";
import { COLORS, FONTS, SPACING, BAND_COLORS, BAND_TONES, DOMAIN_COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ result: string; email: string }>();
  const result: AssessmentResult = JSON.parse(params.result ?? "{}");
  const jesse = getJesseWrapper(result);

  const bandColor = BAND_COLORS[result.band] ?? COLORS.accent;
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    analytics.resultViewed(result.totalScore, result.band, result.weakestDomain);
  }, []);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      await downloadPDF(result);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleStartPlan = () => {
    router.replace({
      pathname: "/plan" as any,
      params: { result: params.result, email: params.email },
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={GRADIENTS.quiz} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll}>

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

          {/* Plan preview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your 7-Day Plan Starts With</Text>
            <View style={styles.day1Card}>
              <Text style={styles.day1Label}>Day 1 · {result.plan[0].domain}</Text>
              <Text style={styles.day1Title}>{result.plan[0].action.title}</Text>
              <Text style={styles.day1Time}>{result.plan[0].action.time}</Text>
            </View>
          </View>

          {/* Download PDF */}
          <TouchableOpacity
            style={styles.pdfBtn}
            onPress={handleDownloadPDF}
            disabled={pdfLoading}
            activeOpacity={0.8}
          >
            {pdfLoading ? (
              <ActivityIndicator color={COLORS.accent} size="small" />
            ) : (
              <Text style={styles.pdfBtnText}>Download My Plan (PDF)</Text>
            )}
          </TouchableOpacity>

          {/* Start plan CTA */}
          <TouchableOpacity style={styles.ctaWrap} onPress={handleStartPlan} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENTS.cta} style={styles.cta}>
              <Text style={styles.ctaText}>Start Day 1 Now</Text>
            </LinearGradient>
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
  day1Card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.xs,
    ...SHADOWS.card,
  },
  day1Label: {
    color: COLORS.accent,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  day1Title: {
    color: COLORS.white,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.semibold,
    lineHeight: 22,
  },
  day1Time: { color: COLORS.muted, fontFamily: FONTS.families.body, fontSize: FONTS.sizes.xs },
  pdfBtn: {
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.accent,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  pdfBtnText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: FONTS.weights.semibold,
    fontFamily: FONTS.families.bodySemibold,
  },
  ctaWrap: { borderRadius: RADIUS.pill, overflow: "hidden", ...SHADOWS.cta },
  cta: { paddingVertical: SPACING.md, alignItems: "center" },
  ctaText: { color: COLORS.white, fontFamily: FONTS.families.display, fontSize: 17, fontWeight: FONTS.weights.bold },
  fine: { color: COLORS.muted, fontFamily: FONTS.families.body, fontSize: FONTS.sizes.tiny, textAlign: "center" },
});
