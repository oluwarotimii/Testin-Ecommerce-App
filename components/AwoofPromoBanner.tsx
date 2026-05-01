import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface AwoofPromoBannerProps {
  onClose?: () => void;
}

const AwoofPromoBanner: React.FC<AwoofPromoBannerProps> = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/(tabs)/awoof');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.text} numberOfLines={1}>
           **GO TO AWOOF CORNER, ORDER, PAY AND HET GET IT DELIVERED ASAP!**
        </Text>
        <TouchableOpacity style={styles.payButton} onPress={handlePress}>
          <Text style={styles.payText}>[ PAY ]</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFD700',
    height: 40,
    marginBottom:7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 2,
    zIndex: 1000,
    borderBottomWidth: 3,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  text: {
    color: '#000000',
    fontSize:   10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Courier New',
  },
  payButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    transform: [{ scale: 1.1 }],
  },
  payText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default AwoofPromoBanner;