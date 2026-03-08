import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { TabParamList } from "./types";

import ProjectsScreen from "../screens/dashboard/ProjectsScreen";
import PostmanScreen from "../screens/postman/PostmanScreen";
import SettingsScreen from "../screens/dashboard/SettingsScreen";

const Tab = createBottomTabNavigator<TabParamList>();

/**
 * Bottom Tab Navigator — replaces the web sidebar.
 * Maps to the web DashboardLayout's nav items:
 *   - Projects → ProjectsTab
 *   - Postman  → PostmanTab
 *   - Settings → SettingsTab
 */
const DashboardTabs: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
          height: 56,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsScreen}
        options={{
          tabBarLabel: "Projects",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PostmanTab"
        component={PostmanScreen}
        options={{
          tabBarLabel: "Postman",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="send-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DashboardTabs;
