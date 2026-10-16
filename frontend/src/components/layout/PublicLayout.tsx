import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useSettings } from '../../contexts/SettingsContext';

export const PublicLayout: React.FC = () => {
  const { error } = useSettings();
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {error && (
        <div role="alert" className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-900">
          Live agency settings are unavailable. Please verify contact and booking details with support before proceeding.
        </div>
      )}
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
