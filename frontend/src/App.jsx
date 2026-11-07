import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider.jsx";
import { PageLoader } from "./components/ui/PageLoader.jsx";

// A landing e a rota mais acessada: carregada de forma estatica para o 1o paint ser imediato.
import { BookingPage } from "./pages/BookingPage.jsx";

// Demais rotas em chunks separados (code splitting) — baixadas sob demanda.
const ClientLoginPage = React.lazy(() => import("./pages/ClientLoginPage.jsx").then((m) => ({ default: m.ClientLoginPage })));
const RegisterPage = React.lazy(() => import("./pages/RegisterPage.jsx").then((m) => ({ default: m.RegisterPage })));
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage.jsx").then((m) => ({ default: m.ResetPasswordPage })));
const ClientDashboard = React.lazy(() => import("./pages/ClientDashboard.jsx").then((m) => ({ default: m.ClientDashboard })));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage.jsx").then((m) => ({ default: m.ProfilePage })));
const HistoryPage = React.lazy(() => import("./pages/HistoryPage.jsx").then((m) => ({ default: m.HistoryPage })));
const NotificationsPage = React.lazy(() => import("./pages/NotificationsPage.jsx").then((m) => ({ default: m.NotificationsPage })));
const LoginPage = React.lazy(() => import("./pages/LoginPage.jsx").then((m) => ({ default: m.LoginPage })));
const AdminPage = React.lazy(() => import("./pages/AdminPage.jsx").then((m) => ({ default: m.AdminPage })));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage.jsx").then((m) => ({ default: m.PrivacyPolicyPage })));
const TermsPage = React.lazy(() => import("./pages/TermsPage.jsx").then((m) => ({ default: m.TermsPage })));

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireStaff({ children }) {
  const { user, loading, hasRole } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!hasRole("OWNER", "ADMIN")) return <Navigate to="/conta" replace />;
  return children;
}

export function App() {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/login" element={<ClientLoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
        <Route path="/conta" element={<RequireAuth><ClientDashboard /></RequireAuth>} />
        <Route path="/conta/perfil" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/conta/historico" element={<RequireAuth><HistoryPage /></RequireAuth>} />
        <Route path="/conta/notificacoes" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin" element={<RequireStaff><AdminPage /></RequireStaff>} />
        <Route path="/privacidade" element={<PrivacyPolicyPage />} />
        <Route path="/termos" element={<TermsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </React.Suspense>
  );
}
