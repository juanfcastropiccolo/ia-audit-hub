
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from '@/contexts/AuthContext';

import AuthLayout from '@/layouts/AuthLayout';
import ClientLayout from '@/layouts/ClientLayout';
import AdminLayout from '@/layouts/AdminLayout';

import Index from "@/pages/Index";
import LoginPage from '@/pages/auth/LoginPage';
import ChatPage from '@/pages/client/ChatPage';
import ClientsPage from '@/pages/admin/ClientsPage';
import LogsPage from '@/pages/admin/LogsPage';
import NotFound from "@/pages/NotFound";

// Import i18n
import '@/i18n/i18n';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />

            {/* Auth Routes */}
            <Route path="/login" element={<AuthLayout />}>
              <Route index element={<LoginPage />} />
            </Route>

            {/* Client Routes */}
            <Route path="/client" element={<ClientLayout />}>
              <Route path="chat" element={<ChatPage />} />
              <Route index element={<Navigate to="/client/chat" replace />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="clients" element={<ClientsPage />} />
              <Route path="logs" element={<LogsPage />} />
              <Route index element={<Navigate to="/admin/clients" replace />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
