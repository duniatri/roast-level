import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import ResultsScreen from "@/screens/ResultsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

interface AnalysisResult {
  roastLevel: string;
  temperature: string;
  temperatureRange: string;
  notes: string;
}

export type RootStackParamList = {
  Main: undefined;
  Results: {
    imageUri: string;
    result: AnalysisResult;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Results"
        component={ResultsScreen}
        options={{
          presentation: "modal",
          headerTitle: "Analysis Results",
        }}
      />
    </Stack.Navigator>
  );
}
