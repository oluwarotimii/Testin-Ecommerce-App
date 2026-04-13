// ============================================
// AWOOF CORNER NAVIGATION SETUP
// ============================================
// This file configures the stack navigator for the Awoof Corner feature

import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AwoofFeedScreen from './AwoofFeedScreen';
import ProductDetailScreen from './ProductDetailScreen';
import AwoofMiniCartModal from './AwoofMiniCartModal';
import AwoofCheckoutWebView from './AwoofCheckoutWebView';
import OrderSuccessScreen from './OrderSuccessScreen';

// ============================================
// TYPE DEFINITIONS
// ============================================
export type AwoofStackParamList = {
  AwoofFeed: undefined;
  ProductDetail: {
    product: {
      id: string;
      name: string;
      originalPrice: number;
      salePrice: number;
      image: string;
      discount: number;
      tag: string;
      stock: number;
    };
  };
  AwoofMiniCart: {
    addedProduct?: any;
  };
  AwoofCheckoutWebView: {
    cartItems: Array<any>;
  };
  OrderSuccess: {
    orderId: string;
  };
};

// ============================================
// STACK NAVIGATOR
// ============================================
const Stack = createStackNavigator<AwoofStackParamList>();

export function AwoofCornerNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: ({ current: { progress } }) => ({
            cardStyle: {
              flex: 1,
              opacity: progress,
            },
          }),
        }}
      >
        <Stack.Screen
          name="AwoofFeed"
          component={AwoofFeedScreen}
        />

        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                flex: 1,
                transform: [
                  {
                    translateX: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        />

        <Stack.Screen
          name="AwoofMiniCart"
          component={AwoofMiniCartModal}
          options={{
            presentation: 'transparentModal',
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                opacity: progress,
              },
            }),
          }}
        />

        <Stack.Screen
          name="AwoofCheckoutWebView"
          component={AwoofCheckoutWebView}
          options={{
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                flex: 1,
                transform: [
                  {
                    translateY: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              },
            }),
          }}
        />

        <Stack.Screen
          name="OrderSuccess"
          component={OrderSuccessScreen}
          options={{
            gestureEnabled: false,
            cardStyleInterpolator: ({ current: { progress } }) => ({
              cardStyle: {
                flex: 1,
                opacity: progress,
              },
            }),
          }}
        />
      </Stack.Navigator>
    </View>
  );
}

// ============================================
// INTEGRATION WITH BOTTOM TABS
// ============================================
/*
In your main app navigation (e.g., App.tsx or MainNavigator.tsx):

import { AwoofCornerNavigator } from './navigation/AwoofCornerNavigator';

// In your bottom tab navigator:
<Tab.Screen 
  name="AwoofCorner" 
  component={AwoofCornerNavigator}
  options={{
    tabBarLabel: 'Awoof Corner',
    tabBarIcon: ({ color, size }) => (
      <Text style={{ fontSize: 24 }}>🔥</Text>
    ),
    // Optional: Add a badge for hot deals count
    tabBarBadge: hotDealsCount > 0 ? hotDealsCount : undefined,
  }}
/>
*/

// ============================================
// DEPENDENCIES NEEDED
// ============================================
/*
Make sure you have these packages installed:

npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-webview
npm install expo-linear-gradient
npm install react-native-screens react-native-safe-area-context

Or with yarn:

yarn add @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
yarn add react-native-webview
yarn add expo-linear-gradient
yarn add react-native-screens react-native-safe-area-context
*/
