import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AnalysisScreen from "@/screens/AnalysisScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type AnalysisStackParamList = {
  Analysis: undefined;
};

const Stack = createNativeStackNavigator<AnalysisStackParamList>();

export default function AnalysisStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Roast Analyzer" />,
        }}
      />
    </Stack.Navigator>
  );
}
