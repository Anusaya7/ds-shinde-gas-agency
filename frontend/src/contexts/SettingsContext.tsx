import React, { createContext, useContext, useState, useEffect } from 'react';
import { AgencySettings } from '../types';
import { adminService, fallbackSettings } from '../services/admin.service';

interface SettingsContextType {
  settings: AgencySettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: fallbackSettings,
  loading: false,
  error: null,
  refreshSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AgencySettings>(fallbackSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setError(null);
    try {
      const data = await adminService.getPublicSettings();
      setSettings(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Public agency settings could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
