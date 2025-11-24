// WordPress API Integration Test Component
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';

const WordPressTestScreen = () => {
  const { apiService } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  const runTests = async () => {
    setTestResults([]);
    addTestResult('Starting WordPress API integration tests...');
    
    try {
      // Test 1: Check if API service is properly configured
      addTestResult(`API Service Type: ${apiService.constructor.name}`);
      addTestResult(`Is Authenticated: ${apiService.isAuthenticated}`);

      // Test 2: Test product retrieval
      addTestResult('Testing product retrieval...');
      const products = await apiService.getProducts({ per_page: 3 });
      addTestResult(`Retrieved ${Array.isArray(products) ? products.length : 0} products`);

      if (Array.isArray(products) && products.length > 0) {
        // Test 3: Test single product retrieval
        const firstProduct = products[0];
        addTestResult(`Testing single product retrieval for ID: ${firstProduct.id}`);
        const singleProduct = await apiService.getProduct(firstProduct.id);
        addTestResult(`Retrieved product: ${singleProduct.name || singleProduct.title}`);
      }

      // Test 4: Test category retrieval
      addTestResult('Testing category retrieval...');
      const categories = await apiService.getCategories();
      addTestResult(`Retrieved ${Array.isArray(categories) ? categories.length : 0} categories`);

      // Test 5: Test carousel items
      addTestResult('Testing carousel items retrieval...');
      const carouselItems = await apiService.getCarouselItems();
      addTestResult(`Retrieved ${Array.isArray(carouselItems) ? carouselItems.length : 0} carousel items`);

      addTestResult('All tests completed successfully!');
      Alert.alert('Tests Complete', 'WordPress API integration tests have completed.');
    } catch (error: any) {
      addTestResult(`Test error: ${error.message}`);
      Alert.alert('Test Error', `An error occurred during testing: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>WordPress API Integration Test</Text>
      <Button title="Run Integration Tests" onPress={runTests} />
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <Text key={index} style={styles.resultItem}>
            • {result}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultItem: {
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default WordPressTestScreen;