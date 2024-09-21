import { View, Text, SafeAreaView } from 'react-native'
import React from 'react'

const Tools = () => {
  return (
    <View className="w-screen h-screen bg-zinc-900">
      <SafeAreaView className="w-full h-full flex justify-center items-center">
        <Text className="font-PeydaBlack text-lg text-white">
            این صفحه به زودی اضافه خواهد شد
            
        </Text>
        <Text className="font-PeydaRegular text-white text-md">
            ممنون از صبر و حمایتتون 😉
        </Text>
      </SafeAreaView>
    </View>
  )
}

export default Tools