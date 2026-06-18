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
import SignUp from './pages/SignUp';
import AdminDashboard from './pages/admin/Dashboard';
import ShaclReport from './pages/admin/ShaclReport';
import MyOffers from './pages/enterprise/MyOffers';
import CreateOffer from './pages/enterprise/CreateOffer';
import Applications from './pages/enterprise/Applications';

function ProtectedRoute({ children, requiredRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PageLayout><Home /></PageLayout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/offres" element={<PageLayout><OfferSearch /></PageLayout>} />
      <Route path="/offres/:id" element={<PageLayout><OfferDetail /></PageLayout>} />
      <Route path="/etudiants/:id" element={<PageLayout><StudentProfile /></PageLayout>} />
      <Route path="/sparql" element={<PageLayout><SparqlExplorer /></PageLayout>} />
      <Route path="/vocabulaires" element={<PageLayout><Vocabularies /></PageLayout>} />

      <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><PageLayout><AdminDashboard /></PageLayout></ProtectedRoute>} />
      <Route path="/admin/shacl" element={<ProtectedRoute requiredRole="ADMIN"><PageLayout><ShaclReport /></PageLayout></ProtectedRoute>} />

      <Route path="/entreprise/offres" element={<ProtectedRoute requiredRole="ENTERPRISE"><PageLayout><MyOffers /></PageLayout></ProtectedRoute>} />
      <Route path="/entreprise/offres/nouvelle" element={<ProtectedRoute requiredRole="ENTERPRISE"><PageLayout><CreateOffer /></PageLayout></ProtectedRoute>} />
      <Route path="/entreprise/offres/:offerId/modifier" element={<ProtectedRoute requiredRole="ENTERPRISE"><PageLayout><CreateOffer /></PageLayout></ProtectedRoute>} />
      <Route path="/entreprise/offres/:offerId/candidatures" element={<ProtectedRoute requiredRole="ENTERPRISE"><PageLayout><Applications /></PageLayout></ProtectedRoute>} />

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
