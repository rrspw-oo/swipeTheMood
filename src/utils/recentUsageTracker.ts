interface UsageRecord {
  value: string;
  lastUsed: number;
  count: number;
}

interface UsageStorage {
  authors: UsageRecord[];
  tags: UsageRecord[];
}

const STORAGE_KEY = 'quoteswipe_recent_usage';
const MAX_RECORDS = 100; // Maximum number of records to keep

// Get usage data from localStorage
const getUsageData = (): UsageStorage => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading usage data:', error);
  }
  return { authors: [], tags: [] };
};

// Save usage data to localStorage
const saveUsageData = (data: UsageStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving usage data:', error);
  }
};

// Update usage record
const updateRecord = (records: UsageRecord[], value: string): UsageRecord[] => {
  const existingIndex = records.findIndex(r => r.value === value);
  const now = Date.now();

  if (existingIndex >= 0) {
    // Update existing record
    const updated = [...records];
    updated[existingIndex] = {
      value,
      lastUsed: now,
      count: updated[existingIndex].count + 1
    };
    return updated;
  } else {
    // Add new record
    const newRecord: UsageRecord = {
      value,
      lastUsed: now,
      count: 1
    };
    return [...records, newRecord];
  }
};

// Trim records to MAX_RECORDS by removing least used
const trimRecords = (records: UsageRecord[]): UsageRecord[] => {
  if (records.length <= MAX_RECORDS) {
    return records;
  }

  // Sort by count descending, then by lastUsed descending
  const sorted = [...records].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.lastUsed - a.lastUsed;
  });

  return sorted.slice(0, MAX_RECORDS);
};

// Sort records by recent usage
const sortByRecentUsage = (records: UsageRecord[]): string[] => {
  return [...records]
    .sort((a, b) => {
      // First sort by last used time (most recent first)
      const timeDiff = b.lastUsed - a.lastUsed;

      // If used within 24 hours of each other, sort by count
      if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) {
        return b.count - a.count;
      }

      return timeDiff;
    })
    .map(r => r.value);
};

// Sort array by usage data, maintaining items not in usage data at the end
export const sortByUsageData = (items: string[], records: UsageRecord[]): string[] => {
  const recordMap = new Map(records.map(r => [r.value, r]));

  const tracked: { item: string; record: UsageRecord }[] = [];
  const untracked: string[] = [];

  items.forEach(item => {
    const record = recordMap.get(item);
    if (record) {
      tracked.push({ item, record });
    } else {
      untracked.push(item);
    }
  });

  // Sort tracked items by recent usage
  tracked.sort((a, b) => {
    const timeDiff = b.record.lastUsed - a.record.lastUsed;
    if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) {
      return b.record.count - a.record.count;
    }
    return timeDiff;
  });

  // Combine: tracked items first (sorted), then untracked (original order)
  return [...tracked.map(t => t.item), ...untracked];
};

// Track author usage
export const trackAuthorUsage = (author: string): void => {
  if (!author || !author.trim()) {
    return;
  }

  const data = getUsageData();
  const trimmedAuthor = author.trim();

  data.authors = updateRecord(data.authors, trimmedAuthor);
  data.authors = trimRecords(data.authors);

  saveUsageData(data);
};

// Track tag usage
export const trackTagUsage = (tag: string): void => {
  if (!tag || !tag.trim()) {
    return;
  }

  const data = getUsageData();
  const trimmedTag = tag.trim();

  data.tags = updateRecord(data.tags, trimmedTag);
  data.tags = trimRecords(data.tags);

  saveUsageData(data);
};

// Get recent authors sorted by usage
export const getRecentAuthors = (): string[] => {
  const data = getUsageData();
  return sortByRecentUsage(data.authors);
};

// Get recent tags sorted by usage
export const getRecentTags = (): string[] => {
  const data = getUsageData();
  return sortByRecentUsage(data.tags);
};

// Get author usage records (for internal use)
export const getAuthorRecords = (): UsageRecord[] => {
  const data = getUsageData();
  return data.authors;
};

// Get tag usage records (for internal use)
export const getTagRecords = (): UsageRecord[] => {
  const data = getUsageData();
  return data.tags;
};

// Clear all usage data
export const clearUsageData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing usage data:', error);
  }
};
