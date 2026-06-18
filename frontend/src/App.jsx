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
import EditProfile from './pages/EditProfile';
import AdminDashboard from './pages/admin/Dashboard';
import ShaclReport from './pages/admin/ShaclReport';
import MyOffers from './pages/enterprise/MyOffers';
import CreateOffer from './pages/enterprise/CreateOffer';
import Applications from './pages/enterprise/Applications';
import EnterpriseDashboard from './pages/enterprise/Dashboard';
import StudentDashboard from './pages/student/Dashboard';
import Bookmarks from './pages/student/Bookmarks';

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
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

      <Route path="/mon-espace" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageLayout><StudentDashboard /></PageLayout></ProtectedRoute>} />
      <Route path="/favoris" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageLayout><Bookmarks /></PageLayout></ProtectedRoute>} />
      <Route path="/etudiants/:id" element={<ProtectedRoute allowedRoles={['STUDENT', 'ADMIN', 'ENTERPRISE']}><PageLayout><StudentProfile /></PageLayout></ProtectedRoute>} />
      <Route path="/profil/modifier" element={<ProtectedRoute allowedRoles={['STUDENT']}><PageLayout><EditProfile /></PageLayout></ProtectedRoute>} />

      <Route path="/entreprise" element={<ProtectedRoute allowedRoles={['ENTERPRISE']}><PageLayout><EnterpriseDashboard /></PageLayout></ProtectedRoute>} />
      <Route path="/entreprise/offres" element={<ProtectedRoute allowedRoles={['ENTERPRISE']}><PageLayout><MyOffers /></PageLayout></ProtectedRoute>} />
      <Route path="/entreprise/offres/nouvelle" element={<ProtectedRoute allowedRoles={['ENTERPRISE']}><PageLayout><CreateOffer /></PageLayout></ProtectedRoute>} />
      <Route path="/entreprise/offres/:offerId/modifier" element={<ProtectedRoute allowedRoles={['ENTERPRISE']}><PageLayout><CreateOffer /></PageLayout></ProtectedRoute>} />
      <Route path="/entreprise/offres/:offerId/candidatures" element={<ProtectedRoute allowedRoles={['ENTERPRISE']}><PageLayout><Applications /></PageLayout></ProtectedRoute>} />

      <Route path="/sparql" element={<ProtectedRoute allowedRoles={['ADMIN']}><PageLayout><SparqlExplorer /></PageLayout></ProtectedRoute>} />
      <Route path="/vocabulaires" element={<ProtectedRoute allowedRoles={['ADMIN']}><PageLayout><Vocabularies /></PageLayout></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><PageLayout><AdminDashboard /></PageLayout></ProtectedRoute>} />
      <Route path="/admin/shacl" element={<ProtectedRoute allowedRoles={['ADMIN']}><PageLayout><ShaclReport /></PageLayout></ProtectedRoute>} />

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
