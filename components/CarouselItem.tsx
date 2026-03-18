import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useThemeColors } from '@/hooks/useColorScheme';
import SafeImage from './SafeImage';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 40;
const ITEM_HEIGHT = 200;

interface CarouselItemProps {
  item: {
    id: string | number;
    title: string;
    subtitle: string;
    imageUrl: string;
    backgroundColor?: string;
  };
  onPress: () => void;
}

export default function CarouselItem({ item, onPress }: CarouselItemProps) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[styles.container, { width: ITEM_WIDTH }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <SafeImage source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: colors.surface }]} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
});