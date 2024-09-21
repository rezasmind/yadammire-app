import React, { useEffect, useState } from "react";
import { SafeAreaView, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";

const Index = () => {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userSession = await AsyncStorage.getItem("userSession");
        if (userSession) {
          setUserData(JSON.parse(userSession));
          router.replace("/Home");
        } else {
          router.replace("/welcome");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        router.replace("/welcome");
      }
    };

    checkSession();
  }, []);

  if (!userData) {
    return null; // or a loading spinner
  }

  return (
    <Stack>
      <Stack.Screen name="HomePage" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Index;
