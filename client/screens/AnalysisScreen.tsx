import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Platform,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

import placeholderImage from "../../assets/images/placeholder-photo.png";

interface AnalysisResult {
  roastLevel: string;
  temperature: string;
  temperatureRange: string;
  notes: string;
}

interface ImageData {
  uri: string;
  base64: string;
}

/**
 * Screen for capturing or selecting a photo and obtaining a coffee roast analysis.
 *
 * Renders UI for taking a photo or choosing one from the gallery, requests camera permissions when needed, uploads the selected image to the analysis API, and navigates to the "Results" screen with `imageUri`, `imageBase64`, and the analysis `result` on success.
 *
 * @param navigation - Navigation prop used to navigate to other screens (navigates to "Results" with `{ imageUri, imageBase64, result }` on successful analysis)
 * @returns A React element rendering the analysis screen UI
 */
export default function AnalysisScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = React.useRef<CameraView>(null);

  const analysisMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL("/api/analyze", baseUrl).href, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Analysis failed");
      }

      return response.json() as Promise<AnalysisResult>;
    },
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("Results", {
        imageUri: imageData?.uri,
        imageBase64: imageData?.base64,
        result: data,
      });
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

  const handleTakePhoto = async () => {
    if (!cameraPermission?.granted) {
      if (cameraPermission?.status === "denied" && !cameraPermission?.canAskAgain) {
        if (Platform.OS !== "web") {
          try {
            await Linking.openSettings();
          } catch (error) {
          }
        }
        return;
      }
      const result = await requestCameraPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      if (photo && photo.base64) {
        setImageData({
          uri: photo.uri,
          base64: photo.base64,
        });
        setShowCamera(false);
      }
    }
  };

  const handlePickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0] && result.assets[0].base64) {
      setImageData({
        uri: result.assets[0].uri,
        base64: result.assets[0].base64,
      });
    }
  };

  const handleAnalyze = () => {
    if (imageData?.base64) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      analysisMutation.mutate(imageData.base64);
    }
  };

  const handleClearImage = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setImageData(null);
  };

  if (showCamera) {
    return (
      <View style={[styles.cameraContainer, { backgroundColor: "#000" }]}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={[styles.cameraOverlay, { paddingTop: insets.top + Spacing.xl }]}>
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Feather name="x" size={28} color="#fff" />
            </Pressable>
          </View>
          <View style={[styles.cameraBottom, { paddingBottom: insets.bottom + Spacing["3xl"] }]}>
            <Pressable
              style={[styles.captureButton, { borderColor: theme.primary }]}
              onPress={handleCapture}
            >
              <View style={[styles.captureButtonInner, { backgroundColor: theme.primary }]} />
            </Pressable>
          </View>
        </CameraView>
      </View>
    );
  }

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
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          {imageData ? (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: imageData.uri }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <Pressable
                style={[styles.clearButton, { backgroundColor: theme.error }]}
                onPress={handleClearImage}
              >
                <Feather name="x" size={18} color="#fff" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.placeholderContainer}>
              <Image
                source={placeholderImage}
                style={styles.placeholderImage}
                resizeMode="contain"
              />
              <ThemedText
                style={[styles.placeholderText, { color: theme.textSecondary }]}
              >
                Capture or select a photo to begin
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.primary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={handleTakePhoto}
          >
            <Feather name="camera" size={22} color="#fff" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.secondary,
                opacity: pressed ? 0.9 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            onPress={handlePickImage}
          >
            <Feather name="image" size={22} color="#fff" style={styles.buttonIcon} />
            <ThemedText style={styles.buttonText}>Choose from Gallery</ThemedText>
          </Pressable>

          {imageData ? (
            <Pressable
              style={({ pressed }) => [
                styles.analyzeButton,
                {
                  backgroundColor: theme.success,
                  opacity: pressed || analysisMutation.isPending ? 0.9 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={handleAnalyze}
              disabled={analysisMutation.isPending}
            >
              {analysisMutation.isPending ? (
                <ActivityIndicator color="#fff" style={styles.buttonIcon} />
              ) : (
                <Feather name="zap" size={22} color="#fff" style={styles.buttonIcon} />
              )}
              <ThemedText style={styles.buttonText}>
                {analysisMutation.isPending ? "Analyzing..." : "Analyze Roast Level"}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        {analysisMutation.isError ? (
          <Card
            style={[styles.errorCard, { backgroundColor: isDark ? "#3D2020" : "#FFF0EE" }]}
          >
            <View style={styles.errorContent}>
              <Feather name="alert-circle" size={20} color={theme.error} />
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {analysisMutation.error?.message || "Analysis failed. Please try again."}
              </ThemedText>
            </View>
          </Card>
        ) : null}

        <Card
          style={[styles.infoCard, { backgroundColor: theme.backgroundSecondary }]}
        >
          <View style={styles.infoHeader}>
            <Feather name="info" size={18} color={theme.primary} />
            <ThemedText type="h4" style={[styles.infoTitle, { color: theme.text }]}>
              About Roast Levels
            </ThemedText>
          </View>
          <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
            Your coffee's roast level determines the ideal water temperature for Aeropress brewing. Lighter roasts need hotter water (92-96°C) to extract flavors, while darker roasts brew best at lower temperatures (80-85°C).
          </ThemedText>
          <View style={styles.roastLevels}>
            <View style={styles.roastLevel}>
              <View style={[styles.roastDot, { backgroundColor: "#C4A77D" }]} />
              <ThemedText style={[styles.roastLabel, { color: theme.textSecondary }]}>Light</ThemedText>
            </View>
            <View style={styles.roastLevel}>
              <View style={[styles.roastDot, { backgroundColor: "#8B6914" }]} />
              <ThemedText style={[styles.roastLabel, { color: theme.textSecondary }]}>Medium</ThemedText>
            </View>
            <View style={styles.roastLevel}>
              <View style={[styles.roastDot, { backgroundColor: "#3D2314" }]} />
              <ThemedText style={[styles.roastLabel, { color: theme.textSecondary }]}>Dark</ThemedText>
            </View>
          </View>
        </Card>
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
    height: 280,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  imageWrapper: {
    width: "100%",
    height: "100%",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  clearButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    alignItems: "center",
    padding: Spacing.xl,
  },
  placeholderImage: {
    width: 180,
    height: 135,
    marginBottom: Spacing.lg,
  },
  placeholderText: {
    fontSize: 15,
    textAlign: "center",
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.xl,
  },
  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: Spacing.buttonHeight + 4,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.sm,
  },
  buttonIcon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  errorCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  errorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
  },
  infoCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  infoTitle: {
    fontSize: 17,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: Spacing.lg,
  },
  roastLevels: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  roastLevel: {
    alignItems: "center",
    gap: Spacing.xs,
  },
  roastDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  roastLabel: {
    fontSize: 12,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
});