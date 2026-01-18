import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

import emptyHistoryImage from "../../assets/images/empty-history.png";

interface HistoryItem {
  id: string;
  imageUri: string;
  roastLevel: string;
  temperature: string;
  temperatureRange: string;
  notes: string;
  date: string;
}

const HISTORY_KEY = "@coffee_roast_history";

const getRoastColor = (roastLevel: string): string => {
  const level = roastLevel.toLowerCase();
  if (level.includes("light") && !level.includes("medium")) {
    return "#C4A77D";
  } else if (level.includes("medium-light") || level.includes("medium light")) {
    return "#A68A4A";
  } else if (level.includes("medium-dark") || level.includes("medium dark")) {
    return "#5C3D1E";
  } else if (level.includes("medium")) {
    return "#8B6914";
  } else if (level.includes("dark")) {
    return "#3D2314";
  }
  return "#8B6914";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(HISTORY_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const handleDelete = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  const renderItem = ({ item }: { item: HistoryItem }) => {
    const roastColor = getRoastColor(item.roastLevel);

    return (
      <Pressable
        style={({ pressed }) => [
          styles.historyItem,
          {
            backgroundColor: theme.backgroundDefault,
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <Image
          source={{ uri: item.imageUri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <View
              style={[
                styles.roastBadge,
                { backgroundColor: roastColor },
              ]}
            >
              <ThemedText style={styles.roastBadgeText}>
                {item.roastLevel}
              </ThemedText>
            </View>
            <Pressable
              onPress={() => handleDelete(item.id)}
              hitSlop={8}
              style={styles.deleteButton}
            >
              <Feather name="trash-2" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.itemDetails}>
            <View style={styles.tempRow}>
              <Feather name="thermometer" size={14} color={theme.primary} />
              <ThemedText style={[styles.tempText, { color: theme.text }]}>
                {item.temperatureRange}
              </ThemedText>
            </View>
            <ThemedText style={[styles.dateText, { color: theme.textSecondary }]}>
              {formatDate(item.date)}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={emptyHistoryImage}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText type="h4" style={[styles.emptyTitle, { color: theme.text }]}>
        No analyses yet
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Start by capturing a photo of coffee beans to analyze their roast level.
      </ThemedText>
    </View>
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.loadingContainer, { paddingTop: headerHeight }]}>
          <ThemedText style={{ color: theme.textSecondary }}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
          history.length === 0 && styles.emptyListContent,
        ]}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  emptyListContent: {
    flex: 1,
    justifyContent: "center",
  },
  historyItem: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  thumbnail: {
    width: 90,
    height: 90,
  },
  itemContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  roastBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roastBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  itemDetails: {
    gap: Spacing.xs,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  tempText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dateText: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing["2xl"],
  },
  emptyImage: {
    width: 160,
    height: 160,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
