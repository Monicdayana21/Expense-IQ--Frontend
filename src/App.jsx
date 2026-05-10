import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Savings from './pages/Savings';
import Settings from './pages/Settings';
import './index.css';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="app-layout">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <div className={`main-content ${isCollapsed ? 'collapsed' : ''}`}>
        <Navbar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
          theme={theme} 
          onThemeToggle={toggleTheme} 
        />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/savings" element={<Savings />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { token } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={token ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/*" element={<ProtectedRoute><AppLayout /></ProtectedRoute>} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#ffffff', color: '#0f172a', border: '1px solid rgba(15,23,42,0.08)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }
        }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
