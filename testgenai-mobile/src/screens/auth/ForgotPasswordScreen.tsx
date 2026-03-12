import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { api } from "../../services/api";
import Toast from "react-native-toast-message";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "ForgotPassword">;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [sent, setSent] = useState(false);

  const validate = (): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleSendReset = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await api.forgotPassword(email.trim());

      if (result.success) {
        setSent(true);
        Toast.show({
          type: "success",
          text1: "Email sent!",
          text2: "Check your inbox for reset instructions",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Request failed",
          text2: result.error || "Could not send reset email",
        });
      }
    } catch (err) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.successContent}
      >
        {/* Success State */}
        <View
          style={[
            styles.successIconBg,
            { backgroundColor: colors.success + "15" },
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={56}
            color={colors.success}
          />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>
          Check Your Email
        </Text>
        <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>
          We've sent password reset instructions to
        </Text>
        <View
          style={[
            styles.emailBadge,
            { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" },
          ]}
        >
          <Ionicons name="mail" size={16} color={colors.primary} />
          <Text style={[styles.emailBadgeText, { color: colors.primary }]}>
            {email.trim()}
          </Text>
        </View>

        <View
          style={[
            styles.instructionBox,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.instructionTitle, { color: colors.text }]}>
            Next steps:
          </Text>
          <Text
            style={[styles.instructionText, { color: colors.textSecondary }]}
          >
            1. Open the email we sent you
          </Text>
          <Text
            style={[styles.instructionText, { color: colors.textSecondary }]}
          >
            2. Click the password reset link
          </Text>
          <Text
            style={[styles.instructionText, { color: colors.textSecondary }]}
          >
            3. Create your new password
          </Text>
          <Text
            style={[styles.instructionText, { color: colors.textSecondary }]}
          >
            4. Sign in with your new password
          </Text>
        </View>

        <Button
          title="Back to Sign In"
          onPress={() => navigation.navigate("Login")}
          variant="primary"
          size="lg"
          icon={
            <Ionicons
              name="arrow-back"
              size={18}
              color={colors.primaryForeground}
            />
          }
        />

        <TouchableOpacity
          style={styles.resendBtn}
          onPress={() => {
            setSent(false);
            handleSendReset();
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>
            Didn't receive the email?{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              Resend
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View
            style={[
              styles.iconBg,
              { backgroundColor: colors.orange + "15" },
            ]}
          >
            <Ionicons name="key-outline" size={36} color={colors.orange} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Forgot Password?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            No worries! Enter your email address and we'll send you instructions
            to reset your password.
          </Text>
        </View>

        {/* Info box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.muted, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            For security, the reset link will expire after 30 minutes. Make sure
            to check your spam folder if you don't see the email.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Email Address"
            placeholder="Enter your registered email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError("");
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={
              <Ionicons
                name="mail-outline"
                size={18}
                color={colors.textMuted}
              />
            }
          />

          <Button
            title="Send Reset Link"
            onPress={handleSendReset}
            loading={loading}
            variant="primary"
            size="lg"
            icon={
              !loading ? (
                <Ionicons
                  name="send-outline"
                  size={18}
                  color={colors.primaryForeground}
                />
              ) : undefined
            }
          />
        </View>

        {/* Back to login */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={16} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}>
            Back to Sign In
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 40 },
  successContent: { padding: 20, paddingTop: 60, alignItems: "center" },
  header: { alignItems: "center", marginBottom: 24 },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 300,
  },
  infoBox: {
    flexDirection: "row",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 24,
    alignItems: "flex-start",
  },
  infoText: { fontSize: 12, lineHeight: 18, flex: 1 },
  form: { marginBottom: 24 },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  backText: { fontSize: 14, fontWeight: "500" },
  // Success state styles
  successIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  successSubtitle: { fontSize: 14, textAlign: "center", marginBottom: 12 },
  emailBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginBottom: 24,
  },
  emailBadgeText: { fontSize: 14, fontWeight: "500" },
  instructionBox: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  instructionTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  instructionText: { fontSize: 13, lineHeight: 22 },
  resendBtn: { marginTop: 16 },
  resendText: { fontSize: 13, textAlign: "center" },
});
