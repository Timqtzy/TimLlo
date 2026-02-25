import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.js';
import ProtectedRoute from './components/auth/ProtectedRoute.js';
import HomePage from './pages/HomePage.js';
import BoardPage from './pages/BoardPage.js';
import LoginPage from './pages/LoginPage.js';
import RegisterPage from './pages/RegisterPage.js';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
