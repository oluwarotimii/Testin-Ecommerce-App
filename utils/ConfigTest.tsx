import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

const ConfigTest = () => {
  // Access environment variables from app.json extra section
  const { 
    expoPublicWordpressConsumerKey, 
    expoPublicWordpressConsumerSecret, 
    expoPublicApiServiceType, 
    expoPublicWordpressUrl 
  } = Constants.expoConfig?.extra || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configuration Test</Text>
      
      <Text style={styles.label}>API Service Type:</Text>
      <Text style={styles.value}>{expoPublicApiServiceType || 'Not set'}</Text>
      
      <Text style={styles.label}>WordPress URL:</Text>
      <Text style={styles.value}>{expoPublicWordpressUrl || 'Not set'}</Text>
      
      <Text style={styles.label}>Consumer Key (partial):</Text>
      <Text style={styles.value}>
        {expoPublicWordpressConsumerKey 
          ? expoPublicWordpressConsumerKey.substring(0, 10) + '...' 
          : 'Not set'}
      </Text>
      
      <Text style={styles.label}>Consumer Secret (partial):</Text>
      <Text style={styles.value}>
        {expoPublicWordpressConsumerSecret 
          ? expoPublicWordpressConsumerSecret.substring(0, 10) + '...' 
          : 'Not set'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    margin: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
  },
  value: {
    fontSize: 12,
    color: '#333',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
});

export default ConfigTest;