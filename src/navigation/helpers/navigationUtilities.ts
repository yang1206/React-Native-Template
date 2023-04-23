import { useEffect, useRef, useState } from 'react'
import { BackHandler, Platform } from 'react-native'
import type {
  NavigationAction,
  NavigationState,
  PartialState,
} from '@react-navigation/native'
import {
  createNavigationContainerRef,
} from '@react-navigation/native'
import type { PersistNavigationConfig } from '../../config/config.base'
import type * as storage from '../../utils/storage'
import Config from '@/config'
import { useIsMounted } from '@/hooks'

type Storage = typeof storage

export const navigationRef = createNavigationContainerRef()

export const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE'

/**
 * Gets the current screen from any navigation state.
 */
export function getActiveRouteName(state: NavigationState | PartialState<NavigationState>): any {
  const route = state.routes[state.index ?? 0]

  // Found the active route -- return the name
  if (!route.state)
    return route.name

  // Recursive call to deal with nested routers
  return getActiveRouteName(route.state)
}

/**
 * Hook that handles Android back button presses and forwards those on to
 * the navigation or allows exiting the app.
 */
export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  // ignore if iOS ... no back button!
  if (Platform.OS === 'ios')
    return

  // The reason we're using a ref here is because we need to be able
  // to update the canExit function without re-setting up all the listeners
  /* eslint-disable-next-line   react-hooks/rules-of-hooks */
  const canExitRef = useRef(canExit)
  /* eslint-disable-next-line   react-hooks/rules-of-hooks */
  useEffect(() => {
    canExitRef.current = canExit
  }, [canExit])
  /* eslint-disable-next-line   react-hooks/rules-of-hooks */
  useEffect(() => {
    // We'll fire this when the back button is pressed on Android.
    const onBackPress = () => {
      if (!navigationRef.isReady())
        return false

      // grab the current route
      const routeName = getActiveRouteName(navigationRef.getRootState())

      // are we allowed to exit?
      if (canExitRef.current(routeName)) {
        // exit and let the system know we've handled the event
        BackHandler.exitApp()
        return true
      }

      // we can't exit, so let's turn this into a back action
      if (navigationRef.canGoBack()) {
        navigationRef.goBack()
        return true
      }

      return false
    }

    // Subscribe when we come to life
    BackHandler.addEventListener('hardwareBackPress', onBackPress)

    // Unsubscribe when we're done
    return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
  }, [])
}
/**
 * This helper function will determine whether we should enable navigation persistence
 * based on a config setting and the __DEV__ environment (dev or prod).
 */
function navigationRestoredDefaultState(persistNavigation: PersistNavigationConfig) {
  if (persistNavigation === 'always')
    return false

  if (persistNavigation === 'dev' && __DEV__)
    return false

  if (persistNavigation === 'prod' && !__DEV__)
    return false

  // all other cases, disable restoration by returning true
  return true
}

/**
 * Custom hook for persisting navigation state.
 */
export function useNavigationPersistence(storage: Storage, persistenceKey: string) {
  const [initialNavigationState, setInitialNavigationState] = useState()
  const isMounted = useIsMounted()

  const initNavState = navigationRestoredDefaultState(Config.persistNavigation)
  const [isRestored, setIsRestored] = useState(initNavState)

  const routeNameRef = useRef<string | undefined>()

  const onNavigationStateChange = (state: any) => {
    const previousRouteName = routeNameRef.current
    const currentRouteName = getActiveRouteName(state)

    if (previousRouteName !== currentRouteName) {
      // track screens.
      if (__DEV__)
        /* eslint-disable-next-line   no-console */
        console.log(currentRouteName)
    }

    // Save the current route name for later comparision
    routeNameRef.current = currentRouteName

    // Persist state to storage
    storage.setItem(persistenceKey, state)
  }

  const restoreState = async () => {
    try {
      const state = await storage.getItem(persistenceKey, 'object')
      if (state)
        setInitialNavigationState(state)
    }
    finally {
      if (isMounted())
        setIsRestored(true)
    }
  }

  useEffect(() => {
    if (!isRestored && __DEV__)
      restoreState()
  }, [isRestored])

  return { onNavigationStateChange, restoreState, isRestored, initialNavigationState }
}

/**
 * use this to navigate without the navigation
 * prop. If you have access to the navigation prop, do not use this.
 * More info: https://reactnavigation.org/docs/navigating-without-navigation-prop/
 */
export function navigate(name: any, params?: any) {
  if (navigationRef.isReady())
    navigationRef.navigate(name as never, params as never)
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack())
    navigationRef.goBack()
}

export function resetRoot(params = { index: 0, routes: [] }) {
  if (navigationRef.isReady())
    navigationRef.resetRoot(params)
}

export function canGoBack() {
  if (navigationRef.isReady())
    navigationRef.canGoBack()
}

export function dispatch(action: NavigationAction) {
  if (navigationRef.isReady())
    navigationRef.dispatch(action)
}

export const RootNavigation = {
  navigate,
  goBack,
  resetRoot,
  canGoBack,
  dispatch,
}
