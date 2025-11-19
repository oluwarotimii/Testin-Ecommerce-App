import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';
import Slider from '@react-native-community/slider';

export interface FilterOptions {
  minPrice: number;
  maxPrice: number;
  sortBy: 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'name';
  rating?: number;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  maxPriceLimit?: number;
}

export default function FilterModal({ 
  visible, 
  onClose, 
  onApply, 
  currentFilters,
  maxPriceLimit = 1000 
}: FilterModalProps) {
  const colors = useThemeColors();
  const [minPrice, setMinPrice] = useState(currentFilters.minPrice);
  const [maxPrice, setMaxPrice] = useState(currentFilters.maxPrice);
  const [sortBy, setSortBy] = useState(currentFilters.sortBy);
  const [rating, setRating] = useState(currentFilters.rating || 0);

  const handleApply = () => {
    onApply({
      minPrice,
      maxPrice,
      sortBy,
      rating: rating > 0 ? rating : undefined,
    });
    onClose();
  };

  const handleReset = () => {
    setMinPrice(0);
    setMaxPrice(maxPriceLimit);
    setSortBy('newest');
    setRating(0);
  };

  const sortOptions = [
    { value: 'price-asc', label: 'Price: Low to High', icon: 'arrow-up' },
    { value: 'price-desc', label: 'Price: High to Low', icon: 'arrow-down' },
    { value: 'rating', label: 'Highest Rated', icon: 'star' },
    { value: 'newest', label: 'Newest First', icon: 'time' },
    { value: 'name', label: 'Name: A-Z', icon: 'text' },
  ];

  const ratingOptions = [0, 1, 2, 3, 4, 5];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filters & Sort</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Range</Text>
              <View style={styles.priceDisplay}>
                <Text style={[styles.priceText, { color: colors.primary }]}>
                  ₦{minPrice.toFixed(0)}
                </Text>
                <Text style={[styles.priceText, { color: colors.textSecondary }]}>-</Text>
                <Text style={[styles.priceText, { color: colors.primary }]}>
                  ₦{maxPrice.toFixed(0)}
                </Text>
              </View>
              
              {/* Min Price Slider */}
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Minimum Price</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={maxPriceLimit}
                value={minPrice}
                onValueChange={setMinPrice}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                step={10}
              />
              
              {/* Max Price Slider */}
              <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>Maximum Price</Text>
              <Slider
                style={styles.slider}
                minimumValue={minPrice}
                maximumValue={maxPriceLimit}
                value={maxPrice}
                onValueChange={setMaxPrice}
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
                step={10}
              />
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    { backgroundColor: colors.surface },
                    sortBy === option.value && { backgroundColor: colors.primaryLight }
                  ]}
                  onPress={() => setSortBy(option.value as any)}
                >
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={sortBy === option.value ? colors.primary : colors.textSecondary} 
                  />
                  <Text 
                    style={[
                      styles.sortOptionText, 
                      { color: sortBy === option.value ? colors.primary : colors.text }
                    ]}
                  >
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Filter */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {ratingOptions.map((stars) => (
                  <TouchableOpacity
                    key={stars}
                    style={[
                      styles.ratingOption,
                      { backgroundColor: colors.surface },
                      rating === stars && { backgroundColor: colors.primaryLight }
                    ]}
                    onPress={() => setRating(stars)}
                  >
                    {stars === 0 ? (
                      <Text style={[styles.ratingText, { color: colors.textSecondary }]}>Any</Text>
                    ) : (
                      <>
                        <Ionicons name="star" size={16} color={rating === stars ? colors.primary : colors.textSecondary} />
                        <Text style={[styles.ratingText, { color: rating === stars ? colors.primary : colors.text }]}>
                          {stars}+
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.surface }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={[styles.applyButtonText, { color: colors.white }]}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sliderLabel: {
    fontSize: 14,
    marginBottom: 8,
    marginTop: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
