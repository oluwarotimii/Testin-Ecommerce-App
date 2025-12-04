import React, { useState, useRef } from 'react';
import { Image as RNImage, ImageProps as RNImageProps, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/hooks/useColorScheme';

// Safe Image component that handles the DOM constructor issue and image loading errors
const SafeImage: React.FC<RNImageProps> = (props) => {
  const colors = useThemeColors();
  const [imageError, setImageError] = useState(false);
  const [retries, setRetries] = useState(0);
  const maxRetries = 3;
  const source = useRef(props.source);

  const handleImageError = () => {
    if (retries < maxRetries) {
      // Retry the image after a short delay
      setTimeout(() => {
        setRetries(prev => prev + 1);
        setImageError(false);
        // Force reload by updating source ref
        source.current = { ...props.source, _t: Date.now() }; // Add timestamp to trigger reload
      }, 500);
    } else {
      setImageError(true);
      // Call the original onError if it exists
      if (props.onError) {
        props.onError(new Error('Image failed to load after retries'));
      }
    }
  };

  const handleImageLoad = () => {
    setImageError(false);
    setRetries(0); // Reset retries on successful load
    // Call the original onLoad if it exists
    if (props.onLoad) {
      props.onLoad({});
    }
  };

  const handleRetry = () => {
    setImageError(false);
    setRetries(0);
    // Force reload by updating source ref with timestamp
    source.current = { ...props.source, _t: Date.now() };
  };

  if (imageError || !props.source) {
    return (
      <TouchableOpacity
        style={[styles.placeholderContainer, props.style, { backgroundColor: colors.surface }]}
        onPress={handleRetry}
      >
        <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
        <Ionicons
          name="refresh"
          size={16}
          color={colors.primary}
          style={styles.retryIcon}
        />
      </TouchableOpacity>
    );
  }

  // Ensure the source is properly formatted
  const processedSource = source.current;

  // If source is an object with uri, ensure it's a proper URL
  if (processedSource && typeof processedSource === 'object' && processedSource.uri) {
    let uri = processedSource.uri;

    // Fix common URL issues
    if (uri && typeof uri === 'string') {
      // Convert http to https for better compatibility
      if (uri.startsWith('http://')) {
        uri = uri.replace('http://', 'https://');
      }
      // Update the processed source
      processedSource.uri = uri;
    }
  }

  return (
    <RNImage
      {...props}
      source={processedSource}
      onError={handleImageError}
      onLoad={handleImageLoad}
      style={props.style}
      resizeMode={props.resizeMode || 'cover'}
    />
  );
};

const styles = StyleSheet.create({
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  retryIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
});

export default SafeImage;