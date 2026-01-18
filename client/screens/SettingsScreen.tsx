import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const SETTINGS_KEY = "@coffee_roast_settings";
const HISTORY_KEY = "@coffee_roast_history";

interface Settings {
  useFahrenheit: boolean;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [settings, setSettings] = useState<Settings>({
    useFahrenheit: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleToggleUnit = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    saveSettings({ ...settings, useFahrenheit: value });
  };

  const handleClearHistory = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (Platform.OS === "web") {
      if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
        clearHistory();
      }
    } else {
      Alert.alert(
        "Clear History",
        "Are you sure you want to clear all history? This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Clear",
            style: "destructive",
            onPress: clearHistory,
          },
        ]
      );
    }
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            PREFERENCES
          </ThemedText>
          <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="thermometer" size={18} color={theme.primary} />
                </View>
                <View>
                  <ThemedText style={[styles.settingLabel, { color: theme.text }]}>
                    Temperature Unit
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    {settings.useFahrenheit ? "Fahrenheit (°F)" : "Celsius (°C)"}
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings.useFahrenheit}
                onValueChange={handleToggleUnit}
                trackColor={{ false: theme.backgroundTertiary, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            DATA
          </ThemedText>
          <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handleClearHistory}
            >
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: "#FFF0EE" }]}>
                  <Feather name="trash-2" size={18} color="#C1440E" />
                </View>
                <View>
                  <ThemedText style={[styles.settingLabel, { color: "#C1440E" }]}>
                    Clear History
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: theme.textSecondary }]}>
                    Delete all saved analyses
                  </ThemedText>
                </View>
              </View>
              <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            </Pressable>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            ABOUT
          </ThemedText>
          <Card style={[styles.card, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.aboutContent}>
              <ThemedText style={[styles.aboutTitle, { color: theme.text }]}>
                Coffee Roast Analyzer
              </ThemedText>
              <ThemedText style={[styles.aboutVersion, { color: theme.textSecondary }]}>
                Version 1.0.0
              </ThemedText>
              <ThemedText style={[styles.aboutDescription, { color: theme.textSecondary }]}>
                Analyze your coffee beans to determine the optimal water temperature for Aeropress brewing. Powered by AI image analysis.
              </ThemedText>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: theme.textSecondary }]}>
            Made for coffee lovers
          </ThemedText>
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
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    padding: 0,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  aboutContent: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  aboutVersion: {
    fontSize: 13,
    marginBottom: Spacing.lg,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  footerText: {
    fontSize: 13,
  },
});
