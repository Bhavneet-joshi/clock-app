import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache for AsyncStorage values
const memoryCache: Record<string, any> = {};
const cacheTTL = 60000; // 1 minute TTL for cache entries
const cacheTimestamps: Record<string, number> = {};

/**
 * A hook that provides cached access to AsyncStorage
 * This significantly reduces I/O operations and improves performance
 */
export function useAsyncStorageCache(key: string, initialValue: any = null) {
  const [data, setData] = useState(
    // Initialize from cache if available, otherwise use initialValue
    memoryCache[key] !== undefined ? memoryCache[key] : initialValue
  );
  const [loading, setLoading] = useState(memoryCache[key] === undefined);
  const [error, setError] = useState<Error | null>(null);

  // Load data from AsyncStorage
  const loadData = useCallback(async () => {
    if (memoryCache[key] !== undefined) {
      const now = Date.now();
      // Check if cache is still valid
      if (now - (cacheTimestamps[key] || 0) < cacheTTL) {
        setData(memoryCache[key]);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      const value = jsonValue != null ? JSON.parse(jsonValue) : initialValue;
      
      // Update memory cache
      memoryCache[key] = value;
      cacheTimestamps[key] = Date.now();
      
      setData(value);
      setError(null);
    } catch (e) {
      console.error(`Error loading data for key "${key}":`, e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  // Save data to AsyncStorage
  const saveData = useCallback(async (newValue: any) => {
    setLoading(true);
    try {
      // Update state and cache immediately
      setData(newValue);
      memoryCache[key] = newValue;
      cacheTimestamps[key] = Date.now();
      
      // Perform storage operation asynchronously
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem(key, jsonValue);
      setError(null);
    } catch (e) {
      console.error(`Error saving data for key "${key}":`, e);
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [key]);

  // Load data on initial mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, loading, error, loadData, saveData };
} 