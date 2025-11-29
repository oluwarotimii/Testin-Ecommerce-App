import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import CarouselItem from './CarouselItem';
import { useThemeColors } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 40;

interface CarouselData {
  id: string | number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkType: 'product' | 'category' | 'external' | 'none';
  linkValue: string;
  backgroundColor?: string;
}

interface InstagramCarouselProps {
  data: CarouselData[];
  onItemPress: (item: CarouselData) => void;
}

export default function InstagramCarousel({ data, onItemPress }: InstagramCarouselProps) {
  const colors = useThemeColors();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (ITEM_WIDTH + 16));
    setActiveIndex(index);
  };

  const startAutoPlay = () => {
    intervalRef.current = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = prevIndex === data.length - 1 ? 0 : prevIndex + 1;
        scrollViewRef.current?.scrollTo({ x: nextIndex * (ITEM_WIDTH + 16), animated: true });
        return nextIndex;
      });
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    if (data.length > 1) {
      startAutoPlay();
    }

    return () => {
      stopAutoPlay();
    };
  }, [data.length]);

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        onScrollBeginDrag={stopAutoPlay}
        onScrollEndDrag={startAutoPlay}
        decelerationRate="fast"
        snapToInterval={ITEM_WIDTH + 16}
        snapToAlignment="start"
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {data.map((item, index) => (
          <CarouselItem
            key={item.id}
            item={item}
            onPress={() => onItemPress(item)}
          />
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {data.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: index === activeIndex ? colors.primary : colors.textSecondary,
                opacity: index === activeIndex ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollView: {
    paddingLeft: 20,
  },
  scrollContent: {
    paddingRight: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});