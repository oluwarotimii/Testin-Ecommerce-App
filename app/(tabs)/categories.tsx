import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import {
  CpuIcon,
  DeviceMobileIcon,
  LaptopIcon,
  DeviceTabletIcon,
  MonitorIcon,
  MicrophoneIcon,
  HeadsetIcon,
  CameraIcon,
  VideoCameraIcon,
  ArrowsLeftRightIcon,
  LightningIcon,
  BatteryChargingVerticalIcon,
  HardDrivesIcon,
  FloppyDiskIcon,
  KeyboardIcon,
  WatchIcon,
  DiamondIcon,
  TShirtIcon,
  DressIcon,
  BagIcon,
  GameControllerIcon,
  HouseIcon,
  BookIcon,
  SoccerBallIcon,
  SparkleIcon,
  GridFourIcon,
  ArrowLeftIcon,
  CaretRightIcon,
  ListIcon,
  type Icon,
} from 'phosphor-react-native';
import { transformCategories } from '@/utils/woocommerceTransformers';
import SafeImage from '@/components/SafeImage';
import { radius, fontFamily, shadow } from '@/constants/designTokens';
import { useResponsiveColumns } from '@/hooks/useResponsiveColumns';

// Function to get icon for category
const getCategoryIcon = (categoryName: string): Icon => {
  const name = categoryName.toLowerCase();

  // Electronics & Tech
  if (name.includes('electron') || name.includes('tech')) return CpuIcon;
  if (name.includes('phone') || name.includes('mobile')) return DeviceMobileIcon;
  if (name.includes('laptop') || name.includes('computer')) return LaptopIcon;
  if (name.includes('tablet')) return DeviceTabletIcon;
  if (name.includes('monitor') || name.includes('display')) return MonitorIcon;

  // Audio & Video
  if (name.includes('audio') && name.includes('recorder')) return MicrophoneIcon;
  if (name.includes('headphone') || name.includes('audio')) return HeadsetIcon;
  if (name.includes('camera')) return CameraIcon;
  if (name.includes('gimbal')) return VideoCameraIcon;

  // Cables
  if (name.includes('hdmi') || name.includes('vga')) return ArrowsLeftRightIcon;

  // Power & Storage
  if (name.includes('power') && name.includes('surge')) return LightningIcon;
  if (name.includes('ups')) return BatteryChargingVerticalIcon;
  if (name.includes('storage') && name.includes('device')) return HardDrivesIcon;
  if (name.includes('storage')) return FloppyDiskIcon;

  // Input Devices
  if (name.includes('keyboard') || name.includes('mouse')) return KeyboardIcon;

  // Wearables
  if (name.includes('watch') || name.includes('wearable')) return WatchIcon;

  // Fashion
  if (name.includes('jewelery') || name.includes('jewelry')) return DiamondIcon;
  if (name.includes('men') && name.includes('clothing')) return TShirtIcon;
  if (name.includes('women') && name.includes('clothing')) return DressIcon;
  if (name.includes('accessory') || name.includes('accessories')) return BagIcon;

  // Gaming
  if (name.includes('gaming') || name.includes('game') || name.includes('toy')) return GameControllerIcon;

  // Other
  if (name.includes('home')) return HouseIcon;
  if (name.includes('book')) return BookIcon;
  if (name.includes('sport')) return SoccerBallIcon;
  if (name.includes('beauty') || name.includes('cosmetic')) return SparkleIcon;

  return GridFourIcon; // Default fallback icon
};

export default function CategoriesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const numColumns = useResponsiveColumns(2);
  const gridItemWidthPercent = numColumns >= 4 ? 23 : numColumns === 3 ? 31 : 47;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCategories();
        // Use transformation utility
        const transformedCategories = transformCategories(response);
        const formattedCategories = transformedCategories.map((category: any) => ({
          id: category.category_id,
          name: category.name.replace(/-/g, ' '),
          icon: getCategoryIcon(category.name),
          image: category.image
        }));
        setCategories(formattedCategories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.gridItem, { backgroundColor: colors.surface, width: `${gridItemWidthPercent}%` }]}
          onPress={() => router.push(`/category/${category.id}` as any)}
          activeOpacity={0.7}
        >
          {category.image ? (
            <SafeImage
              source={{ uri: category.image }}
              style={styles.categoryImage}
            />
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
              <category.icon weight="regular" size={28} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.categoryNameGrid, { color: colors.text }]} numberOfLines={2}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.listItem, { borderBottomColor: colors.border }]}
          onPress={() => router.push(`/category/${category.id}` as any)}
          activeOpacity={0.7}
        >
          {category.image ? (
            <SafeImage
              source={{ uri: category.image }}
              style={styles.categoryImageList}
            />
          ) : (
            <View style={[styles.listIconCircle, { backgroundColor: colors.primary + '15' }]}>
              <category.icon weight="regular" size={22} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.categoryNameList, { color: colors.text }]} numberOfLines={1}>
            {category.name}
          </Text>
          <CaretRightIcon weight="bold" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeftIcon weight="bold" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, marginLeft: 10 }]}>Categories</Text>
        </View>
        <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'grid' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('grid')}
          >
            <GridFourIcon weight={viewMode === 'grid' ? 'fill' : 'regular'} size={20} color={viewMode === 'grid' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('list')}
          >
            <ListIcon weight={viewMode === 'list' ? 'fill' : 'regular'} size={20} color={viewMode === 'list' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        ) : categories.length === 0 ? (
          <Text style={[styles.noCategoriesText, { color: colors.textSecondary }]}>No categories found</Text>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </ScrollView>
    </SafeAreaView>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: fontFamily.bold,
    marginLeft: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 3,
    gap: 2,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 14,
  },
  gridItem: {
    borderRadius: radius.xl,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    ...shadow.card,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  categoryNameGrid: {
    fontSize: 13,
    fontFamily: fontFamily.semiBold,
    textAlign: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    gap: 14,
  },
  listIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImageList: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  categoryNameList: {
    flex: 1,
    fontSize: 15,
    fontFamily: fontFamily.semiBold,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noCategoriesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 15,
  },
});