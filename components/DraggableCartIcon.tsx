import React, { useState, useRef, useEffect } from 'react';
import { View, Animated, PanResponder, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/context/CartContext';
import { useThemeColors } from '@/hooks/useColorScheme';

const DraggableCartIcon = ({ onPress, visible = true }: { onPress: () => void, visible?: boolean }) => {
  const { cartCount } = useCart();
  const colors = useThemeColors();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event([
      null,
      { dx: pan.x, dy: pan.y }
    ], {
      useNativeDriver: false
    }),
    onPanResponderRelease: (e, gestureState) => {
      // Calculate new position after release
      const newX = pan.x._value;
      const newY = pan.y._value;
      
      // Snap to edges if close enough
      const screen = require('react-native').Dimensions.get('window');
      const snapMargin = 50;
      
      let finalX = newX;
      if (Math.abs(newX) < snapMargin) {
        finalX = 0; // snap to left
      } else if (Math.abs(newX) > screen.width - snapMargin) {
        finalX = screen.width - 100; // snap to right (accounting for icon width)
      }
      
      // Ensure icon stays within screen bounds
      finalX = Math.max(0, Math.min(finalX, screen.width - 80));
      const finalY = Math.max(0, Math.min(newY, screen.height - 80));
      
      setPosition({ x: finalX, y: finalY });
      
      // Animate back to final position
      Animated.spring(pan, {
        toValue: { x: finalX, y: finalY },
        useNativeDriver: false,
        friction: 7,
        tension: 100,
      }).start();
    },
  });

  useEffect(() => {
    // Initialize position to bottom right corner
    const screen = require('react-native').Dimensions.get('window');
    setPosition({ 
      x: screen.width - 80, 
      y: screen.height - 150 
    });
    pan.setValue({ x: screen.width - 80, y: screen.height - 150 });
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: pan.x,
          top: pan.y,
          zIndex: 999,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
        onPress={onPress}
      >
        <Ionicons name="cart" size={24} color="#FFFFFF" />
        {cartCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -5,
            right: -5,
            backgroundColor: '#FF3B30',
            borderRadius: 10,
            minWidth: 18,
            height: 18,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 4,
          }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 10,
              fontWeight: 'bold',
            }}>
              {cartCount > 99 ? '99+' : cartCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default DraggableCartIcon;