import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPlansPage from './pages/admin/PlansPage';
import AdminInvoicesPage from './pages/admin/InvoicesPage';
import UsersPage from './pages/admin/UsersPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import MemberPlansPage from './pages/member/PlansPage';
import InvoicesPage from './pages/member/InvoicesPage';
import AdminLayout from './components/AdminLayout';
import MemberLayout from './components/MemberLayout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<ProtectedRoute role="OrgAdmin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/plans" replace />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="invoices" element={<AdminInvoicesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>

          <Route path="/member" element={<ProtectedRoute><MemberLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/member/plans" replace />} />
            <Route path="plans" element={<MemberPlansPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
