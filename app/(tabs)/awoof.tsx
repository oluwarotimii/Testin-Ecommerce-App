import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationIndependentTree } from '@react-navigation/native';
import { AwoofCornerNavigator } from '../awoof/AwoofCornerNavigator';

export default function AwoofScreen() {
  return (
    <View style={styles.container}>
      <NavigationIndependentTree>
        <AwoofCornerNavigator />
      </NavigationIndependentTree>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
