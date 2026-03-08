import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { API_BASE_URL } from "../../config/apiconfig";
import * as WebBrowser from "expo-web-browser";
import Toast from "react-native-toast-message";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const JiraAuthScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { loginJira } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!credentials.username || !credentials.password) {
      setError("Please enter both username and password");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // Open the backend OAuth login in an in-app browser.
      // The backend redirects back with token/session params.
      const params = new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      });
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE_URL}/jira/login?${params.toString()}`,
        "testgenai://callback",
      );

      if (result.type === "success" && result.url) {
        // Parse callback URL for token, session, user
        const url = new URL(result.url);
        const token = url.searchParams.get("token");
        const session = url.searchParams.get("session");
        const userParam = url.searchParams.get("user");

        if (token && userParam && session) {
          const user = JSON.parse(userParam);
          await loginJira(user, token, session);
          Toast.show({
            type: "success",
            text1: `Welcome, ${user.name || "user"}!`,
          });
          navigation.replace("Dashboard");
          return;
        }
      }
      setError("Authentication was cancelled or failed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setCredentials({ username: "sarah.chen", password: "password123" });
    // Auto-submit with demo credentials
    setLoading(true);
    try {
      const params = new URLSearchParams({
        username: "sarah.chen",
        password: "password123",
      });
      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE_URL}/jira/login?${params.toString()}`,
        "testgenai://callback",
      );

      if (result.type === "success" && result.url) {
        const url = new URL(result.url);
        const token = url.searchParams.get("token");
        const session = url.searchParams.get("session");
        const userParam = url.searchParams.get("user");

        if (token && userParam && session) {
          const user = JSON.parse(userParam);
          await loginJira(user, token, session);
          Toast.show({ type: "success", text1: `Welcome, ${user.name}!` });
          navigation.replace("Dashboard");
          return;
        }
      }
    } catch (err) {
      setError("Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <View style={styles.header}>
        <View
          style={[styles.iconBg, { backgroundColor: colors.primary + "15" }]}
        >
          <Ionicons name="log-in-outline" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Login to Jira
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Connect to your Jira workspace to access projects and issues
        </Text>
      </View>

      {/* Demo credentials */}
      <View
        style={[
          styles.demoBox,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.demoTitle, { color: colors.text }]}>
          Demo Credentials:
        </Text>
        <Text style={[styles.demoText, { color: colors.textSecondary }]}>
          Username: sarah.chen, john.doe, or admin
        </Text>
        <Text style={[styles.demoText, { color: colors.textSecondary }]}>
          Password: password123 or admin
        </Text>
        <TouchableOpacity
          style={[styles.demoBtn, { backgroundColor: colors.border }]}
          onPress={handleDemoLogin}
          disabled={loading}
        >
          <Text style={[styles.demoBtnText, { color: colors.textSecondary }]}>
            Quick Demo Login
          </Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <TextInput
        label="Username or Email"
        placeholder="Enter your username or email"
        value={credentials.username}
        onChangeText={(text) =>
          setCredentials({ ...credentials, username: text })
        }
        autoCapitalize="none"
        editable={!loading}
        leftIcon={
          <Ionicons name="person-outline" size={18} color={colors.textMuted} />
        }
      />

      <TextInput
        label="Password"
        placeholder="Enter your password"
        value={credentials.password}
        onChangeText={(text) =>
          setCredentials({ ...credentials, password: text })
        }
        isPassword
        editable={!loading}
        leftIcon={
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.textMuted}
          />
        }
      />

      {error ? (
        <View
          style={[
            styles.errorBox,
            {
              backgroundColor: colors.destructive + "15",
              borderColor: colors.destructive + "30",
            },
          ]}
        >
          <Ionicons name="alert-circle" size={16} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {error}
          </Text>
        </View>
      ) : null}

      <Button
        title="Login to Jira"
        onPress={handleLogin}
        loading={loading}
        variant="primary"
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

      <Text style={[styles.footer, { color: colors.textMuted }]}>
        This is a demo environment. In production, you would use OAuth2 or API
        tokens.
      </Text>
    </ScrollView>
  );
};

export default JiraAuthScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 24, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 28 },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  demoBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  demoTitle: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  demoText: { fontSize: 12, lineHeight: 18 },
  demoBtn: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  demoBtnText: { fontSize: 12, fontWeight: "500" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, flex: 1 },
  footer: {
    textAlign: "center",
    fontSize: 11,
    marginTop: 20,
    lineHeight: 16,
  },
});
