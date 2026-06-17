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

/**
 * Tableau de bord Admin.
 * Vue sur : conformité SHACL, logs d'accès, stats endpoints,
 * séparation public/interne.
 */

// Données de démo
const DEMO_LOGS = [
  { timestamp: '2026-06-17 14:32:05', endpoint: '/api/offers/search', method: 'GET', status: 200, duration: '42ms', ip: '192.168.1.x' },
  { timestamp: '2026-06-17 14:31:58', endpoint: '/api/sparql/execute', method: 'POST', status: 200, duration: '128ms', ip: '192.168.1.x' },
  { timestamp: '2026-06-17 14:31:22', endpoint: '/api/students/student-0224012b', method: 'GET', status: 200, duration: '35ms', ip: '192.168.1.x' },
  { timestamp: '2026-06-17 14:30:15', endpoint: '/api/matching/score', method: 'POST', status: 200, duration: '95ms', ip: '10.0.0.x' },
  { timestamp: '2026-06-17 14:29:45', endpoint: '/api/admin/shacl/report', method: 'GET', status: 200, duration: '210ms', ip: '10.0.0.x' },
  { timestamp: '2026-06-17 14:28:33', endpoint: '/api/sparql/execute', method: 'POST', status: 400, duration: '12ms', ip: '192.168.1.x' },
  { timestamp: '2026-06-17 14:27:11', endpoint: '/api/auth/login', method: 'POST', status: 200, duration: '55ms', ip: '192.168.1.x' },
  { timestamp: '2026-06-17 14:25:02', endpoint: '/api/offers/search', method: 'GET', status: 200, duration: '38ms', ip: '10.0.0.x' },
];

const DEMO_SHACL_SUMMARY = {
  totalShapes: 12,
  conforming: 10,
  warnings: 1,
  violations: 1,
  lastRun: '2026-06-17 14:00:00',
};

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [shaclSummary, setShaclSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [logsData, shaclData] = await Promise.all([
        adminService.getLogs(),
        adminService.getShaclReport(),
      ]);
      setLogs(logsData.items || logsData);
      setShaclSummary(shaclData.summary || shaclData);
    } catch (err) {
      // Mode démo
      setLogs(DEMO_LOGS);
      setShaclSummary(DEMO_SHACL_SUMMARY);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Loader text="Chargement du tableau de bord..." />;
  }

  const logColumns = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (val) => <span className="text-xs" style={{ fontFamily: 'monospace' }}>{val}</span>,
    },
    {
      key: 'method',
      label: 'Méthode',
      render: (val) => <Badge size="sm">{val}</Badge>,
    },
    { key: 'endpoint', label: 'Endpoint' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => (
        <StatusPill status={val >= 200 && val < 300 ? 'success' : val >= 400 ? 'error' : 'warning'}>
          {val}
        </StatusPill>
      ),
    },
    { key: 'duration', label: 'Durée' },
    { key: 'ip', label: 'IP (masquée)' },
  ];

  return (
    <div>
      {/* Page header */}
      <div className="page-header container">
        <div className="flex items-center gap-2">
          <FiShield style={{ color: 'var(--accent)', fontSize: '1.5rem' }} />
          <h1>Administration</h1>
        </div>
        <p>Tableau de bord réservé aux administrateurs. Conformité SHACL, logs d'accès et vue d'ensemble.</p>
      </div>

      <div className="container" style={{ paddingBottom: '3rem' }}>
        {/* ═══ Stats rapides ═══ */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <StatCard
            icon={<FiCheckCircle />}
            value={shaclSummary?.conforming || 0}
            label="Shapes conformes"
          />
          <StatCard
            icon={<FiAlertTriangle />}
            value={shaclSummary?.warnings || 0}
            label="Avertissements"
          />
          <StatCard
            icon={<FiShield />}
            value={shaclSummary?.violations || 0}
            label="Violations SHACL"
          />
          <StatCard
            icon={<FiActivity />}
            value={logs.length}
            label="Requêtes récentes"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
          {/* ═══ Main content ═══ */}
          <div className="flex flex-col gap-3">
            {/* SHACL Status */}
            <Card variant="flat">
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h4>Conformité SHACL</h4>
                <Link to="/admin/shacl">
                  <Button variant="secondary" size="sm">Voir le rapport complet</Button>
                </Link>
              </div>

              <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                <StatusPill status={shaclSummary?.violations === 0 ? 'success' : 'error'}>
                  {shaclSummary?.violations === 0 ? 'Données conformes' : `${shaclSummary?.violations} violation(s)`}
                </StatusPill>
                {shaclSummary?.warnings > 0 && (
                  <StatusPill status="warning">
                    {shaclSummary.warnings} à vérifier
                  </StatusPill>
                )}
                <span className="text-xs text-muted">
                  Dernière exécution : {shaclSummary?.lastRun}
                </span>
              </div>

              <div className="progress-bar" style={{ height: '12px', borderRadius: '999px' }}>
                <div className="progress-fill" style={{
                  width: `${((shaclSummary?.conforming || 0) / (shaclSummary?.totalShapes || 1)) * 100}%`,
                  background: shaclSummary?.violations === 0
                    ? 'var(--status-success)'
                    : 'linear-gradient(90deg, var(--status-success), var(--status-warning))',
                }} />
              </div>
              <p className="text-xs text-muted" style={{ marginTop: '0.5rem' }}>
                {shaclSummary?.conforming}/{shaclSummary?.totalShapes} shapes validées
              </p>
            </Card>

            {/* Logs d'accès */}
            <Card variant="flat">
              <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                <h4 className="flex items-center gap-2">
                  <FiActivity style={{ color: 'var(--accent)' }} />
                  Logs d'accès récents
                </h4>
                <Badge>{logs.length} entrées</Badge>
              </div>
              <Table
                columns={logColumns}
                data={logs}
                emptyMessage="Aucun log disponible"
              />
            </Card>
          </div>

          {/* ═══ Sidebar ═══ */}
          <div className="flex flex-col gap-2" style={{ position: 'sticky', top: '5rem' }}>
            {/* Séparation public/interne */}
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
                    {['/api/offers/**', '/api/students/**', '/api/sparql/**', '/api/matching/**'].map(ep => (
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
                    {['/api/admin/shacl/**', '/api/admin/logs'].map(ep => (
                      <div key={ep} className="flex items-center gap-2">
                        <StatusPill status="warning">ADMIN</StatusPill>
                        <code style={{ fontSize: '0.7rem' }}>{ep}</code>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Info dernière activité */}
            <Card>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                <FiClock style={{ display: 'inline', marginRight: '0.35rem', color: 'var(--accent)' }} />
                Dernière activité
              </h4>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">SHACL validé</span>
                  <span>{shaclSummary?.lastRun?.split(' ')[1] || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Dernier accès</span>
                  <span>{logs[0]?.timestamp?.split(' ')[1] || '—'}</span>
                </div>
              </div>
            </Card>

            {/* Actions rapides */}
            <Card>
              <h4 style={{ marginBottom: '0.75rem', fontSize: '0.9rem' }}>Actions</h4>
              <div className="flex flex-col gap-1">
                <Link to="/admin/shacl">
                  <Button variant="secondary" size="sm" style={{ width: '100%' }} icon={<FiShield />}>
                    Rapport SHACL
                  </Button>
                </Link>
                <Link to="/sparql">
                  <Button variant="ghost" size="sm" style={{ width: '100%' }} icon={<FiDatabase />}>
                    Explorateur SPARQL
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
