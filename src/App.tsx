import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { queryClient } from '@/lib/queryClient';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import LeadsPage from '@/pages/LeadsPage';
import ScraperPage from '@/pages/ScraperPage';
import EnrichmentPage from '@/pages/EnrichmentPage';
import EmailPage from '@/pages/EmailPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
          <Route path="/scraper" element={<ProtectedRoute><ScraperPage /></ProtectedRoute>} />
          <Route path="/enrichment" element={<ProtectedRoute><EnrichmentPage /></ProtectedRoute>} />
          <Route path="/emails" element={<ProtectedRoute><EmailPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </QueryClientProvider>
);

export default App;
