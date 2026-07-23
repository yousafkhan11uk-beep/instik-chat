import { OfflineMediaItem } from '../types/index.js';

const STORAGE_KEY = 'mok_offline_media_items_v1';

export const offlineStorage = {
  getItems(): OfflineMediaItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return this.getInitialSampleData();
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading offline storage', e);
      return [];
    }
  },

  getInitialSampleData(): OfflineMediaItem[] {
    const samples: OfflineMediaItem[] = [
      {
        id: 'off_1',
        title: 'Cinematic Mountain Drone Tour',
        category: 'video',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        fileSize: 14200000, // ~14.2 MB
        duration: '0:15',
        addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=80',
        isFavorite: true,
      },
      {
        id: 'off_2',
        title: 'Sunset Beach High-Res Photo',
        category: 'photo',
        url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
        fileSize: 3400000, // ~3.4 MB
        addedAt: new Date(Date.now() - 86400000).toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
        isFavorite: false,
      },
      {
        id: 'off_3',
        title: 'Midnight Lo-Fi Beat Master.mp3',
        category: 'audio',
        url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
        fileSize: 8500000, // ~8.5 MB
        duration: '2:30',
        addedAt: new Date().toISOString(),
        thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        isFavorite: true,
      },
    ];
    this.saveItems(samples);
    return samples;
  },

  saveItems(items: OfflineMediaItem[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save offline media items', e);
    }
  },

  addItem(item: Omit<OfflineMediaItem, 'id' | 'addedAt'>): OfflineMediaItem {
    const items = this.getItems();
    const newItem: OfflineMediaItem = {
      ...item,
      id: `off_${Date.now()}`,
      addedAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    this.saveItems(items);
    return newItem;
  },

  deleteItem(id: string) {
    const items = this.getItems().filter((i) => i.id !== id);
    this.saveItems(items);
  },

  deleteMultiple(ids: string[]) {
    const items = this.getItems().filter((i) => !ids.includes(i.id));
    this.saveItems(items);
  },

  deleteAll() {
    this.saveItems([]);
  },

  toggleFavorite(id: string) {
    const items = this.getItems();
    const target = items.find((i) => i.id === id);
    if (target) {
      target.isFavorite = !target.isFavorite;
      this.saveItems(items);
    }
  },

  getStorageUsage() {
    const items = this.getItems();
    const usedBytes = items.reduce((sum, item) => sum + item.fileSize, 0);
    const totalBytes = 5 * 1024 * 1024 * 1024; // 5 GB simulated limit
    return {
      usedBytes,
      totalBytes,
      usedFormatted: (usedBytes / (1024 * 1024)).toFixed(1) + ' MB',
      totalFormatted: '5.0 GB',
      percentage: Math.min(100, (usedBytes / totalBytes) * 100).toFixed(1),
    };
  },
};
