import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-router";
import BottomMenu from "../../components/bottomMenu";

const MainLayout = () => {
  return (
    <View className="flex h-screen w-full">
      <BottomMenu />
    </View>
  );
};

export default MainLayout;
