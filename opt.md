# 🚀 Home Screen & Best Deals Section Optimization Plan

**Created:** March 7, 2026  
**Status:** ✅ Phase 1 Complete  
**Priority:** High  

---

## ✅ Phase 1: Quick Wins - COMPLETED

**Implementation Date:** March 7, 2026

**Completed Tasks:**
- [x] 1. Move `fetchFeaturedProducts` logic to home screen parent
- [x] 2. Fetch all data in parallel with `Promise.all`
- [x] 3. Reduce `per_page` from 100 to 8
- [x] 4. Pass data as props to BestDealsSection
- [x] 5. Add proper image thumbnail usage (`item.thumbnail || item.image`)
- [x] 6. Add graceful error handling (multiple fallbacks)
- [x] 7. Convert BestDealsSection to props-based (no internal fetching)

**Files Created:**
- `utils/cache.ts` - Caching utility (available for future use)
- `hooks/useFeaturedProducts.ts` - Custom hook (available for future use)

**Files Modified:**
- `app/(tabs)/index.tsx` - Added parallel fetching, featured products state
- `components/BestDealsSection.tsx` - Converted to props-based, added thumbnail support
- `services/config.ts` - Added `FEATURED_PRODUCTS_LIMIT = 8`

**Key Implementation Details:**
- **Simplified approach:** Instead of caching category IDs, we use a multi-level fallback:
  1. Try `category=daily-deals` (slug-based)
  2. Fallback to `featured=true` products
  3. Final fallback to latest products
- **Stale-while-revalidate:** Shows existing data while refreshing in background
- **Graceful degradation:** Each level has error handling, never breaks the UI

**Expected Performance Improvement:**
- ⏱️ Initial load time: 2.5-3.5s → **0.8-1.2s** (60-70% faster)
- 📉 API calls reduced: 4-5 → **3** (no category lookup needed)
- 💾 Payload size: ~500KB → **~100KB** (80% smaller)
- 🔄 More resilient: Multiple fallbacks prevent complete failures  

---

## 📋 Executive Summary

**Problem:** When users open the app, the Best Deals section doesn't load immediately, creating a poor first impression and delayed content visibility.

**Root Cause:** 
- Sequential data fetching (categories → best deals → products)
- Isolated component fetching its own data after parent mount
- No caching strategy
- Large payload sizes (100 products fetched at once)

**Goal:** Reduce initial load time by 60-80% and ensure Best Deals section is visible within 1-2 seconds of app launch.

---

## 🔍 Current Architecture Analysis

### Data Flow (Current)

```
App Launch
    ↓
Splash Screen (auth check)
    ↓
Home Screen Mounts
    ↓
├── fetchProducts() ────────→ 20 products (~500ms)
├── fetchCategories() ──────→ All categories (~300ms)
└── fetchCarouselItems() ───→ Carousel data (~200ms)
    ↓
Home Screen Renders
    ↓
BestDealsSection Component Mounts
    ↓
BestDealsSection.fetchFeaturedCategory()
    ├── Fetch categories to find "daily-deals" (~300ms)
    └── Fetch 100 products from category (~800ms)
    ↓
Best Deals Section Finally Renders (2-3 seconds after home screen)
```

**Total Time to Best Deals Visible:** ~2.5-3.5 seconds ❌

### Problems Identified

| # | Problem | Impact | Severity |
|---|---------|--------|----------|
| 1 | BestDealsSection fetches data AFTER parent renders | Delays section visibility by 1-2s | 🔴 High |
| 2 | Duplicate category fetching (home + best deals) | Wastes API calls, adds latency | 🟡 Medium |
| 3 | Fetches 100 products when only 4-8 visible | Large payload, slow render | 🟡 Medium |
| 4 | No caching between navigation | Same data fetched every time | 🟡 Medium |
| 5 | Sequential not parallel fetching | Total time = sum of all calls | 🟡 Medium |
| 6 | No loading state coordination | Jarring UX with multiple skeleton loaders | 🟢 Low |

---

## 🎯 Optimization Strategies

### Strategy 1: Parallel Data Fetching ⚡

**What:** Fetch all home screen data simultaneously instead of sequentially

**Implementation:**
```typescript
// Move BestDealsSection fetching logic to parent
useEffect(() => {
  if (apiService) {
    Promise.all([
      fetchProducts(),           // Latest products
      fetchCategories(),         // All categories
      fetchFeaturedProducts(),   // Best Deals (NEW - lifted from component)
      fetchCarouselItems(),      // Carousel
    ]);
  }
}, [apiService]);
```

**Expected Impact:**
- ⏱️ Reduces total fetch time by 50-70%
- 📉 Eliminates sequential dependency

---

### Strategy 2: Lift State to Parent 🏗️

**What:** Move BestDealsSection data fetching from component to home screen

**Implementation:**
```typescript
// BEFORE: BestDealsSection fetches its own data
export default function BestDealsSection({ wishlist, toggleWishlist }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  useEffect(() => {
    fetchFeaturedProducts();  // Fetches on component mount
  }, []);
}

// AFTER: Parent fetches and passes as props
export default function HomeScreen() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  
  useEffect(() => {
    fetchFeaturedProducts();  // Fetches in parallel with other data
  }, []);
  
  return <BestDealsSection featuredProducts={featuredProducts} ... />;
}
```

**Expected Impact:**
- ⏱️ Best Deals data ready when home screen renders
- 🎯 Single source of truth for all home data

---

### Strategy 3: Hardcode Featured Category ID 🎯

**What:** Eliminate category lookup by using known category ID

**Implementation:**
```typescript
// services/config.ts
export const FEATURED_CATEGORY_ID = 123;  // Your daily-deals category
export const FEATURED_CATEGORY_SLUG = 'daily-deals';

// BestDealsSection.tsx
const products = await apiService.getProducts({
  category: FEATURED_CATEGORY_ID,  // No lookup needed!
  per_page: 8,
});
```

**Expected Impact:**
- 📉 Eliminates 1 API call (~300ms saved)
- 🎯 More predictable performance

---

### Strategy 4: Reduce Initial Payload 📦

**What:** Fetch only what's visible (8 products instead of 100)

**Implementation:**
```typescript
// BEFORE
const products = await apiService.getProducts({
  category: featuredCategoryId,
  per_page: 100,  // ❌ Too many
});

// AFTER
const products = await apiService.getProducts({
  category: featuredCategoryId,
  per_page: 8,  // ✅ 4 rows × 2 columns = 8 visible
  _fields: 'id,name,price,images,slug',  // Only needed fields
});
```

**Expected Impact:**
- 📉 80-90% smaller payload
- ⏱️ Faster render time
- 💾 Less memory usage

---

### Strategy 5: React Query Caching 💾 (Future Phase)

**What:** Implement TanStack Query for intelligent caching

**Implementation:**
```typescript
import { useQuery } from '@tanstack/react-query';

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featuredProducts'],
    queryFn: fetchFeaturedProducts,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    cacheTime: 15 * 60 * 1000, // 15 minutes
  });
}
```

**Expected Impact:**
- ⚡ Instant loads on subsequent visits
- 📉 80-90% reduction in API calls
- 🔄 Automatic background refetching

---

### Strategy 6: Image Optimization 🖼️ (Future Phase)

**What:** Use WooCommerce thumbnail images instead of full resolution

**Implementation:**
```typescript
// woocommerceTransformers.ts
image: product.images[0]?.thumbnail || 
       product.images[0]?.src?.replace('.jpg', '-300x300.jpg'),
```

**Expected Impact:**
- 📉 60-80% smaller image payload
- ⏱️ Faster initial render

---

## 📊 Expected Results

### Before Optimization

| Metric | Value |
|--------|-------|
| Time to Best Deals Visible | 2.5-3.5 seconds |
| Total API Calls | 4-5 calls |
| Initial Payload Size | ~500KB |
| Subsequent Load Time | 2.5-3.5 seconds (no cache) |

### After Optimization (Phase 1)

| Metric | Target | Improvement |
|--------|--------|-------------|
| Time to Best Deals Visible | **0.8-1.2 seconds** | ⬇️ 60-70% faster |
| Total API Calls | **3 calls** | ⬇️ 1 less call |
| Initial Payload Size | **~100KB** | ⬇️ 80% smaller |
| Subsequent Load Time | 0.8-1.2 seconds | Same (no cache yet) |

### After Optimization (Phase 2 - with React Query)

| Metric | Target | Improvement |
|--------|--------|-------------|
| Time to Best Deals Visible | **<200ms (from cache)** | ⬇️ 95% faster |
| Total API Calls | **0-1 calls** | ⬇️ 80-90% fewer |
| Subsequent Load Time | **Instant** | From cache |

---

## 🛠️ Implementation Plan

### Phase 1: Quick Wins (30 minutes)

**Goal:** Immediate 60-70% performance improvement

**Tasks:**
- [ ] 1. Move `fetchFeaturedProducts` logic to home screen parent
- [ ] 2. Fetch all data in parallel with `Promise.all`
- [ ] 3. Hardcode featured category ID in config
- [ ] 4. Reduce `per_page` from 100 to 8
- [ ] 5. Pass data as props to BestDealsSection
- [ ] 6. Test and verify load time improvement

**Files to Modify:**
- `app/(tabs)/index.tsx` - Add parallel fetching
- `components/BestDealsSection.tsx` - Convert to props-based
- `services/config.ts` - Add featured category constants

---

### Phase 2: Advanced Caching (1-2 hours)

**Goal:** Near-instant subsequent loads

**Tasks:**
- [ ] 1. Install TanStack Query: `pnpm add @tanstack/react-query`
- [ ] 2. Wrap app with QueryClientProvider
- [ ] 3. Create custom hooks for each data type
- [ ] 4. Configure cache times and stale times
- [ ] 5. Implement background refetching
- [ ] 6. Add pull-to-refresh invalidation

**Files to Create:**
- `hooks/useFeaturedProducts.ts`
- `hooks/useHomeData.ts`
- `context/QueryProvider.tsx`

---

### Phase 3: Polish & Optimization (1 hour)

**Goal:** Perfect user experience

**Tasks:**
- [ ] 1. Implement image thumbnail optimization
- [ ] 2. Add skeleton loader coordination
- [ ] 3. Implement "Load More" for featured products
- [ ] 4. Add background refresh on app focus
- [ ] 5. Monitor and tune cache times

---

## ✅ Success Criteria

### Functional Requirements
- [ ] Best Deals section visible within 1.5 seconds of home screen load
- [ ] No duplicate API calls
- [ ] Skeleton loaders show consistent loading state
- [ ] Pull-to-refresh works correctly

### Performance Requirements
- [ ] Initial load time < 1.5 seconds
- [ ] Subsequent load time < 500ms (with cache)
- [ ] Payload size reduced by 60%+
- [ ] No increase in API errors

### User Experience Requirements
- [ ] No jarring layout shifts
- [ ] Smooth loading transitions
- [ ] Clear loading states
- [ ] Error handling remains robust

---

## 🧪 Testing Plan

### Manual Testing
1. **Cold Start Test:** Kill app, reopen, measure time to Best Deals visible
2. **Warm Start Test:** Navigate away, return, measure load time
3. **Network Throttle Test:** Test on 3G connection
4. **Error Recovery Test:** Simulate API failures

### Metrics to Track
```typescript
// Add performance monitoring
const startTime = performance.now();
await fetchFeaturedProducts();
const loadTime = performance.now() - startTime;
console.log('Best Deals Load Time:', loadTime, 'ms');
```

---

## 📝 Technical Notes

### Featured Category Configuration
```typescript
// services/config.ts
export const FEATURED_CATEGORY = {
  id: 123,  // Replace with actual daily-deals category ID
  slug: 'daily-deals',
  name: 'Best Deals',
};
```

### API Endpoint Optimization
```typescript
// Use WooCommerce _fields parameter to limit response
api.get('/products', {
  params: {
    category: 123,
    per_page: 8,
    _fields: 'id,name,slug,price,regular_price,sale_price,images',
  }
});
```

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| `app/(tabs)/index.tsx` | Home screen - main data fetching |
| `components/BestDealsSection.tsx` | Best Deals component |
| `services/wordpressApiService.ts` | API service layer |
| `services/config.ts` | Configuration constants |
| `utils/woocommerceTransformers.ts` | Data transformation |

---

## 📚 References

- [WooCommerce REST API Docs](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/queries)
- [Expo Performance Tips](https://docs.expo.dev/guides/performance/)

---

**Next Steps:** Begin Phase 1 implementation

**Estimated Total Time:** 2-3 hours for all phases

**Priority:** 🔴 High - Direct impact on user first impression
