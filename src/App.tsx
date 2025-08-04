import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { AuthForm } from './components/Auth/AuthForm';
import { Dashboard } from './components/Dashboard/Dashboard';

const AuthWrapper: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  return (
    <AuthForm 
      mode={authMode} 
      onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
    />
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading WebGIS AI Platform...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/dashboard" replace /> : <AuthWrapper />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/"
          element={<Navigate to={user ? "/dashboard" : "/auth"} replace />}
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="app">
          <AppContent />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1e293b',
                color: '#f1f5f9',
                border: '1px solid #334155'
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f1f5f9'
                }
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f1f5f9'
                }
              }
            }}
          />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;