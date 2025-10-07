
import React from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";
import { useTheme } from "@react-navigation/native";
import QuizScreen from "../../quiz";

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "Math Quiz Challenge",
            headerStyle: { backgroundColor: theme.colors.background },
            headerTintColor: theme.colors.text,
          }}
        />
      )}
      <QuizScreen />
    </>
  );
}
