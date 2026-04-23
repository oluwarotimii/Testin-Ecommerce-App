import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export interface AwoofToastRef {
  show: (message: string, type?: 'success' | 'error') => void;
}

const AwoofToast = forwardRef<AwoofToastRef>((props, ref) => {
  const colors = useThemeColors();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');
  const [visible, setVisible] = useState(false);
  
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(-20))[0];

  useImperativeHandle(ref, () => ({
    show: (msg: string, t: 'success' | 'error' = 'success') => {
      setMessage(msg);
      setType(t);
      setVisible(true);
      
      Haptics.notificationAsync(
        t === 'success' 
          ? Haptics.NotificationFeedbackType.Success 
          : Haptics.NotificationFeedbackType.Error
      );

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        hide();
      }, 3000);
    },
  }));

  const hide = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
    });
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: type === 'success' ? '#34C759' : '#FF3B30',
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons 
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
        size={20} 
        color="#fff" 
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    gap: 12,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});

export default AwoofToast;
