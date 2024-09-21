import { View, Text, Button, TouchableOpacity } from "react-native";
import React from "react";
import Swiper from "react-native-swiper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {StatusBar} from "expo-status-bar"

const welcome = () => {
  const router = useRouter()
  return (
    <SafeAreaView className="flex justify-center items-center w-full h-full bg-zinc-900">
        <StatusBar style="light" />
      <View className="flex justify-center items-center">
        <Text className="text-lg font-PeydaBlack top-5 text-white">
          آشنایی با یادم میره 🤦‍♂️
        </Text>
      </View>
      <Swiper showsPagination={true}
       activeDotColor="#23F0C7" loop={false} dotColor="white">
        <View className="flex flex-col justify-center items-center w-full h-full py-10 gap-y-24 ">
          <View>
            <Text className="text-[200px]">💡</Text>
          </View>
          <View className="flex flex-col justify-center items-center gap-4">
            <Text className="text-lg font-PeydaBlack text-white">
              دیگه هیچوقت چیزی یادت نمیره
            </Text>
            <Text className="text-md font-PeydaRegular text-center text-gray-300 max-w-[80vw] ">
              شما میتونید تو اپ یادم میره تسک ها و برنامه هایی که باید انجام
              بدید اضافه کنید تا ما به انتخاب خودتون از طریق نوتیفیکیشن، اس ام
              اس و تماس بهتون یادآوری کنیم 😉{" "}
            </Text>
          </View>
        </View>

        <View className="flex flex-col justify-center items-center w-full h-full py-10 gap-y-24 ">
          <View>
            <Text className="text-[200px]">✨</Text>
          </View>
          <View className="flex flex-col justify-center items-center gap-4">
            <Text className="text-lg font-PeydaBlack text-white">
              یادبگیر چطوری کنترلش کنی
            </Text>
            <Text className="text-md font-PeydaRegular text-center text-gray-300 max-w-[80vw] ">
              ما تو یادم میره یه بخشی داریم که با استفاده از روانشناس هایی که متخصص این حوزه هستیم سعی کردیم مشکلات مربوط به این حوزه رو براتون حل کنیم حتما چکش کنید
            </Text>
          </View>
        </View>

        <View className="flex flex-col justify-center items-center w-full h-full py-10 gap-y-24 ">
          <View>
            <Text className="text-[200px]">🧰</Text>
          </View>
          <View className="flex flex-col justify-center items-center gap-4">
            <Text className="text-lg font-PeydaBlack text-white">
              هرچیزی که بهت کمک میکنه اینجاست
            </Text>
            <Text className="text-md font-PeydaRegular text-center text-gray-300 max-w-[80vw] ">
              هر ابزاری برای کمک کردن به افرادی که دچار ADHD هستن رو اینجا جمع کردیم. از تایمر پومودورو بگیر تا وایت نویز برای تمرکز
            </Text>
          </View>
        </View>

        
      </Swiper>
      <TouchableOpacity className="bg-primary px-8 py-2 flex justify-center items-center rounded-md w-11/12" onPress={() => {
        router.push("/sign-in")
      }}>
        <Text className="text-lg font-PeydaSemiBold">شروع کنید</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default welcome;
