// ============================================
// AWOOF CORNER NAVIGATION SETUP
// ============================================
// This file configures the stack navigator for the Awoof Corner feature

import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AwoofFeedScreen from '@/app/awoof/AwoofFeedScreen';
import ProductDetailScreen from '@/app/awoof/ProductDetailScreen';
import AwoofMiniCartModal from '@/app/awoof/AwoofMiniCartModal';
import AwoofCheckoutScreen from '@/app/awoof/AwoofCheckoutScreen';
import OrderSuccessScreen from '@/app/awoof/OrderSuccessScreen';

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
  AwoofCheckout: { // Changed route name to match component
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
          name="AwoofCheckout" // Route name updated to match component
          component={AwoofCheckoutScreen} // Use the corrected component name
          options={{
            headerShown: false, // Disable header for the checkout screen as it uses a modal/native component
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
