// Wrapper for chrome.storage.local with localStorage fallback for local development/testing

export const getStorageData = async (keys: string[]): Promise<Record<string, any>> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  } else {
    const result: Record<string, any> = {};
    for (const key of keys) {
      const val = localStorage.getItem(key);
      if (val !== null) {
        try {
          result[key] = JSON.parse(val);
        } catch {
          result[key] = val;
        }
      }
    }
    return result;
  }
};

export const setStorageData = async (data: Record<string, any>): Promise<void> => {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        resolve();
      });
    });
  } else {
    for (const [key, val] of Object.entries(data)) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  }
};
