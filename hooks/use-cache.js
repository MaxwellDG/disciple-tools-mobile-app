import { useCallback } from "react";
import { SWRConfig, useSWRConfig } from "swr";
import ExpoFileSystemStorage from "redux-persist-expo-filesystem";

/**
 * Abstracts the in-memory (SWR) and device storage (Redux-Persist) cache
 */
const useCache = () => {
  const { cache, mutate } = useSWRConfig();

  /**
   * When user "backgrounds" the app, persist the in-memory cache (SWR)
   * to device storage (via Redux).
   */
  const onAppBackgroundCallback = useCallback(async () => {
    const inMemoryCacheMap = SWRConfig.default.cache;
    const cacheObj = Object.fromEntries(inMemoryCacheMap);
    await ExpoFileSystemStorage.setItem("cache", JSON.stringify(cacheObj));
  }, []);

  /**
   * When user "foregrounds" the app, rehydrate the in-memory cache.
   */
  const onAppForegroundCallback = useCallback(async () => {
    let cacheObj;
    try {
      const cacheStr = await ExpoFileSystemStorage.getItem("cache");
      cacheObj = JSON.parse(cacheStr);
    } catch (error) {
      console.error(error);
    }
    if (cacheObj) {
      const persistentCacheMap = new Map(Object.entries(cacheObj));
      if (
        persistentCacheMap &&
        (persistentCacheMap?.size > 0 ||
          Object.keys(persistentCacheMap)?.length > 0)
      ) {
        for (var [key, value] of persistentCacheMap.entries()) {
          cache.set(key, value);
        }
      }
    }
  }, []);

  return {
    cache,
    mutate,
    onAppBackgroundCallback,
    onAppForegroundCallback,
  };
};
export default useCache;
