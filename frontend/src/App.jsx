import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import TeamDashboard from './pages/TeamDashboard';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import './App.css';

import { UIProvider, useUI } from './context/UIContext';
import AuthDrawer from './components/AuthDrawer';

// Layout wrapper to conditionally show sidebar
function AppLayout({ children }) {
  const location = useLocation();
  const publicRoutes = ['/'];
  const showSidebar = !publicRoutes.includes(location.pathname);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { isAuthDrawerOpen, closeAuthDrawer, authDrawerMode } = useUI();

  return (
    <div className={`app ${showSidebar ? 'app-dashboard' : 'app-public'}`}>
      {showSidebar ? (
        <>
          <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
          <main className={`app-main ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            {children}
          </main>
        </>
      ) : (
        <>
          <Navbar />
          {children}
        </>
      )}

      <AuthDrawer
        isOpen={isAuthDrawerOpen}
        onClose={closeAuthDrawer}
        initialMode={authDrawerMode}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UIProvider>
          <Router>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <ProtectedRoute>
                      <History />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute>
                      <TeamDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppLayout>
          </Router>
        </UIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
