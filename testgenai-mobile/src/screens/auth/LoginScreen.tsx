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
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { api } from "../../services/api";
import Toast from "react-native-toast-message";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Login">;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await api.login(email.trim(), password);

      if (result.success && result.user && result.token) {
        await login(
          { name: result.user.name, email: result.user.email, role: "admin" },
          result.token,
        );
        Toast.show({
          type: "success",
          text1: `Welcome, ${result.user.name}!`,
          text2: "Logged in as Admin",
        });
        navigation.replace("Dashboard");
      } else {
        Toast.show({
          type: "error",
          text1: "Login failed",
          text2: result.error || "Invalid credentials",
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
            style={[styles.iconBg, { backgroundColor: colors.orange + "15" }]}
          >
            <Ionicons
              name="shield-checkmark"
              size={36}
              color={colors.orange}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Admin Sign In
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in with your admin account to continue
          </Text>
        </View>

        {/* Admin info */}
        <View
          style={[
            styles.roleInfo,
            {
              backgroundColor: colors.orange + "10",
              borderColor: colors.orange + "25",
            },
          ]}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.orange}
          />
          <Text style={[styles.roleInfoText, { color: colors.orange }]}>
            Admin access includes user management, system settings, and full
            project control
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            label="Email"
            placeholder="Enter your admin email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors((e) => ({ ...e, email: undefined }));
            }}
            error={errors.email}
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
          <TextInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password)
                setErrors((e) => ({ ...e, password: undefined }));
            }}
            error={errors.password}
            isPassword
            leftIcon={
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={colors.textMuted}
              />
            }
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotBtn}
            onPress={() => navigation.navigate("ForgotPassword")}
            activeOpacity={0.7}
          >
            <Text style={[styles.forgotText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title="Sign in as Admin"
            onPress={handleLogin}
            loading={loading}
            variant="orange"
            size="lg"
            icon={
              !loading ? (
                <Ionicons
                  name="log-in-outline"
                  size={18}
                  color={colors.primaryForeground}
                />
              ) : undefined
            }
          />
        </View>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textMuted }]}>
            or continue with
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Jira OAuth */}
        <Button
          title="Sign in with Jira"
          onPress={() => navigation.navigate("JiraAuth")}
          variant="outline"
          size="lg"
          icon={
            <Ionicons
              name="git-branch-outline"
              size={18}
              color={colors.text}
            />
          }
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 40 },
  header: { alignItems: "center", marginBottom: 28 },
  iconBg: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 6 },
  subtitle: { fontSize: 14, textAlign: "center", maxWidth: 280 },
  roleInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 20,
  },
  roleInfoText: { fontSize: 12, flex: 1, lineHeight: 17 },
  form: { marginBottom: 20 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: "500" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
});
