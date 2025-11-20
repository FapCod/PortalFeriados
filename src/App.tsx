import { HolidayProvider, useHolidayContext } from './context/HolidayContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Filters } from './components/Controls/Filters';
import { AddHolidayButton } from './components/Controls/AddHolidayButton';
import { HolidayList } from './components/Views/HolidayList';
import { HolidayCalendar } from './components/Views/HolidayCalendar';
import './App.css';

/**
 * Main application component wrapper
 */
function AppContent() {
  const { viewMode } = useHolidayContext();

  return (
    <Layout>
      <Filters />
      {viewMode === 'list' ? <HolidayList /> : <HolidayCalendar />}
      <AddHolidayButton />
    </Layout>
  );
}

/**
 * Root application component with context providers
 */
function App() {
  return (
    <AuthProvider>
      <HolidayProvider>
        <AppContent />
      </HolidayProvider>
    </AuthProvider>
  );
}

export default App;


