import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Share } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { LoadingView, EmptyView } from "../../components/ui/StateViews";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import {
  PostmanCollectionDetail,
  PostmanCollectionItem,
} from "../../types/jira";
import Toast from "react-native-toast-message";
import * as Clipboard from "expo-clipboard";

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<
    { CollectionDetail: { collectionId: string } },
    "CollectionDetail"
  >;
};

const CollectionDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { collectionId } = route.params;
  const { colors } = useTheme();
  const [collection, setCollection] = useState<PostmanCollectionDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getPostmanCollection(collectionId);
        if (res.collection) setCollection(res.collection);
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to load collection" });
      } finally {
        setLoading(false);
      }
    })();
  }, [collectionId]);

  const copyJson = async () => {
    if (!collection) return;
    try {
      await Clipboard.setStringAsync(JSON.stringify(collection, null, 2));
      Toast.show({ type: "success", text1: "Collection JSON copied" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to copy" });
    }
  };

  const shareJson = async () => {
    if (!collection) return;
    try {
      await Share.share({
        message: JSON.stringify(collection, null, 2),
        title: collection.name || "Collection",
      });
    } catch {
      Toast.show({ type: "error", text1: "Failed to share" });
    }
  };

  const extractItemNames = (col: PostmanCollectionDetail): string[] => {
    const out: string[] = [];
    const walk = (items: PostmanCollectionItem[] | undefined) => {
      if (!items || !Array.isArray(items)) return;
      for (const it of items) {
        if (it?.name) out.push(it.name);
        if (it?.item || it?.items) walk(it.item || it.items);
      }
    };
    walk(col.item || col.items);
    return out;
  };

  if (loading) return <LoadingView message="Loading collection..." />;

  if (!collection) {
    return (
      <EmptyView
        icon="document-text-outline"
        title="No Collection"
        message="Could not load collection data."
        actionLabel="Go Back"
        onAction={() => navigation.goBack()}
      />
    );
  }

  const items = extractItemNames(collection);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {collection.name || "Collection"}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {items.length} endpoint{items.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <View style={styles.actions}>
          <Button title="Copy" onPress={copyJson} variant="outline" size="sm" />
          <Button
            title="Share"
            onPress={shareJson}
            variant="orange"
            size="sm"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {items.length > 0 ? (
          items.map((name, idx) => (
            <View
              key={idx}
              style={[
                styles.itemCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="code-slash-outline"
                size={16}
                color={colors.orange}
              />
              <Text
                style={[styles.itemName, { color: colors.text }]}
                numberOfLines={2}
              >
                {name}
              </Text>
            </View>
          ))
        ) : (
          <View style={[styles.jsonBox, { backgroundColor: colors.muted }]}>
            <ScrollView horizontal>
              <Text style={[styles.jsonText, { color: colors.text }]}>
                {JSON.stringify(collection, null, 2)}
              </Text>
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default CollectionDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: "row", gap: 8 },
  content: { padding: 16 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  itemName: { fontSize: 14, fontWeight: "500", flex: 1 },
  jsonBox: {
    padding: 16,
    borderRadius: 10,
  },
  jsonText: {
    fontFamily: "monospace",
    fontSize: 11,
    lineHeight: 16,
  },
});
