import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Dashboard } from './components/layout/Dashboard';
import { LoginScreen } from './components/auth/LoginScreen';
import { UniversitySelectionScreen, University, UNIVERSITIES } from './components/auth/UniversitySelectionScreen';

const MainAppRouter: React.FC = () => {
  const { isAuthenticated } = useApp();
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(() => {
    try {
      const savedUniId = localStorage.getItem('clindent_selected_university_id');
      if (savedUniId) {
        const found = UNIVERSITIES.find((u) => u.id === savedUniId);
        if (found) return found;
      }
      return null;
    } catch {
      return null;
    }
  });

  const handleSelectUniversity = (uni: University) => {
    setSelectedUniversity(uni);
    try {
      localStorage.setItem('clindent_selected_university_id', uni.id);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleChangeUniversity = () => {
    setSelectedUniversity(null);
    try {
      localStorage.removeItem('clindent_selected_university_id');
    } catch (e) {
      console.warn(e);
    }
  };

  if (!isAuthenticated) {
    if (!selectedUniversity) {
      return <UniversitySelectionScreen onSelectUniversity={handleSelectUniversity} />;
    }
    return (
      <LoginScreen
        selectedUniversity={selectedUniversity}
        onChangeUniversity={handleChangeUniversity}
      />
    );
  }

  return <Dashboard />;
};

export default function App() {
  return (
    <AppProvider>
      <MainAppRouter />
    </AppProvider>
  );
}
