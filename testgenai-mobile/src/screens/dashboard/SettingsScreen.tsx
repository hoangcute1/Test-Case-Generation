import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Card } from "../../components/ui/Card";
import Toast from "react-native-toast-message";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark, toggle } = useTheme();
  const { jiraUser, isJiraAuthenticated, isPostmanAuthenticated, logoutAll } =
    useAuthStore();
  const { reset } = useAppStore();

  const handleLogout = () => {
    logoutAll();
    reset();
    Toast.show({ type: "info", text1: "Logged out successfully" });
    navigation.reset({ index: 0, routes: [{ name: "Landing" }] });
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Manage your preferences
        </Text>
      </View>

      {/* Profile */}
      {isJiraAuthenticated && jiraUser && (
        <Card>
          <View style={styles.profileRow}>
            <View
              style={[styles.avatarCircle, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[styles.avatarText, { color: colors.primaryForeground }]}
              >
                {jiraUser.name?.charAt(0) || "U"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {jiraUser.name}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {jiraUser.email}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Connection Status */}
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Connections
        </Text>
        <View style={styles.statusRow}>
          <Ionicons
            name="git-branch-outline"
            size={20}
            color={isJiraAuthenticated ? colors.success : colors.textMuted}
          />
          <Text style={[styles.statusLabel, { color: colors.text }]}>Jira</Text>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isJiraAuthenticated
                  ? colors.success
                  : colors.textMuted,
              },
            ]}
          />
          <Text
            style={{
              color: isJiraAuthenticated ? colors.success : colors.textMuted,
              fontSize: 12,
            }}
          >
            {isJiraAuthenticated ? "Connected" : "Not connected"}
          </Text>
        </View>
        <View style={[styles.statusRow, { marginTop: 12 }]}>
          <Ionicons
            name="send-outline"
            size={20}
            color={isPostmanAuthenticated ? colors.success : colors.textMuted}
          />
          <Text style={[styles.statusLabel, { color: colors.text }]}>
            Postman
          </Text>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: isPostmanAuthenticated
                  ? colors.success
                  : colors.textMuted,
              },
            ]}
          />
          <Text
            style={{
              color: isPostmanAuthenticated ? colors.success : colors.textMuted,
              fontSize: 12,
            }}
          >
            {isPostmanAuthenticated ? "Connected" : "Not connected"}
          </Text>
        </View>
      </Card>

      {/* Theme */}
      <Card>
        <View style={styles.themeRow}>
          <View style={styles.themeLeft}>
            <Ionicons
              name={isDark ? "moon-outline" : "sunny-outline"}
              size={22}
              color={colors.primary}
            />
            <View>
              <Text style={[styles.themeLabel, { color: colors.text }]}>
                Appearance
              </Text>
              <Text style={[styles.themeDesc, { color: colors.textSecondary }]}>
                {isDark ? "Dark mode" : "Light mode"}
              </Text>
            </View>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.primaryForeground}
          />
        </View>
      </Card>

      {/* Logout */}
      <TouchableOpacity
        style={[
          styles.logoutBtn,
          {
            backgroundColor: colors.destructive + "15",
            borderColor: colors.destructive + "30",
          },
        ]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>
          Log out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 4 },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 18, fontWeight: "700" },
  userName: { fontSize: 16, fontWeight: "600" },
  userEmail: { fontSize: 13, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusLabel: { flex: 1, fontSize: 14 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  themeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  themeLabel: { fontSize: 15, fontWeight: "500" },
  themeDesc: { fontSize: 12, marginTop: 2 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  logoutText: { fontSize: 15, fontWeight: "600" },
});
