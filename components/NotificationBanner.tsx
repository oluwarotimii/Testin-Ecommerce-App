import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';

interface NotificationBannerProps {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  onDismiss: (id: string) => void;
  onPress?: (id: string) => void;
  autoHide?: boolean;
  duration?: number;
}

export default function NotificationBanner({
  id,
  title,
  message,
  type,
  onDismiss,
  onPress,
  autoHide = true,
  duration = 5000,
}: NotificationBannerProps) {
  const [visible, setVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Slide in animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    if (autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      onDismiss(id);
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Ionicons name="information-circle" size={20} color="#007AFF" />;
      case 'warning':
        return <Ionicons name="alert-circle" size={20} color="#FF9500" />;
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color="#34C759" />;
      case 'error':
        return <Ionicons name="close-circle" size={20} color="#FF3B30" />;
      default:
        return <Ionicons name="information-circle" size={20} color="#007AFF" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'info':
        return '#007AFF15';
      case 'warning':
        return '#FF950015';
      case 'success':
        return '#34C75915';
      case 'error':
        return '#FF3B3015';
      default:
        return '#007AFF15';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'info':
        return '#007AFF';
      case 'warning':
        return '#FF9500';
      case 'success':
        return '#34C759';
      case 'error':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderLeftColor: getBorderColor(),
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={() => onPress?.(id)}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
        <Ionicons name="close" size={18} color="#8E8E93" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
});