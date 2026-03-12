import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../../context/ThemeContext";
import { useAdminStore } from "../../store/adminStore";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { LoadingView, ErrorView } from "../../components/ui/StateViews";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { stats, setStats } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [setStats]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchStats();
    }, [fetchStats]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const statCardStyle = (borderColor: string): ViewStyle => ({
    ...styles.statCard,
    borderLeftColor: borderColor,
    borderLeftWidth: 3,
  });

  if (loading && !stats) return <LoadingView message="Loading dashboard..." />;
  if (error && !stats) return <ErrorView message={error} onRetry={fetchStats} />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Admin Dashboard
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Overview & Management
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card
          style={statCardStyle(colors.primary)}
          onPress={() => navigation.navigate("UserManagement")}
        >
          <View style={styles.statRow}>
            <View
              style={[styles.statIcon, { backgroundColor: colors.primary + "15" }]}
            >
              <Ionicons name="people-outline" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {stats?.totalUsers ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Users
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>

        <Card style={statCardStyle(colors.success)}>
          <View style={styles.statRow}>
            <View
              style={[styles.statIcon, { backgroundColor: colors.success + "15" }]}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={colors.success}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {stats?.activeUsers ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Active Users
              </Text>
            </View>
          </View>
        </Card>

        <Card style={statCardStyle(colors.destructive)}>
          <View style={styles.statRow}>
            <View
              style={[
                styles.statIcon,
                { backgroundColor: colors.destructive + "15" },
              ]}
            >
              <Ionicons
                name="trash-outline"
                size={22}
                color={colors.destructive}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {stats?.deletedUsers ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Deleted Users
              </Text>
            </View>
          </View>
        </Card>

        <Card
          style={statCardStyle(colors.orange)}
          onPress={() => navigation.navigate("AdminTestCases", {})}
        >
          <View style={styles.statRow}>
            <View
              style={[styles.statIcon, { backgroundColor: colors.orange + "15" }]}
            >
              <Ionicons
                name="document-text-outline"
                size={22}
                color={colors.orange}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {stats?.totalTestCases ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Test Cases
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </View>
        </Card>
      </View>

      {/* Test Cases by Project */}
      {stats?.projectTestCases && stats.projectTestCases.length > 0 && (
        <Card>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Test Cases by Project
          </Text>
          {stats.projectTestCases.map((p, i) => (
            <TouchableOpacity
              key={p.projectKey}
              style={[
                styles.projectRow,
                i < stats.projectTestCases.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
              onPress={() =>
                navigation.navigate("AdminTestCases", { projectKey: p.projectKey })
              }
              activeOpacity={0.7}
            >
              <View style={[styles.projectBadge, { backgroundColor: colors.orange + "15" }]}>
                <Text style={[styles.projectBadgeText, { color: colors.orange }]}>
                  {p.projectKey}
                </Text>
              </View>
              <Text
                style={[styles.projectName, { color: colors.text }]}
                numberOfLines={1}
              >
                {p.projectName}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: colors.primary + "15" }]}>
                <Text style={[styles.countText, { color: colors.primary }]}>
                  {p.count}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Quick Actions
        </Text>
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate("UserManagement")}
          activeOpacity={0.7}
        >
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>
            Manage Users
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => navigation.navigate("AdminTestCases", {})}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={20} color={colors.orange} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>
            View All Test Cases
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      </Card>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

export default AdminDashboardScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 4 },
  statsGrid: { paddingHorizontal: 0 },
  statCard: { marginHorizontal: 16 },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statNumber: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "600", marginBottom: 12 },
  projectRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 10,
  },
  projectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  projectBadgeText: { fontSize: 11, fontWeight: "700" },
  projectName: { flex: 1, fontSize: 14, fontWeight: "500" },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 28,
    alignItems: "center",
  },
  countText: { fontSize: 12, fontWeight: "700" },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  actionLabel: { flex: 1, fontSize: 14, fontWeight: "500" },
  divider: { height: 1, marginVertical: 2 },
});
