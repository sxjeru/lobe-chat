import { merge as _merge, isEmpty, mergeWith } from 'es-toolkit/compat';

/**
 * Merge objects, directly replace if it's an array
 * @param target
 * @param source
 */
export const merge: typeof _merge = <T = object>(target: T, source: T) =>
  mergeWith({}, target, source, (obj, src) => {
    if (Array.isArray(obj)) return src;
  });

type MergeableItem = {
  [key: string]: any;
  id: string;
};

/**
 * Merge two arrays based on id, preserving metadata from default items.
 * Output order follows defaultItems order by default. When user items contain
 * a numeric `sort` field, those items are ordered by sort value and unsorted
 * items are intelligently inserted based on their default position.
 * @param defaultItems Items with default configuration and metadata
 * @param userItems User-defined items with higher priority
 */
export const mergeArrayById = <T extends MergeableItem>(defaultItems: T[], userItems: T[]): T[] => {
  // Build default items lookup with original index
  const defaultItemsMap = new Map<string, { index: number; item: T }>();
  defaultItems.forEach((item, index) => {
    if (item?.id) {
      defaultItemsMap.set(item.id, { index, item });
    }
  });

  // Check if any user item has a custom sort value
  const hasCustomSort = userItems.some((item) => {
    const sortValue = (item as any)?.sort;
    return typeof sortValue === 'number' && Number.isFinite(sortValue);
  });

  // Merge user items with default metadata
  const mergedMap = new Map<string, { defaultIndex?: number; item: T; userSort?: number }>();

  userItems.forEach((userItem) => {
    const defaultMeta = defaultItemsMap.get(userItem.id);

    if (!defaultMeta) {
      // User-only item (not in defaults)
      const sortValue = (userItem as any)?.sort;
      const userSort =
        typeof sortValue === 'number' && Number.isFinite(sortValue) ? sortValue : undefined;
      mergedMap.set(userItem.id, { item: userItem, userSort });
      return;
    }

    // Merge: start from default, overlay user values
    const mergedItem: T = { ...defaultMeta.item };
    Object.entries(userItem).forEach(([key, value]) => {
      if (value !== null && value !== undefined && !(typeof value === 'object' && isEmpty(value))) {
        // @ts-expect-error
        mergedItem[key] = value;
      }

      if (typeof value === 'object' && !isEmpty(value)) {
        // @ts-expect-error
        mergedItem[key] = merge(defaultMeta.item[key], value);
      }
    });

    const sortValue = (userItem as any)?.sort;
    const userSort =
      typeof sortValue === 'number' && Number.isFinite(sortValue) ? sortValue : undefined;

    mergedMap.set(userItem.id, {
      defaultIndex: defaultMeta.index,
      item: mergedItem,
      userSort,
    });
  });

  // Add default-only items (not touched by user)
  defaultItems.forEach((item, index) => {
    if (!item?.id) return;
    if (!mergedMap.has(item.id)) {
      mergedMap.set(item.id, { defaultIndex: index, item: { ...item } as T });
    }
  });

  const entries = Array.from(mergedMap.values());

  if (hasCustomSort) {
    // --- Custom sort mode: respect user's drag-sorted order ---
    const sortedEntries = entries.filter((e) => typeof e.userSort === 'number');
    const unsortedEntries = entries.filter((e) => typeof e.userSort !== 'number');

    // Sort by user sort value, break ties by default index
    sortedEntries.sort((a, b) => {
      const sortDiff = (a.userSort as number) - (b.userSort as number);
      if (sortDiff !== 0) return sortDiff;
      if (typeof a.defaultIndex === 'number' && typeof b.defaultIndex === 'number') {
        return a.defaultIndex - b.defaultIndex;
      }
      return 0;
    });

    const sortedItems = sortedEntries.map((e) => e.item);
    const sortedIds = new Set(sortedEntries.map((e) => e.item.id));

    // Insert unsorted items at intelligent positions based on default neighbors
    const prependItems: T[] = [];
    unsortedEntries.forEach((entry) => {
      if (typeof entry.defaultIndex !== 'number') {
        prependItems.push(entry.item);
        return;
      }

      let insertIndex = -1;

      // Look forward in default order for a sorted neighbor
      for (let i = entry.defaultIndex + 1; i < defaultItems.length; i++) {
        const neighborId = defaultItems[i]?.id;
        if (neighborId && sortedIds.has(neighborId)) {
          insertIndex = sortedItems.findIndex((item) => item.id === neighborId);
          break;
        }
      }

      // Look backward if not found
      if (insertIndex === -1) {
        for (let i = entry.defaultIndex - 1; i >= 0; i--) {
          const neighborId = defaultItems[i]?.id;
          if (neighborId && sortedIds.has(neighborId)) {
            insertIndex = sortedItems.findIndex((item) => item.id === neighborId) + 1;
            break;
          }
        }
      }

      if (insertIndex === -1) {
        prependItems.push(entry.item);
      } else {
        sortedItems.splice(insertIndex, 0, entry.item);
      }
    });

    return [...prependItems, ...sortedItems];
  } else {
    // --- Default mode: preserve defaultItems order ---
    const result: T[] = [];
    const addedIds = new Set<string>();

    // Add items in defaultItems order
    defaultItems.forEach((defaultItem) => {
      if (!defaultItem?.id || addedIds.has(defaultItem.id)) return;
      const entry = mergedMap.get(defaultItem.id);
      if (entry) {
        addedIds.add(defaultItem.id);
        result.push(entry.item);
      }
    });

    // Append user-only items (not in defaults)
    entries.forEach((entry) => {
      if (typeof entry.defaultIndex !== 'number') {
        result.push(entry.item);
      }
    });

    return result;
  }
};
