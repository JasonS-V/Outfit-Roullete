import { useFonts } from 'expo-font';

export function useAppFonts() {
  const [loaded, error] = useFonts({
    Inter_400Regular: require('../../assets/fonts/Cal_Sans,Inter/Inter/static/Inter_18pt-Regular.ttf'),
    Inter_500Medium: require('../../assets/fonts/Cal_Sans,Inter/Inter/static/Inter_18pt-Medium.ttf'),
    Inter_600SemiBold: require('../../assets/fonts/Cal_Sans,Inter/Inter/static/Inter_18pt-SemiBold.ttf'),
    Inter_700Bold: require('../../assets/fonts/Cal_Sans,Inter/Inter/static/Inter_18pt-Bold.ttf'),
    Inter_800ExtraBold: require('../../assets/fonts/Cal_Sans,Inter/Inter/static/Inter_18pt-ExtraBold.ttf'),
  });
  return { loaded, error };
}
