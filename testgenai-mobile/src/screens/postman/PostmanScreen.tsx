import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { useAuthStore } from "../../store/authStore";
import { api } from "../../services/api";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { TextInput } from "../../components/ui/TextInput";
import { LoadingView, EmptyView } from "../../components/ui/StateViews";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { PostmanCollection } from "../../types/jira";
import Toast from "react-native-toast-message";

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const PostmanScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { isPostmanAuthenticated, loginPostman, postmanApiKey } =
    useAuthStore();
  const [collections, setCollections] = useState<PostmanCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await api.getPostmanCollections();
      if (res.error) {
        Toast.show({ type: "error", text1: res.error });
        return;
      }
      setCollections(res.collections || []);
    } catch (err) {
      console.error("fetchCollections", err);
    }
  }, []);

  useEffect(() => {
    if (isPostmanAuthenticated) {
      setLoading(true);
      fetchCollections().finally(() => setLoading(false));
    }
  }, [isPostmanAuthenticated, fetchCollections]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCollections();
    setRefreshing(false);
  };

  const handleApiKeyLogin = async () => {
    const key = apiKeyInput.trim();
    if (!key) {
      Toast.show({ type: "error", text1: "API key is required" });
      return;
    }

    setLoginLoading(true);
    try {
      const resp = await api.postmanLoginWithApiKey(key);
      if (resp.success) {
        await loginPostman(key);
        Toast.show({ type: "success", text1: "Connected to Postman" });
        setApiKeyInput("");
        await fetchCollections();
      } else {
        Toast.show({ type: "error", text1: resp.error || "Failed to connect" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to connect to Postman" });
    } finally {
      setLoginLoading(false);
    }
  };

  // Show login form if not authenticated
  if (!isPostmanAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loginContainer}>
          <View
            style={[styles.iconBg, { backgroundColor: colors.orangeLight }]}
          >
            <Ionicons name="log-in-outline" size={32} color={colors.orange} />
          </View>
          <Text style={[styles.loginTitle, { color: colors.text }]}>
            Login to Postman
          </Text>
          <Text style={[styles.loginSubtitle, { color: colors.textSecondary }]}>
            Enter your Postman API Key to access collections
          </Text>

          <View style={styles.loginForm}>
            <TextInput
              label="Postman API Key"
              placeholder="PMAK-xxxxxxxxxxxxxxxx"
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              autoCapitalize="none"
              editable={!loginLoading}
            />
            <Button
              title={loginLoading ? "Connecting..." : "Use API Key"}
              onPress={handleApiKeyLogin}
              loading={loginLoading}
              variant="orange"
              icon={
                !loginLoading ? (
                  <Ionicons
                    name="key-outline"
                    size={16}
                    color={colors.primaryForeground}
                  />
                ) : undefined
              }
            />
          </View>
        </View>
      </View>
    );
  }

  if (loading) return <LoadingView message="Loading collections..." />;

  const renderCollection = ({ item }: { item: PostmanCollection }) => (
    <Card
      onPress={() =>
        navigation.navigate("CollectionDetail", { collectionId: item.id })
      }
    >
      <View style={styles.collectionRow}>
        <View
          style={[
            styles.collectionIcon,
            { backgroundColor: colors.orangeLight },
          ]}
        >
          <Ionicons name="send-outline" size={20} color={colors.orange} />
        </View>
        <View style={styles.collectionInfo}>
          <Text style={[styles.collectionName, { color: colors.text }]}>
            {item.name}
          </Text>
          {item.createdAt && (
            <Text style={[styles.collectionDate, { color: colors.textMuted }]}>
              {item.createdAt}
            </Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            Postman Integration
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {collections.length} collection{collections.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={renderCollection}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.orange}
          />
        }
        ListEmptyComponent={
          <EmptyView
            icon="send-outline"
            title="No Collections"
            message="No Postman collections found. Create one after generating test cases."
          />
        }
      />
    </View>
  );
};

export default PostmanScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 4 },
  list: { padding: 16, paddingTop: 8 },
  collectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  collectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  collectionInfo: { flex: 1 },
  collectionName: { fontSize: 14, fontWeight: "600" },
  collectionDate: { fontSize: 11, marginTop: 2 },
  // Login
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loginTitle: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  loginSubtitle: { fontSize: 14, textAlign: "center", marginBottom: 28 },
  loginForm: { width: "100%" },
});
