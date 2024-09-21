import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Modal,
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

// Initialize Supabase client
const supabase = createClient(
  "https://zrvcptwbjgqleutuzexc.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpydmNwdHdiamdxbGV1dHV6ZXhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxODI3MDEsImV4cCI6MjAzMzc1ODcwMX0.NMqQMZt0wZkVeVk8zuxpn7NxNaDcLiRLf_7NtvgGgow"
);

const SkeletonPlaceholder = ({ width, height, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { opacity, width, height, backgroundColor: "#a0a0a0", borderRadius: 4 },
        style,
      ]}
    />
  );
};

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const userSession = await AsyncStorage.getItem("userSession");
    const parsedUserSession = JSON.parse(userSession);
    console.log(parsedUserSession.userId, "test");
    try {
      if (!parsedUserSession || !parsedUserSession.userId) {
        console.error("User session or userId is missing");
        return;
      }

      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("id", parsedUserSession.userId)
        .single();

      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }

      if (data) {
        setUserData(data);
        console.log("User data:", data);
        setIsLoading(true);
      } else {
        console.log("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await AsyncStorage.removeItem("userSession");
      router.replace("/welcome");
    } catch (error) {
      console.error("خطا در خروج از حساب کاربری:", error);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setDatePickerVisible(false);
    // Here you can add logic to update the user's date in Supabase
  };

  return (
    <View className="bg-zinc-900 h-screen w-full">
      <SafeAreaView className="flex-1">
        <View className="p-6 flex justify-start items-center w-full h-full">
          <View className="flex-row items-center mb-8 w-full justify-end">
            <View>
              {isLoading ? (
                <SkeletonPlaceholder
                  width={120}
                  height={24}
                  style={{ marginBottom: 4 }}
                />
              ) : (
                <Text className="text-white text-2xl font-bold font-PeydaSemiBold text-right">
                  {"کاربر شماره " + userData?.id}
                </Text>
              )}
              <Text className="text-gray-400 text-sm font-PeydaRegular text-right">
                ویرایش پروفایل
              </Text>
            </View>
            {isLoading ? (
              <SkeletonPlaceholder
                width={96}
                height={96}
                style={{ borderRadius: 48, marginLeft: 16 }}
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-gray-300 ml-4" />
            )}
          </View>
          <View className="mb-6 w-full">
            <Text className="text-gray-400 mb-1 font-PeydaRegular text-right">
              شماره تلفن
            </Text>
            {isLoading ? (
              <SkeletonPlaceholder width={120} height={20} />
            ) : (
              <Text className="text-white text-lg font-PeydaSemiBold text-right">
                {"0" + userData?.phone || "۰۹۱۲۳۴۵۶۷۸۹"}
              </Text>
            )}
          </View>
          <View className="mb-6 w-full">
            <Text className="text-gray-400 mb-1 font-PeydaRegular text-right">
              وضعیت اشتراک
            </Text>
            {isLoading ? (
              <SkeletonPlaceholder width={150} height={20} />
            ) : (
              <Text
                className={`${
                  userData?.subscription ? "text-green-500" : "text-red-500"
                } text-lg font-PeydaSemiBold text-right`}
              >
                {userData?.subscription
                  ? userData?.subscription_end_date
                  : "اشتراک رایگان"}
              </Text>
            )}
          </View>
          {!isLoading && !userData?.subscription && (
            <TouchableOpacity
              className="bg-blue-500 py-3 px-6 w-full rounded-lg mb-4"
              onPress={() => {
                // Handle subscription purchase
              }}
            >
              <Text className="text-white text-center text-lg font-PeydaSemiBold">
                خرید اشتراک
              </Text>
            </TouchableOpacity>
          )}

          {isLoading ? (
            <SkeletonPlaceholder
              width="100%"
              height={48}
              style={{ marginBottom: 16 }}
            />
          ) : (
            <TouchableOpacity
              className="bg-red-500 py-3 px-6 w-full rounded-lg"
              onPress={handleSignOut}
            >
              <Text className="text-white text-center text-lg font-PeydaSemiBold">
                خروج از حساب کاربری
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Profile;
