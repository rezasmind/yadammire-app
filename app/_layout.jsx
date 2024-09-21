import React, { useEffect, useState } from 'react';
import { Slot, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const RootLayout = () => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    'PeydaRegular': require('../assets/fonts/PeydaWeb-Regular.ttf'),
    'PeydaBlack': require('../assets/fonts/PeydaWeb-Black.ttf'),
    'PeydaSemiBold': require('../assets/fonts/PeydaWeb-SemiBold.ttf'),
    // Add more fonts as needed
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const userSession = await AsyncStorage.getItem('userSession');
        if (!userSession) {
          router.replace('/sign-in');
        }
      } catch (error) {
        console.error('Error checking session:', error);
        router.replace('/sign-in');
      } finally {
        setIsReady(true);
      }
    };

    checkSession();
  }, []);

  if (!isReady || !fontsLoaded) {
    return null; // or a loading spinner
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
};

export default RootLayout;