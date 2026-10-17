// WooCommerce's REST API search has no relevance ordering (orderby=relevance
// is rejected - 'date, id, include, title, slug, modified, menu_order, price,
// popularity, rating' are the only allowed values) and matches anywhere in
// the product description, so raw results are frequently unrelated noise
// sorted by recency. This re-ranks and filters results client-side instead.

function tokenize(value: string): string[] {
  return (value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}

export function rankSearchResults<T extends { title?: string; category?: string; description?: string }>(
  products: T[],
  rawQuery: string
): T[] {
  const queryLower = rawQuery.trim().toLowerCase();
  const queryTokens = Array.from(new Set(tokenize(rawQuery)));
  if (queryTokens.length === 0) {
    return products;
  }

  const scored = products.map((product, index) => {
    const title = (product.title || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const titleTokens = tokenize(title);
    const categoryTokens = tokenize(category);

    let score = 0;
    let isRelevant = false;

    if (queryLower.length > 0 && title.includes(queryLower)) {
      score += 100;
      isRelevant = true;
    }

    const titleHits = queryTokens.filter((qt) =>
      titleTokens.some((tt) => tt === qt || tt.startsWith(qt) || qt.startsWith(tt))
    ).length;
    if (titleHits > 0) {
      isRelevant = true;
      score += 50 * (titleHits / queryTokens.length);
      if (titleHits === queryTokens.length) score += 20;
    }

    const categoryHits = queryTokens.filter((qt) =>
      categoryTokens.some((ct) => ct === qt || ct.startsWith(qt))
    ).length;
    if (categoryHits > 0) {
      isRelevant = true;
      score += 15 * (categoryHits / queryTokens.length);
    }

    // Description-only matches are a weak signal (often just an incidental
    // mention) - they nudge ordering but never qualify a result on their own.
    const descriptionHits = queryTokens.filter((qt) => description.includes(qt)).length;
    score += 2 * (descriptionHits / queryTokens.length);

    return { product, score, isRelevant, index };
  });

  const relevant = scored.filter((s) => s.isRelevant);
  // Fall back to the unfiltered set rather than show "no results" when the
  // server found matches but none of them hit title/category - still ranked.
  const pool = relevant.length > 0 ? relevant : scored;

  return pool
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((s) => s.product);
}
