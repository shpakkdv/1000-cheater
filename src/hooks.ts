import { useEffect } from "react";

export function useLocalStorage<F extends (storage: D) => void, D>(restoreData: F, dataToSave: D, key: string): void {
  // Restore data after page loading
  useEffect(() => {
    const store = localStorage.getItem(key);

    if (store) {
      try {
        restoreData(JSON.parse(store));
      } catch {
        console.warn(`Cannot restore data from '${key}'.`);
      }
    }
  }, [restoreData, key]);

  // Set data to the storage when changed
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(dataToSave));
  }, [dataToSave, key]);
}
