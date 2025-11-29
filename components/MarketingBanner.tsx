import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useColorScheme';
import { fetchBanner, BannerItem } from '@/services/banner';

interface MarketingBannerProps {
    // No props needed as it fetches its own data
}

const MarketingBanner: React.FC<MarketingBannerProps> = () => {
    const router = useRouter();
    const colors = useThemeColors();
    const [loading, setLoading] = useState(true);
    const [bannerData, setBannerData] = useState<BannerItem | null>(null);

    useEffect(() => {
        const loadBanner = async () => {
            try {
                const data = await fetchBanner();
                setBannerData(data);
            } catch (error) {
                console.error('Error fetching banner:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBanner();
    }, []);

    if (loading) {
        return (
            <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.surface }]}>
                <ActivityIndicator size="small" color={colors.primary} />
            </View>
        );
    }

    if (!bannerData) return null;

    const handlePress = () => {
        if (!bannerData) return;

        switch (bannerData.linkType) {
            case 'product':
                router.push(`/product/${bannerData.linkValue}`);
                break;
            case 'category':
                router.push(`/category/${bannerData.linkValue}`);
                break;
            case 'external':
                Linking.openURL(bannerData.linkValue);
                break;
            default:
                break;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.surface }]}
            onPress={handlePress}
            activeOpacity={bannerData.linkType === 'none' ? 1 : 0.9}
        >
            <Image
                source={{ uri: bannerData.imageUrl }}
                style={styles.image}
                resizeMode="cover"
            />
            <View style={styles.overlay}>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>{bannerData.title}</Text>
                    {bannerData.subtitle && (
                        <Text style={styles.subtitle}>{bannerData.subtitle}</Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginBottom: 24,
        borderRadius: 16,
        overflow: 'hidden',
        height: 160,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        padding: 20,
    },
    textContainer: {
        alignItems: 'flex-start',
    },
    title: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default MarketingBanner;
