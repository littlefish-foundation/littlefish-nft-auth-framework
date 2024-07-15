const inMemoryStorage: Record<string, string> = {};

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return inMemoryStorage[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      inMemoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      delete inMemoryStorage[key];
    }
  },
};