import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useThemeColors } from '@/hooks/useColorScheme';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { transformCategories } from '@/utils/woocommerceTransformers';
import SafeImage from '@/components/SafeImage';

// Function to get icon for category
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();

  // Electronics & Tech
  if (name.includes('electron') || name.includes('tech')) return 'hardware-chip';
  if (name.includes('phone') || name.includes('mobile')) return 'phone-portrait';
  if (name.includes('laptop') || name.includes('computer')) return 'laptop';
  if (name.includes('tablet')) return 'tablet-landscape';
  if (name.includes('monitor') || name.includes('display')) return 'desktop';

  // Audio & Video
  if (name.includes('audio') && name.includes('recorder')) return 'mic';
  if (name.includes('headphone') || name.includes('audio')) return 'headset';
  if (name.includes('camera') && name.includes('accessor')) return 'camera-outline';
  if (name.includes('camera')) return 'camera';
  if (name.includes('gimbal')) return 'videocam';

  // Cables
  if (name.includes('hdmi')) return 'swap-horizontal';
  if (name.includes('vga')) return 'git-compare';

  // Power & Storage
  if (name.includes('power') && name.includes('surge')) return 'flash';
  if (name.includes('ups')) return 'battery-charging';
  if (name.includes('storage') && name.includes('device')) return 'server';
  if (name.includes('storage')) return 'save';

  // Input Devices
  if (name.includes('keyboard') || name.includes('mouse')) return 'keypad';

  // Wearables
  if (name.includes('smartwatch')) return 'watch';
  if (name.includes('watch') || name.includes('wearable')) return 'watch';

  // Fashion
  if (name.includes('jewelery') || name.includes('jewelry')) return 'diamond';
  if (name.includes('men') && name.includes('clothing')) return 'shirt';
  if (name.includes('women') && name.includes('clothing')) return 'woman';
  if (name.includes('accessory') || name.includes('accessories')) return 'bag-handle';

  // Gaming
  if (name.includes('gaming') || name.includes('game')) return 'game-controller';
  if (name.includes('toy')) return 'game-controller';

  // Other
  if (name.includes('home')) return 'home';
  if (name.includes('book')) return 'book';
  if (name.includes('sport')) return 'football';
  if (name.includes('beauty') || name.includes('cosmetic')) return 'sparkles';

  return 'grid'; // Default fallback icon
};

export default function CategoriesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { apiService } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const renderGridView = () => (
    <View style={styles.gridContainer}>
      {filteredCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[styles.gridItem, { backgroundColor: colors.surface }]}
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
              <Ionicons name={category.icon as any} size={28} color={colors.primary} />
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
      {filteredCategories.map((category) => (
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
              <Ionicons name={category.icon as any} size={22} color={colors.primary} />
            </View>
          )}
          <Text style={[styles.categoryNameList, { color: colors.text }]} numberOfLines={1}>
            {category.name}
          </Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
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
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, marginLeft: 10 }]}>Categories</Text>
        </View>
        <View style={[styles.viewToggle, { backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'grid' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={20} color={viewMode === 'grid' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && { backgroundColor: colors.primary }]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={20} color={viewMode === 'list' ? colors.white : colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {/* <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search categories..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View> */}

      {/* Categories */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        ) : filteredCategories.length === 0 ? (
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
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginLeft: 8,
  },
  viewToggle: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
    width: '47%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
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
    fontWeight: '600',
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
    fontWeight: '600',
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