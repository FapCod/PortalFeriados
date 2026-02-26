import React, { Suspense } from 'react';
import { HolidayProvider } from './context/HolidayContext';
import { useHolidayStore } from './store/useHolidayStore';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Filters } from './features/holidays/components/Controls/Filters';
import './App.css';

// Lazy load view components
const HolidayList = React.lazy(() => import('./features/holidays/components/Views/HolidayList').then(module => ({ default: module.HolidayList })));
const HolidayCalendar = React.lazy(() => import('./features/holidays/components/Views/HolidayCalendar').then(module => ({ default: module.HolidayCalendar })));

/**
 * Main application component wrapper
 */
function AppContent() {
  const { viewMode } = useHolidayStore();

  return (
    <Layout>
      <Filters />
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando vista...</div>}>
        {viewMode === 'list' ? <HolidayList /> : <HolidayCalendar />}
      </Suspense>
    </Layout>
  );
}

import { ThemeProvider } from './context/ThemeContext';

/**
 * Root application component with context providers
 */
function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HolidayProvider>
          <AppContent />
        </HolidayProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;


