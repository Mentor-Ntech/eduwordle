/**
 * Mock implementation of @react-native-async-storage/async-storage for browser
 * This prevents webpack errors when MetaMask SDK tries to import React Native modules
 */

// Mock AsyncStorage for browser environment
const AsyncStorage = {
  getItem: async (key: string): Promise<string | null> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key)
    }
    return null
  },
  
  setItem: async (key: string, value: string): Promise<void> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value)
    }
  },
  
  removeItem: async (key: string): Promise<void> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key)
    }
  },
  
  clear: async (): Promise<void> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      localStorage.clear()
    }
  },
  
  getAllKeys: async (): Promise<readonly string[]> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      return Object.keys(localStorage)
    }
    return []
  },
  
  multiGet: async (keys: readonly string[]): Promise<readonly [string, string | null][]> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      return keys.map(key => [key, localStorage.getItem(key)])
    }
    return keys.map(key => [key, null])
  },
  
  multiSet: async (keyValuePairs: readonly [string, string][]): Promise<void> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value)
      })
    }
  },
  
  multiRemove: async (keys: readonly string[]): Promise<void> => {
    // Use localStorage as fallback in browser
    if (typeof window !== 'undefined') {
      keys.forEach(key => localStorage.removeItem(key))
    }
  },
}

export default AsyncStorage

