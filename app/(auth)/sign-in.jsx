import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const SignIn = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const sendCode = async () => {
    if (!phone) {
      Alert.alert("خطا", "لطفا شماره تلفن خود را وارد کنید");
      return;
    }

    setLoading(true);
    console.log("Sending OTP to:", phone);

    try {
      const response = await fetch(
        `https://yadammire.ir/api/auth/send-otp/?phoneNumber=${encodeURIComponent(
          phone
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Response status:", response.status);
      console.log("Response data:", data);

      Alert.alert("موفق", "کد تایید با موفقیت ارسال شد");
      setOtpSent(true);
    } catch (error) {
      console.error("Error sending OTP:", error);
      let errorMessage =
        "مشکلی در ارسال کد تایید پیش آمد. لطفا دوباره تلاش کنید";
      Alert.alert("خطا", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      Alert.alert("خطا", "لطفا کد تایید را وارد کنید");
      return;
    }

    setLoading(true);
    console.log("Verifying OTP:", otp);

    try {
      const response = await fetch(
        `https://yadammire.ir/api/auth/verify-otp/?phoneNumber=${encodeURIComponent(
          phone
        )}&otp=${encodeURIComponent(otp)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log("Response status:", response.status);
      console.log("Response data:", data);

      // Save user session
      await AsyncStorage.setItem("userSession", JSON.stringify(data));

      Alert.alert("موفق", "ورود با موفقیت انجام شد");
      router.replace("/"); // Navigate to the home page
    } catch (error) {
      console.error("Error verifying OTP:", error);
      let errorMessage = "مشکلی در تایید کد پیش آمد. لطفا دوباره تلاش کنید";
      Alert.alert("خطا", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderPhoneInput = () => (
    <View className="flex justify-center items-center h-[100vh] gap-4 bg-zinc-900">
      <Text className="text-[80px]">🤦‍♂️</Text>
      <View className="flex flex-col justify-center items-center">
        <Text className="text-2xl font-PeydaBlack text-white">
          {" "}
          👋 خوش اومدید{" "}
        </Text>
        <Text className="text-md font-PeydaRegular text-white">
          برای ورود شماره خودتون رو وارد کنید
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="w-full flex flex-col justify-center items-center"
      >
        <TextInput
          placeholder="شماره تلفن"
          className="border text-white border-gray-300 rounded-md p-2 w-2/4 font-PeydaRegular bg-zinc-800"
          value={phone}
          onChangeText={(text) => setPhone(text)}
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
        />

        <TouchableOpacity
          className={`bg-primary px-8 py-2 flex justify-center items-center rounded-md w-1/2 mt-4 ${
            loading ? "opacity-50" : ""
          }`}
          onPress={sendCode}
          disabled={loading}
        >
          <Text className="text-md font-PeydaRegular text-black">
            {loading ? "در حال ارسال..." : "ارسال کد"}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );

  const renderOtpInput = () => (
    <View className="flex justify-center items-center h-[100vh] gap-4">
      <Text className="text-[80px]">🔐</Text>
      <View className="flex flex-col justify-center items-center">
        <Text className="text-2xl font-PeydaBlack text-white">کد تایید را وارد کنید</Text>
        <Text className="text-md font-PeydaRegular text-white">
          کد تایید به شماره {phone} ارسال شد
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="w-full flex flex-col justify-center items-center"
      >
        <TextInput
          placeholder="کد تایید"
          className="border text-white border-gray-300 rounded-md p-2 w-2/4 font-PeydaRegular"
          value={otp}
          onChangeText={(text) => setOtp(text)}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          className="bg-primary px-8 py-2 flex justify-center items-center rounded-md w-1/2 mt-4"
          onPress={verifyOtp}
        >
          <Text className="text-md font-PeydaRegular">تایید کد</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );

  return (
    <View style={{}} className="h-screen bg-zinc-900">
      {otpSent ? renderOtpInput() : renderPhoneInput()}
    </View>
  );
};

export default SignIn;
