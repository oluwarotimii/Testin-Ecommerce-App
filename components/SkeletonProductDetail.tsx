import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { useThemeColors } from '@/hooks/useColorScheme';

const { width } = Dimensions.get('window');

export default function SkeletonProductDetail() {
    const colors = useThemeColors();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header Skeleton */}
            <View style={[styles.header, { backgroundColor: colors.surface }]}>
                <SkeletonLoader width={40} height={40} borderRadius={20} />
                <SkeletonLoader width={40} height={40} borderRadius={20} />
            </View>

            <View style={styles.content}>
                {/* Image Skeleton */}
                <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
                    <SkeletonLoader width={width * 0.85} height={width * 0.85} borderRadius={12} />
                </View>

                {/* Info Skeleton */}
                <View style={[styles.productInfoContainer, { backgroundColor: colors.surface }]}>
                    <View style={styles.titleSection}>
                        <SkeletonLoader width={100} height={16} borderRadius={4} marginBottom={8} />
                        <SkeletonLoader width="80%" height={32} borderRadius={4} />
                    </View>

                    <View style={styles.ratingSection}>
                        <SkeletonLoader width={120} height={20} borderRadius={4} />
                    </View>

                    <View style={styles.priceSection}>
                        <SkeletonLoader width={100} height={36} borderRadius={4} />
                    </View>

                    <View style={styles.descriptionSection}>
                        <SkeletonLoader width={100} height={24} borderRadius={4} marginBottom={12} />
                        <SkeletonLoader width="100%" height={16} borderRadius={4} marginBottom={8} />
                        <SkeletonLoader width="100%" height={16} borderRadius={4} marginBottom={8} />
                        <SkeletonLoader width="80%" height={16} borderRadius={4} />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    content: {
        flex: 1,
    },
    imageContainer: {
        padding: 20,
        alignItems: 'center',
    },
    productInfoContainer: {
        marginTop: 10,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        flex: 1,
    },
    titleSection: {
        marginBottom: 15,
    },
    ratingSection: {
        marginBottom: 15,
    },
    priceSection: {
        marginBottom: 20,
        marginTop: 10,
    },
    descriptionSection: {
        marginBottom: 25,
    },
});
