import { useColorScheme } from 'nativewind'
import type { StackScreenProps } from '@react-navigation/stack'
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useFlipper } from '@react-navigation/devtools'
import { TabNavigator } from './tab-navigator'
import { navigationRef } from './helpers/navigationUtilities'
import { AboutScreen, CameraScreen, LoginScreen, TestScreen, TodoScreen } from '@/screens'
import { MediaPage } from '@/components/Camera/MediaPage'

export type AppStackParamList = {
  Tab: undefined
  Camera: undefined
  Todo: undefined
  About: undefined
  Test: undefined
  Login: undefined
  MediaPage: {
    path: string
    type: 'video' | 'photo'
  }
}

export type AppStackScreenProps<T extends keyof AppStackParamList> = StackScreenProps<
  AppStackParamList,
  T
>

const Stack = createNativeStackNavigator<AppStackParamList>()

const AppStack = function AppStack() {
  const { colorScheme } = useColorScheme()

  const isDark = colorScheme === 'dark'

  return (
    <Stack.Navigator
      screenOptions={{
        headerBlurEffect: isDark ? 'systemMaterialDark' : 'systemMaterialLight',
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tab" component={TabNavigator} />
      <Stack.Screen options={{
        headerShown: false,
      }} name="Camera" component={CameraScreen} />
      <Stack.Screen options={{
        headerShown: false,
      }} name="Test" component={TestScreen} />
      <Stack.Screen options={{
        headerShown: false,
      }} name="Login" component={LoginScreen} />
      <Stack.Screen options={{
        headerShown: false,
      }} name="MediaPage" component={MediaPage} />
      <Stack.Screen options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#00b38a',
        },
      }} name="Todo" component={TodoScreen} />
      <Stack.Screen options={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#00b38a',
        },
      }} name="About" component={AboutScreen} />
    </Stack.Navigator>
  )
}

export interface NavigationProps extends Partial<React.ComponentProps<typeof NavigationContainer>> { }

export const AppNavigator = function AppNavigator(props: NavigationProps) {
  const { colorScheme } = useColorScheme()
  useFlipper(navigationRef)
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer {...props}
          ref={navigationRef}
          theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <AppStack />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
