import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface HistoryItem {
  id: string;
  imageBase64: string;
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

export default function ResultsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const { imageUri, imageBase64, result } = route.params;

  const roastColor = getRoastColor(result.roastLevel);

  const handleSaveToHistory = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const existing = await AsyncStorage.getItem(HISTORY_KEY);
      const history: HistoryItem[] = existing ? JSON.parse(existing) : [];
      
      const newItem: HistoryItem = {
        id: Date.now().toString(),
        imageBase64,
        roastLevel: result.roastLevel,
        temperature: result.temperature,
        temperatureRange: result.temperatureRange,
        notes: result.notes,
        date: new Date().toISOString(),
      };
      
      history.unshift(newItem);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50)));
      
      navigation.goBack();
    } catch (error) {
      console.error("Failed to save to history:", error);
    }
  };

  const handleAnalyzeAnother = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing["3xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.imageContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        <View style={styles.resultHeader}>
          <View
            style={[
              styles.roastBadge,
              { backgroundColor: roastColor },
            ]}
          >
            <ThemedText style={styles.roastBadgeText}>
              {result.roastLevel}
            </ThemedText>
          </View>
        </View>

        <Card
          style={[
            styles.temperatureCard,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.temperatureHeader}>
            <Feather name="thermometer" size={24} color={theme.primary} />
            <ThemedText style={[styles.temperatureLabel, { color: theme.textSecondary }]}>
              Recommended Water Temperature
            </ThemedText>
          </View>
          <ThemedText style={[styles.temperatureValue, { color: theme.text }]}>
            {result.temperatureRange}
          </ThemedText>
          <ThemedText style={[styles.temperatureNote, { color: theme.textSecondary }]}>
            Optimal for {result.roastLevel.toLowerCase()} roast Aeropress brewing
          </ThemedText>
        </Card>

        <Card
          style={[
            styles.notesCard,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.notesHeader}>
            <Feather name="file-text" size={18} color={theme.primary} />
            <ThemedText type="h4" style={[styles.notesTitle, { color: theme.text }]}>
              Brewing Notes
            </ThemedText>
          </View>
          <ThemedText style={[styles.notesText, { color: theme.textSecondary }]}>
            {result.notes}
          </ThemedText>
        </Card>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={handleSaveToHistory}
          >
            <Feather name="bookmark" size={20} color="#fff" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>Save to History</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryButton,
              {
                backgroundColor: theme.backgroundSecondary,
                borderColor: theme.border,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={handleAnalyzeAnother}
          >
            <Feather name="camera" size={20} color={theme.primary} style={styles.buttonIcon} />
            <ThemedText style={[styles.secondaryButtonText, { color: theme.primary }]}>
              Analyze Another
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  imageContainer: {
    height: 200,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  resultHeader: {
    alignItems: "center",
  },
  roastBadge: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  roastBadgeText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  temperatureCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  temperatureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  temperatureLabel: {
    fontSize: 14,
  },
  temperatureValue: {
    fontSize: 48,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  temperatureNote: {
    fontSize: 13,
    textAlign: "center",
  },
  notesCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  notesTitle: {
    fontSize: 17,
  },
  notesText: {
    fontSize: 15,
    lineHeight: 23,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.xl,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.xl,
    borderWidth: 1.5,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
