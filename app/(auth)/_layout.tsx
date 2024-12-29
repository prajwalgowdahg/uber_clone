import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
  } from "@react-navigation/native";
  import { useFonts } from "expo-font";
  import { Stack } from "expo-router";
  import * as SplashScreen from "expo-splash-screen";
  import { StatusBar } from "expo-status-bar";
  import { useEffect } from "react";
  import "react-native-reanimated";
  
  import { View, Text } from "react-native";
  
  // Prevent the splash screen from auto-hiding before asset loading is complete.
  
  export default function RootLayout() {
   
   
    return (
      <>
        <Stack>
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="signin" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </>
    );
  }
  