import React from 'react';
import { Image as RNImage, ImageProps as RNImageProps } from 'react-native';

// Safe Image component that handles the DOM constructor issue
const SafeImage: React.FC<RNImageProps> = (props) => {
  return <RNImage {...props} />;
};

export default SafeImage;