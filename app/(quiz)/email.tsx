// Capture screen — first name + email collected together after the 12 questions
import { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, Switch, ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { runAssessment, type Answer } from "@/lib/engine";
import { sendToGHL } from "@/lib/ghl";
import { analytics, identify } from "@/lib/analytics";
import { useAssessmentStore } from "@/hooks/useAssessmentStore";
import { COLORS, FONTS, SPACING, GRADIENTS, RADIUS, SHADOWS } from "@/constants/theme";

export default function EmailScreen() {
  const router   = useRouter();
  const store    = useAssessmentStore();
  const params   = useLocalSearchParams<{ answers: string }>();
  const answers: Answer[] = params.answers ? JSON.parse(params.answers) : [];
  const insets   = useSafeAreaInsets();

  const [firstName, setFirstName] = useState("");
  const [email,     setEmail]     = useState("");
  const [consent,   setConsent]   = useState(true);
  const [loading,   setLoading]   = useState(false);

  const emailRef = useRef<TextInput>(null);

  const name         = firstName.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const isValidName  = name.length >= 2;
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const canSubmit    = isValidName && isValidEmail && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      identify(trimmedEmail);
      analytics.emailCaptured(consent, "capture_screen");

      const result = runAssessment(name, answers);
      analytics.assessmentCompleted(result.totalScore, result.band, result.weakestDomain);

      await Promise.all([
        store.saveResult(result, answers),
        store.saveEmail(trimmedEmail),
        store.saveName(name),
      ]);

      sendToGHL(result, trimmedEmail, consent, Platform.OS as "ios" | "android").catch(
        (e) => console.warn("[ghl]", e)
      );

      router.replace({
        pathname: "/results" as any,
        params: {
          name,
          email: trimmedEmail,
          answers: params.answers,
          result: JSON.stringify(result),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["left", "right", "top"]}>
      <LinearGradient colors={GRADIENTS.quiz} style={styles.container}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={[styles.inner, { paddingBottom: insets.bottom + SPACING.xl }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
          <View style={styles.top}>
            <Text style={styles.label}>Almost there</Text>
            <Text style={styles.title}>Where should we send your plan?</Text>
            <Text style={styles.sub}>
              Your personalised 7-day action plan will be ready instantly.
            </Text>
          </View>

          <View style={styles.card}>
            {/* First name */}
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={COLORS.label}
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              autoFocus
            />

            {/* Email */}
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.label}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />

            {/* Consent toggle */}
            <View style={styles.consentRow}>
              <Switch
                value={consent}
                onValueChange={setConsent}
                trackColor={{ false: COLORS.border, true: COLORS.accentDeep }}
                thumbColor={COLORS.white}
              />
              <Text style={styles.consentText}>
                Send me daily action reminders and tips (unsubscribe anytime)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.buttonWrap, !canSubmit && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.9}
          >
            <LinearGradient colors={GRADIENTS.cta} style={styles.button}>
              <Text style={styles.buttonText}>
                {loading ? "Loading…" : "See My Results →"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.privacy}>No spam. No sharing. Unsubscribe anytime.</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  flex:      { flex: 1 },
  inner: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING["2xl"],
    paddingBottom: SPACING.xl,
    justifyContent: "space-between",
    gap: SPACING.lg,
  },
  top:   { gap: SPACING.sm },
  label: {
    color: COLORS.accent,
    fontSize: FONTS.sizes.tiny,
    fontWeight: FONTS.weights.semibold,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.white,
    fontSize: FONTS.sizes.heading,
    fontWeight: FONTS.weights.bold,
    lineHeight: 36,
  },
  sub: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.body,
    lineHeight: 22,
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
    fontSize: FONTS.sizes.body,
    fontWeight: FONTS.weights.medium,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  consentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  consentText: {
    color: COLORS.muted,
    fontSize: FONTS.sizes.sm,
    flex: 1,
    lineHeight: 20,
  },
  buttonWrap:    { borderRadius: RADIUS.pill, overflow: "hidden", ...SHADOWS.cta },
  button:        { paddingVertical: SPACING.md, alignItems: "center" },
  buttonDisabled:{ opacity: 0.4 },
  buttonText:    { color: COLORS.white, fontSize: 17, fontWeight: FONTS.weights.bold },
  privacy:       { color: COLORS.muted, fontSize: FONTS.sizes.tiny, textAlign: "center" },
});
