// Results screen - shows score, band, domain breakdown, and CTA to Day 1
import { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import type { AssessmentResult } from "@/lib/engine";
import { getJesseWrapper } from "@/lib/engine";
import { analytics } from "@/lib/analytics";
import { JesseAvatar } from "@/components/JesseAvatar";
import { COLORS, FONTS, SPACING, BAND_COLORS, BAND_TONES, DOMAIN_COLORS, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";

function printReport(result: AssessmentResult, jesse: ReturnType<typeof getJesseWrapper>) {
  const bandColors: Record<string, string> = {
    "AT RISK": "#B8341B",
    "SOMEWHAT PREPARED": "#D94A28",
    "PREPARED": "#C9A84C",
  };
  const domColors: Record<string, string> = {
    Digital: "#60a5fa",
    Legal: "#c084fc",
    Financial: "#34d399",
    Physical: "#fb923c",
  };
  const bc = bandColors[result.band] ?? "#f97316";

  const domRows = result.domainResults.map((dr) => {
    const pct = Math.round((dr.score / 6) * 100);
    const dc = domColors[dr.domain] ?? "#f97316";
    const weakTag = dr.rank === 1
      ? "<span style='background:#ef444420;color:#f87171;font-size:10px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:8px;border:1px solid #ef444440'>WEAKEST</span>"
      : "";
    return (
      "<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:10px;padding:12px 14px;margin-bottom:10px'>" +
      "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:8px'>" +
      "<div style='display:flex;align-items:center'>" +
      "<div style='width:10px;height:10px;border-radius:50%;background:" + dc + ";margin-right:8px;-webkit-print-color-adjust:exact;print-color-adjust:exact'></div>" +
      "<span style='font-weight:700;color:#fff;font-size:13px'>" + dr.domain + weakTag + "</span></div>" +
      "<span style='color:rgba(255,255,255,0.55);font-size:12px'>" + dr.score + "/6</span>" +
      "</div>" +
      "<div style='background:rgba(255,255,255,0.10);border-radius:4px;height:7px;-webkit-print-color-adjust:exact;print-color-adjust:exact'>" +
      "<div style='width:" + pct + "%;background:linear-gradient(90deg," + dc + ",#fbbf24);height:7px;border-radius:4px;-webkit-print-color-adjust:exact;print-color-adjust:exact'></div>" +
      "</div></div>"
    );
  }).join("");

  const dayRows = result.plan.map((d) => {
    const label = d.domain === "ALL" ? "ALL DOMAINS" : d.domain.toUpperCase();
    const dc = d.domain !== "ALL" ? (domColors[d.domain] ?? "#f97316") : "#f97316";
    return (
      "<div style='background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.10);border-radius:10px;padding:12px 14px;margin-bottom:8px'>" +
      "<div style='display:flex;align-items:center;gap:8px;margin-bottom:6px'>" +
      "<div style='background:#f9731620;border:1px solid #f9731640;border-radius:20px;padding:2px 10px;font-size:10px;font-weight:700;color:#f97316;-webkit-print-color-adjust:exact;print-color-adjust:exact'>DAY " + d.day + "</div>" +
      "<div style='width:8px;height:8px;border-radius:50%;background:" + dc + ";-webkit-print-color-adjust:exact;print-color-adjust:exact'></div>" +
      "<span style='color:rgba(255,255,255,0.55);font-size:10px;font-weight:700;letter-spacing:1px'>" + label + "</span>" +
      "<span style='color:rgba(255,255,255,0.35);font-size:10px;margin-left:auto'>" + d.action.time + "</span>" +
      "</div>" +
      "<div style='color:rgba(255,255,255,0.88);font-size:13px;line-height:1.5'>" + d.action.title + "</div>" +
      "</div>"
    );
  }).join("");

  const html = "<!DOCTYPE html><html><head><meta charset='utf-8'/><title>MyFinalPlaybook - " + result.name + "</title>" +
    "<style>" +
    "*{box-sizing:border-box;margin:0;padding:0}" +
    "body{font-family:Arial,sans-serif;background:#0f172a;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}" +
    "@media print{@page{margin:0;size:A4}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}" +
    "</style></head>" +
    "<body style='background:#0f172a;padding:0'>" +

    "<div style='background:linear-gradient(180deg,#0f172a 0%,#1e3a8a 50%,#0f172a 100%);min-height:100vh;padding:28px;-webkit-print-color-adjust:exact;print-color-adjust:exact'>" +

    "<div style='display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;padding-bottom:18px;border-bottom:1px solid rgba(255,255,255,0.10)'>" +
    "<div><div style='font-size:20px;font-weight:800;color:#fff;letter-spacing:-0.5px'>My Final Playbook</div>" +
    "<div style='font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;margin-top:3px'>Legacy Readiness Report</div></div>" +
    "<div style='color:#f97316;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase'>Live Fully. Die Ready.</div></div>" +

    "<div style='font-size:13px;color:rgba(255,255,255,0.55);letter-spacing:1px;text-transform:uppercase;margin-bottom:6px'>" + result.name + "'s Report</div>" +

    "<div style='background:" + bc + ";border-radius:14px;padding:20px 24px;display:flex;align-items:center;gap:24px;margin-bottom:20px;-webkit-print-color-adjust:exact;print-color-adjust:exact'>" +
    "<div style='font-size:56px;font-weight:800;color:#fff;line-height:1'>" + result.percentReady + "%</div>" +
    "<div style='flex:1'>" +
    "<div style='font-size:15px;font-weight:700;color:#fff;letter-spacing:1px'>" + result.band + "</div>" +
    "<div style='font-size:11px;color:rgba(255,255,255,0.70);margin-top:4px'>Score: " + result.totalScore + " out of 24</div>" +
    "<div style='background:rgba(255,255,255,0.20);border-radius:4px;height:5px;margin-top:10px;-webkit-print-color-adjust:exact;print-color-adjust:exact'>" +
    "<div style='width:" + result.percentReady + "%;background:#fff;height:5px;border-radius:4px;-webkit-print-color-adjust:exact;print-color-adjust:exact'></div>" +
    "</div></div></div>" +

    "<div style='background:rgba(249,115,22,0.10);border:1px solid rgba(249,115,22,0.25);border-left:4px solid #f97316;border-radius:10px;padding:14px 16px;margin-bottom:20px;-webkit-print-color-adjust:exact;print-color-adjust:exact'>" +
    "<div style='font-size:10px;font-weight:700;color:#f97316;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:6px'>JESSE &mdash; YOUR LEGACY COACH</div>" +
    "<div style='color:rgba(255,255,255,0.80);font-size:12px;line-height:1.7'>" + jesse.opening + "</div></div>" +

    "<div style='font-size:11px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;margin-bottom:12px'>YOUR 4 DOMAINS</div>" +
    domRows +

    "<div style='font-size:11px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;margin:20px 0 12px'>YOUR 7-DAY ACTION PLAN</div>" +
    dayRows +

    "<div style='margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.10);display:flex;justify-content:space-between;font-size:10px;color:rgba(255,255,255,0.30)'>" +
    "<span>ENDevo &nbsp;|&nbsp; MyFinalPlaybook.com &nbsp;|&nbsp; Live Fully. Die Ready.</span>" +
    "<span>" + new Date().toLocaleDateString() + "</span></div>" +

    "</div></body></html>";

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ result: string; email: string }>();
  const result: AssessmentResult = JSON.parse(params.result ?? "{}");
  const jesse = getJesseWrapper(result);

  const bandColor = BAND_COLORS[result.band] ?? COLORS.accent;
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = () => {
    setDownloading(true);
    printReport(result, jesse);
    setTimeout(() => setDownloading(false), 600);
  };

  useEffect(() => {
    analytics.resultViewed(result.totalScore, result.band, result.weakestDomain);
  }, []);

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
              <Text style={styles.day1Label}>{"Day 1 · " + result.plan[0].domain}</Text>
              <Text style={styles.day1Title}>{result.plan[0].action.title}</Text>
              <Text style={styles.day1Time}>{result.plan[0].action.time}</Text>
            </View>
          </View>

          {/* Start plan CTA */}
          <TouchableOpacity style={styles.ctaWrap} onPress={handleStartPlan} activeOpacity={0.9}>
            <LinearGradient colors={GRADIENTS.cta} style={styles.cta}>
              <Text style={styles.ctaText}>{"Start Day 1 Now →"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          {Platform.OS === "web" && (
            <TouchableOpacity
              style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
              onPress={handleDownloadPDF}
              activeOpacity={0.8}
              disabled={downloading}
            >
              <Text style={styles.downloadIcon}>{"⬇"}</Text>
              <Text style={styles.downloadText}>
                {downloading ? "Generating PDF..." : "Download My Report (PDF)"}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.fine}>
            One action a day. 7 days. Your legacy, protected.
          </Text>
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
  downloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    borderRadius: RADIUS.pill,
    paddingVertical: 14,
    backgroundColor: COLORS.surface2,
  },
  downloadBtnDisabled: { opacity: 0.5 },
  downloadIcon: { fontSize: 16, color: COLORS.white },
  downloadText: {
    color: COLORS.white,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
  },
});
