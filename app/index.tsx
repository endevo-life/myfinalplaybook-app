import { useState, useEffect } from "react";
import {
  View, Text, Image, StyleSheet, TouchableOpacity,
  ScrollView, useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay, withSpring,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { VideoPlayer } from "@/components/VideoPlayer";
import { analytics } from "@/lib/analytics";
import { COLORS, FONTS, SPACING, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";
import ENDEVO_LOGO from "../assets/logo_v2_with_white_text.png";

import VIDEO_SRC from "../assets/Jesse-q12.mp4";

const BUTTON_DELAY = 3500;

export default function IntroScreen() {
  const router = useRouter();
  const [videoEnded, setVideoEnded] = useState(false);
  const insets = useSafeAreaInsets();

  // Responsive 9:16 video card — recomputes on rotation / different screens.
  const { width: W, height: H } = useWindowDimensions();
  const VID_W = Math.min(W - SPACING.lg * 2, 320);
  // Cap height so the card never exceeds ~half the screen on small phones.
  const VID_H = Math.min(Math.round(VID_W * (16 / 9)), Math.round(H * 0.5));

  const logoOpacity = useSharedValue(0);
  const btnOpacity  = useSharedValue(0);
  const btnScale    = useSharedValue(0.94);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700 });
    btnOpacity.value  = withDelay(BUTTON_DELAY, withTiming(1, { duration: 600 }));
    btnScale.value    = withDelay(BUTTON_DELAY, withSpring(1, { damping: 14 }));
  }, []);

  const handleStart = () => {
    analytics.assessmentStarted();
    router.push({ pathname: "/question" as any, params: { questionIndex: "0", answers: "[]" } });
  };

  const logoStyle    = useAnimatedStyle(() => ({ opacity: logoOpacity.value }));
  const btnAnimStyle = useAnimatedStyle(() => ({
    opacity: btnOpacity.value,
    transform: [{ scale: btnScale.value }],
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "top"]}>
      <LinearGradient colors={GRADIENTS.main} style={styles.container}>

        {/* Logo bar */}
        <Animated.View style={[styles.topBar, logoStyle]}>
          <Image source={ENDEVO_LOGO} style={styles.logo} resizeMode="contain" />
          <View style={styles.freeBadge}>
            <View style={styles.freeDot} />
            <Text style={styles.freeText}>FREE</Text>
          </View>
        </Animated.View>

        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + SPACING.xl }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Video card */}
          <View style={[styles.videoCard, { width: VID_W, height: VID_H }]}>
            <VideoPlayer
              source={VIDEO_SRC}
              width={VID_W}
              height={VID_H}
              muted
              autoPlay
              onEnded={() => setVideoEnded(true)}
            />
            {videoEnded && (
              <TouchableOpacity
                style={styles.replayOverlay}
                onPress={() => setVideoEnded(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.replayIcon}>{"↺"}</Text>
                <Text style={styles.replayLabel}>Replay</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Copy */}
          <View style={styles.copy}>
            <Text style={styles.tagline}>Live Fully. Die Ready.</Text>
            <Text style={styles.title}>My Final Playbook</Text>
            <Text style={styles.subtitle}>
              12 questions · 4 domains · your personalised 7-day action plan
            </Text>
          </View>

          {/* CTA */}
          <Animated.View style={[styles.ctaBlock, btnAnimStyle]}>
            <TouchableOpacity
              style={styles.ctaWrap}
              onPress={handleStart}
              activeOpacity={0.88}
            >
              <LinearGradient colors={GRADIENTS.cta} style={styles.ctaBtn}>
                <Text style={styles.ctaText}>Start My Assessment →</Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={styles.fine}>Free · No account required · ~3 minutes</Text>
          </Animated.View>
        </ScrollView>

      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  logo: { width: 130, height: 36 },
  freeBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "rgba(34,197,94,0.15)",
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.sm, paddingVertical: 4,
    borderWidth: 1, borderColor: "rgba(34,197,94,0.3)",
  },
  freeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
  freeText: { color: COLORS.success, fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.bold, letterSpacing: 1 },

  scroll: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.lg,
    alignItems: "center",
  },

  videoCard: {
    borderRadius: RADIUS.surface,
    overflow: "hidden",
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
  },

  replayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.xs,
  },
  replayIcon:  { fontSize: 36, color: COLORS.white },
  replayLabel: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: FONTS.weights.semibold },

  copy: { gap: SPACING.xs, alignItems: "center" },
  tagline: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes["2xl"],
    fontWeight: FONTS.weights.extrabold,
    lineHeight: 36,
    textAlign: "center",
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.sm,
    lineHeight: 20,
    textAlign: "center",
  },

  ctaBlock: { width: "100%", gap: SPACING.sm },
  ctaWrap:  { borderRadius: RADIUS.pill, overflow: "hidden", ...SHADOWS.cta },
  ctaBtn:   { paddingVertical: 16, alignItems: "center" },
  ctaText:  { color: COLORS.white, fontSize: 17, fontWeight: FONTS.weights.bold },
  fine: {
    color: "rgba(255,255,255,0.4)",
    fontSize: FONTS.sizes.xs,
    textAlign: "center",
  },
});

