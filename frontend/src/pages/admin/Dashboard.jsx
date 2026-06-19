import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiActivity, FiDatabase, FiAlertTriangle, FiCheckCircle, FiClock, FiUsers, FiBriefcase } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import StatCard from '../../components/ui/StatCard';
import StatusPill from '../../components/ui/StatusPill';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';
import adminService from '../../services/adminService';
import sparqlService from '../../services/sparqlService';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, offers: 0, companies: 0, skills: 0 });
  const [shaclSummary, setShaclSummary] = useState({ totalShapes: 12, conforming: 12, warnings: 0, violations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [statsRes, shaclRes] = await Promise.allSettled([
        sparqlService.getStats(),
        adminService.getShaclReport(),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (shaclRes.status === 'fulfilled') {
        const data = shaclRes.value;
        setShaclSummary(data.summary || data);
      }
    } catch (err) {}
    setLoading(false);
  }

  if (loading) return <Loader text="Chargement..." />;

  const PUBLIC_ENDPOINTS = ['/api/offers/**', '/api/students/**', '/api/sparql/**', '/api/matching/**'];
  const ADMIN_ENDPOINTS = ['/api/admin/shacl/**', '/api/admin/logs'];

  return (
    <div>
      <div className="page-header container">
        <div className="flex items-center gap-2">
          <FiShield style={{ color: 'var(--accent)', fontSize: '1.5rem' }} />
          <h1>Administration</h1>
        </div>
        <p>Vue d'ensemble du Knowledge Graph, conformité SHACL et endpoints.</p>
      </div>

      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard icon={<FiUsers />} value={stats.students} label="Étudiants" />
          <StatCard icon={<FiBriefcase />} value={stats.offers} label="Offres" />
          <StatCard icon={<FiDatabase />} value={stats.companies} label="Entreprises" />
          <StatCard icon={<FiCheckCircle />} value={stats.skills} label="Compétences" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          <div className="flex flex-col gap-3">
            <Card variant="flat">
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h4>Conformité SHACL</h4>
                <Link to="/admin/shacl">
                  <Button variant="secondary" size="sm">Rapport complet</Button>
                </Link>
              </div>
              <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                <StatusPill status={shaclSummary.violations === 0 ? 'success' : 'error'}>
                  {shaclSummary.violations === 0 ? 'Données conformes' : `${shaclSummary.violations} violation(s)`}
                </StatusPill>
                {shaclSummary.warnings > 0 && (
                  <StatusPill status="warning">{shaclSummary.warnings} à vérifier</StatusPill>
                )}
              </div>
              <div className="progress-bar" style={{ height: '12px', borderRadius: '999px' }}>
                <div className="progress-fill" style={{
                  width: `${((shaclSummary.conforming || 0) / (shaclSummary.totalShapes || 1)) * 100}%`,
                  background: shaclSummary.violations === 0 ? 'var(--status-success)' : 'linear-gradient(90deg, var(--status-success), var(--status-warning))',
                }} />
              </div>
              <p className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
                {shaclSummary.conforming}/{shaclSummary.totalShapes} shapes validées
              </p>
            </Card>

            <Card variant="flat">
              <h4 style={{ marginBottom: '1rem' }}>Statistiques du graphe</h4>
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Entité</th>
                      <th>Nombre</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Étudiants (lod:Student)</td><td>{stats.students}</td><td><StatusPill status="success">OK</StatusPill></td></tr>
                    <tr><td>Offres (lod:InternshipOffer)</td><td>{stats.offers}</td><td><StatusPill status="success">OK</StatusPill></td></tr>
                    <tr><td>Entreprises (lod:Company)</td><td>{stats.companies}</td><td><StatusPill status="success">OK</StatusPill></td></tr>
                    <tr><td>Compétences (skos:Concept)</td><td>{stats.skills}</td><td><StatusPill status="success">OK</StatusPill></td></tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-2" style={{ position: 'sticky', top: '5rem' }}>
            <Card>
              <h4 style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                <FiDatabase style={{ display: 'inline', marginRight: '0.35rem', color: 'var(--accent)' }} />
                Endpoints
              </h4>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
                    Public (Open Data)
                  </span>
                  <div className="flex flex-col gap-1">
                    {PUBLIC_ENDPOINTS.map(ep => (
                      <div key={ep} className="flex items-center gap-2">
                        <StatusPill status="success">PUBLIC</StatusPill>
                        <code style={{ fontSize: '0.7rem' }}>{ep}</code>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                  <span className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.5rem' }}>
                    Restreint (Admin)
                  </span>
                  <div className="flex flex-col gap-1">
                    {ADMIN_ENDPOINTS.map(ep => (
                      <div key={ep} className="flex items-center gap-2">
                        <StatusPill status="warning">ADMIN</StatusPill>
                        <code style={{ fontSize: '0.7rem' }}>{ep}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>Actions</h4>
              <div className="flex flex-col gap-1">
                <Link to="/admin/shacl">
                  <Button variant="secondary" size="sm" style={{ width: '100%' }} icon={<FiShield />}>Rapport SHACL</Button>
                </Link>
                <Link to="/sparql">
                  <Button variant="ghost" size="sm" style={{ width: '100%' }} icon={<FiDatabase />}>Explorateur SPARQL</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
