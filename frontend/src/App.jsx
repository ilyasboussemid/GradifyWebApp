import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PageLayout from './components/layout/PageLayout';
import Home from './pages/Home';
import OfferSearch from './pages/OfferSearch';
import OfferDetail from './pages/OfferDetail';
import StudentProfile from './pages/StudentProfile';
import SparqlExplorer from './pages/SparqlExplorer';
import Vocabularies from './pages/Vocabularies';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import ShaclReport from './pages/admin/ShaclReport';

/**
 * Route protégée : redirige vers /login si pas authentifié
 * ou si le rôle requis ne correspond pas.
 */
function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PageLayout><Home /></PageLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/offres" element={<PageLayout><OfferSearch /></PageLayout>} />
      <Route path="/offres/:id" element={<PageLayout><OfferDetail /></PageLayout>} />
      <Route path="/etudiants/:id" element={<PageLayout><StudentProfile /></PageLayout>} />
      <Route path="/sparql" element={<PageLayout><SparqlExplorer /></PageLayout>} />
      <Route path="/vocabulaires" element={<PageLayout><Vocabularies /></PageLayout>} />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="ADMIN">
          <PageLayout><AdminDashboard /></PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/shacl" element={
        <ProtectedRoute requiredRole="ADMIN">
          <PageLayout><ShaclReport /></PageLayout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
