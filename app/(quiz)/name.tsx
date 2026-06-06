// Name capture screen — first screen of the quiz
import { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS, SPACING, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";

export default function NameScreen() {
  const router = useRouter();
  const [name, setName] = useState("");

  const canContinue = name.trim().length >= 2;

  const handleContinue = () => {
    if (!canContinue) return;
    router.push({ pathname: "/question" as any, params: { name: name.trim(), questionIndex: "0", answers: "[]" } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={GRADIENTS.quiz} style={styles.container}>
        <KeyboardAvoidingView
          style={styles.inner}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.top}>
            <Text style={styles.step}>Let's start</Text>
            <Text style={styles.title}>What's your first name?</Text>
            <Text style={styles.sub}>We'll personalise your plan for you.</Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Your first name"
              placeholderTextColor={COLORS.label}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={handleContinue}
            />

            <TouchableOpacity
              style={[styles.buttonWrap, !canContinue && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.9}
            >
              <LinearGradient colors={GRADIENTS.cta} style={styles.button}>
                <Text style={styles.buttonText}>Continue →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  inner: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING["2xl"],
    paddingBottom: SPACING.xl,
    justifyContent: "space-between",
  },
  top: { gap: SPACING.sm },
  step: {
    color: COLORS.accent,
    fontFamily: FONTS.families.bodySemibold,
    fontSize: FONTS.sizes.tiny,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.white,
    fontFamily: FONTS.families.display,
    fontSize: FONTS.sizes.heading,
    fontWeight: FONTS.weights.bold,
    lineHeight: 36,
  },
  sub: {
    color: COLORS.muted,
    fontFamily: FONTS.families.body,
    fontSize: FONTS.sizes.body,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
    ...SHADOWS.card,
  },
  input: {
    backgroundColor: COLORS.surface2,
    borderRadius: RADIUS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.white,
    fontFamily: FONTS.families.bodyMedium,
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  buttonWrap: {
    borderRadius: RADIUS.pill,
    overflow: "hidden",
    ...SHADOWS.cta,
  },
  button: {
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: {
    color: COLORS.white,
    fontFamily: FONTS.families.display,
    fontSize: 17,
    fontWeight: FONTS.weights.bold,
  },
});
