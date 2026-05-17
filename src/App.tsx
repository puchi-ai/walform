import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Results from './pages/Results';
import PublicForm from './pages/PublicForm';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/useAuthStore';
import { useThemeStore } from './store/useThemeStore';
import { SuiWalletSync } from './components/SuiWalletSync';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth" />;
  return <>{children}</>;
};

export default function App() {
  const { mode } = useThemeStore();

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [mode]);

  return (
    <Router>
      <Toaster position="top-right" richColors closeButton />
      <SuiWalletSync />
      <div className="relative min-h-screen bg-background text-foreground font-sans flex flex-col transition-colors duration-300">
        {/* Global Background Blobs from Frosted Glass Theme */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 rounded-full blur-[140px]"></div>
          <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/f/:id" element={<PublicForm />} />
            <Route path="/p/:id" element={<PublicForm preview />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder/:id" element={<ProtectedRoute><Builder /></ProtectedRoute>} />
            <Route path="/builder/new" element={<ProtectedRoute><Builder isNew /></ProtectedRoute>} />
            <Route path="/analytics/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
