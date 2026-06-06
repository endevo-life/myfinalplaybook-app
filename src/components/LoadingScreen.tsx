// Splash screen — responsive to window size.
// On mobile: fills full screen.
// On desktop browser: centered phone-width panel (max 430px) on dark background.
import { useEffect } from "react";
import { View, Image, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { COLORS, FONTS, SPACING } from "@/constants/theme";
import JESSE_IMAGE from "../../assets/jesse.png";

const MAX_PHONE_W = 430;

export function LoadingScreen() {
  const { width: winW, height: winH } = useWindowDimensions();

  // Phone-frame dimensions — capped at 430px wide, full window height
  const frameW = Math.min(winW, MAX_PHONE_W);
  const frameH = winH;

  // ── Animated values ──────────────────────────────────────────
  const imageOpacity      = useSharedValue(0);
  const imageScale        = useSharedValue(0.13);
  const imageBorderRadius = useSharedValue(500);
  const overlayOpacity    = useSharedValue(0);
  const taglineOpacity    = useSharedValue(0);
  const taglineY          = useSharedValue(18);
  const titleOpacity      = useSharedValue(0);
  const titleY            = useSharedValue(18);
  const subtitleOpacity   = useSharedValue(0);
  const subtitleY         = useSharedValue(14);
  const dotOpacity        = useSharedValue(0.3);

  const ease = Easing.out(Easing.cubic);

  useEffect(() => {
    // Phase 1 — small Jesse circle fades in
    imageOpacity.value = withTiming(1, { duration: 450, easing: ease });

    // Phase 2 — Jesse expands to full background
    setTimeout(() => {
      imageScale.value        = withTiming(1, { duration: 900, easing: Easing.out(Easing.exp) });
      imageBorderRadius.value = withTiming(0, { duration: 900, easing: Easing.out(Easing.exp) });
    }, 500);

    // Phase 3 — dark overlay
    setTimeout(() => {
      overlayOpacity.value = withTiming(1, { duration: 380 });
    }, 1350);

    // Phase 4 — staggered text
    setTimeout(() => {
      taglineOpacity.value = withTiming(1, { duration: 420 });
      taglineY.value       = withTiming(0, { duration: 420, easing: ease });
    }, 1700);

    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 450 });
      titleY.value       = withTiming(0, { duration: 450, easing: ease });
    }, 1950);

    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, { duration: 400 });
      subtitleY.value       = withTiming(0, { duration: 400, easing: ease });
    }, 2200);

    // Loading dots pulse
    dotOpacity.value = withRepeat(
      withSequence(
        withTiming(1,   { duration: 480 }),
        withTiming(0.3, { duration: 480 })
      ),
      -1,
      false
    );
  }, []);

  const imageAnimStyle  = useAnimatedStyle(() => ({
    opacity:      imageOpacity.value,
    borderRadius: imageBorderRadius.value,
    transform:    [{ scale: imageScale.value }],
  }));
  const overlayStyle    = useAnimatedStyle(() => ({ opacity: overlayOpacity.value }));
  const taglineStyle    = useAnimatedStyle(() => ({ opacity: taglineOpacity.value, transform: [{ translateY: taglineY.value }] }));
  const titleStyle      = useAnimatedStyle(() => ({ opacity: titleOpacity.value,   transform: [{ translateY: titleY.value }] }));
  const subtitleStyle   = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value,transform: [{ translateY: subtitleY.value }] }));
  const dotStyle        = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  return (
    // Full browser viewport — dark background
    <View style={[styles.viewport, { width: winW, height: winH }]}>

      {/* Centered phone frame */}
      <View style={[styles.frame, { width: frameW, height: frameH }]}>

        {/* Jesse — starts small, expands to fill frame */}
        <Animated.View style={[styles.jesseFill, { width: frameW, height: frameH }, imageAnimStyle]}>
          <Image source={JESSE_IMAGE} style={styles.jesseImage} resizeMode="cover" />
        </Animated.View>

        {/* Dark overlay */}
        <Animated.View style={[StyleSheet.absoluteFillObject, overlayStyle, { backgroundColor: "rgba(15,23,42,0.68)" }]} />

        {/* Text block — bottom of frame */}
        <View style={[styles.textBlock, { bottom: Math.max(100, frameH * 0.15) }]}>
          <Animated.Text style={[styles.tagline, taglineStyle]}>
            Live Fully. Die Ready.
          </Animated.Text>
          <Animated.Text style={[styles.title, titleStyle]}>
            My Final{"\n"}Playbook
          </Animated.Text>
          <Animated.Text style={[styles.subtitle, subtitleStyle]}>
            Legacy Readiness Gap Analysis
          </Animated.Text>
        </View>

        {/* Loading dots */}
        <Animated.View style={[styles.dotRow, { bottom: Math.max(40, frameH * 0.06) }, dotStyle]}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </Animated.View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full browser viewport, dark background
  viewport: {
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // Phone-sized centered frame
  frame: {
    overflow: "hidden",
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
  },
  jesseFill: {
    position: "absolute",
    overflow: "hidden",
  },
  jesseImage: {
    width: "100%",
    height: "100%",
  },
  textBlock: {
    position: "absolute",
    left: SPACING.lg,
    right: SPACING.lg,
    alignItems: "center",
    gap: SPACING.sm,
  },
  tagline: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes["3xl"],
    fontWeight: FONTS.weights.extrabold,
    lineHeight: 46,
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: FONTS.sizes.base,
    textAlign: "center",
    marginTop: SPACING.xs,
  },
  dotRow: {
    position: "absolute",
    flexDirection: "row",
    gap: SPACING.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
});
