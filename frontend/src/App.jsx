import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<div>Register Page - Phase 2</div>} />
        <Route path="/login" element={<div>Login Page - Phase 2</div>} />
        <Route path="/admin/*" element={<div>Admin Area - Phase 3+</div>} />
        <Route path="/member/*" element={<div>Member Area - Phase 4+</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
