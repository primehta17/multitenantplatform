import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './router/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPlansPage from './pages/admin/PlansPage';
import UsersPage from './pages/admin/UsersPage';
import MemberPlansPage from './pages/member/PlansPage';
import InvoicesPage from './pages/member/InvoicesPage';
import Navbar from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/admin" element={<ProtectedRoute role="OrgAdmin"><Navbar /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/plans" replace />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>

          <Route path="/member" element={<ProtectedRoute><Navbar /></ProtectedRoute>}>
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
