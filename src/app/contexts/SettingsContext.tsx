"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Settings {
  gns3ServerIp: string;
  gns3ServerPort: number;
  gns3Username: string;
  gns3Password: string;
  defaultProjectName: string;
  defaultScriptPath: string;
  priorityDelay: number;
  // Student identification
  studentName: string;
  // Track if user has configured required settings
  isConfigured: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  gns3ServerIp: "",
  gns3ServerPort: 80,
  gns3Username: "gns3",
  gns3Password: "gns3",
  defaultProjectName: "",
  defaultScriptPath: "/tmp/script.sh",
  priorityDelay: 3.0,
  studentName: "",
  isConfigured: false,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
  isSettingsValid: () => boolean;
  getSanitizedStudentName: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY = "ae3gis_settings";

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    }
  }, [settings, mounted]);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings((prev) => {
      const newSettings = { ...prev, ...updates };
      // Auto-mark as configured if required fields are filled
      if (newSettings.gns3ServerIp.trim()) {
        newSettings.isConfigured = true;
      }
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const isSettingsValid = () => {
    return settings.gns3ServerIp.trim().length > 0;
  };

  const getSanitizedStudentName = () => {
    return settings.studentName.toLowerCase().trim().replace(/\s+/g, "_");
  };

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, resetSettings, isSettingsValid, getSanitizedStudentName }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // Return default values during SSR/SSG
    return {
      settings: DEFAULT_SETTINGS,
      updateSettings: () => {},
      resetSettings: () => {},
      isSettingsValid: () => false,
      getSanitizedStudentName: () => "",
    };
  }
  return context;
}
