import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import BookToken from './pages/BookToken';
import QueueStatus from './pages/QueueStatus';
import History from './pages/History';
import AdminDashboard from './pages/AdminDashboard';
import './index.css';

const AppContent = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('smartq_dark_mode');
    return saved === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('smartq_dark_mode', darkMode);
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#11111b] text-[#cdd6f4]' : 'bg-[#f9fafb] text-[#111827]'}`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Landing />} />
          <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute><BookToken /></ProtectedRoute>} />
          <Route path="/queue" element={<ProtectedRoute><QueueStatus /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/services" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
