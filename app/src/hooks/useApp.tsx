// Global app context for state management
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { UxMode, ScreenKey, Preferences, ChatMessage, MemoryItem } from '../types';
import { UX_MODE_KEY, MEMORY_KEY, CHAT_KEY, PREFS_KEY, defaultPreferences } from '@utils/constants';

interface AppContextType {
  currentScreen: ScreenKey;
  navigateToScreen: (screen: ScreenKey) => void;
  uxMode: UxMode;
  setUxMode: (mode: UxMode) => void;
  preferences: Preferences;
  setPreferences: (prefs: Preferences) => void;
  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;
  memory: MemoryItem[];
  addMemoryItem: (item: MemoryItem) => void;
  userId: string;
  isFullMode: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>('dashboard');
  const [uxMode, setUxModeState] = useState<UxMode>(() => {
    return (localStorage.getItem(UX_MODE_KEY) as UxMode) || 'calm';
  });
  
  const [preferences, setPreferencesState] = useState<Preferences>(() => {
    const saved = localStorage.getItem(PREFS_KEY);
    return saved ? JSON.parse(saved) : defaultPreferences;
  });
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(CHAT_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [memory, setMemory] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem(MEMORY_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const navigateToScreen = useCallback((screen: ScreenKey) => {
    setCurrentScreen(screen);
  }, []);

  const setUxMode = useCallback((mode: UxMode) => {
    setUxModeState(mode);
    localStorage.setItem(UX_MODE_KEY, mode);
  }, []);

  const setPreferences = useCallback((prefs: Preferences) => {
    setPreferencesState(prefs);
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatHistory(prev => {
      const updated = [...prev, msg];
      localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
    localStorage.removeItem(CHAT_KEY);
  }, []);

  const addMemoryItem = useCallback((item: MemoryItem) => {
    setMemory(prev => {
      const updated = [...prev, item];
      localStorage.setItem(MEMORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isFullMode = uxMode === 'full';

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        navigateToScreen,
        uxMode,
        setUxMode,
        preferences,
        setPreferences,
        chatHistory,
        addChatMessage,
        clearChatHistory,
        memory,
        addMemoryItem,
        userId: "demo-user-nepal",
        isFullMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
