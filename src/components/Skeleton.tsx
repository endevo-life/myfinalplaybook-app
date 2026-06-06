// Reusable shimmer skeleton — used anywhere content is loading
import { useEffect } from "react";
import { StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { COLORS } from "@/constants/theme";

interface SkeletonProps {
  width?: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height, borderRadius = 8, style }: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.border,
  },
});
