import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiBriefcase, FiClock, FiFilter } from 'react-icons/fi';
import SearchBar from '../components/ui/SearchBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import offersService from '../services/offersService';
const DEMO_OFFERS = [
  {
    id: 'offer-001',
    title: 'Pentesteur Junior',
    company: 'TechSecure SA',
    city: 'Casablanca',
    duration: 2,
    level: '3A',
    compensation: '5 000 MAD/mois',
    status: 'Ouverte',
    skills: ['Python', 'Cybersécurité', 'Pentest', 'Linux'],
    program: 'Cybersecurite',
  },
  {
    id: 'offer-002',
    title: 'Ingenieur DevOps',
    company: 'CloudFirst',
    city: 'Casablanca',
    duration: 2,
    level: '2A',
    compensation: '2 000 MAD/mois',
    status: 'Ouverte',
    skills: ['Terraform', 'Docker', 'Kubernetes', 'CI/CD', 'PHP/Laravel'],
    program: 'Genie Logiciel',
  },
  {
    id: 'offer-004',
    title: 'Data Analyst',
    company: 'DataMaroc',
    city: 'Rabat',
    duration: 3,
    level: '2A',
    compensation: '3 500 MAD/mois',
    status: 'Ouverte',
    skills: ['Python', 'SQL', 'Power BI', 'Statistiques'],
    program: 'Genie de la Data',
  },
  {
    id: 'offer-005',
    title: 'Développeur Full-Stack',
    company: 'WebAgency',
    city: 'Tanger',
    duration: 4,
    level: '3A',
    compensation: '4 000 MAD/mois',
    status: 'Ouverte',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    program: 'Genie Logiciel',
  },
  {
    id: 'offer-006',
    title: 'Ingénieur IA',
    company: 'AILab Maroc',
    city: 'Casablanca',
    duration: 6,
    level: '3A',
    compensation: '6 000 MAD/mois',
    status: 'Ouverte',
    skills: ['Python', 'PyTorch', 'NLP', 'Hugging Face'],
    program: 'Genie de la Data',
  },
  {
    id: 'offer-007',
    title: 'Consultant ERP',
    company: 'ConsultPro',
    city: 'Marrakech',
    duration: 3,
    level: '2A',
    compensation: 'Non remunere',
    status: 'Ouverte',
    skills: ['ERP', 'SAP', 'Gestion de projet'],
    program: 'Supply Chain',
  },
];
const DEMO_FILTERS = {
  skills: ['Python', 'React', 'Docker', 'Terraform', 'SQL', 'PyTorch', 'Kubernetes', 'Cybersécurité', 'Node.js', 'Power BI'],
  cities: ['Casablanca', 'Rabat', 'Tanger', 'Marrakech', 'Fès'],
  companies: ['TechSecure SA', 'CloudFirst', 'DataMaroc', 'WebAgency', 'AILab Maroc', 'ConsultPro'],
  programs: ['Genie Logiciel', 'Cybersecurite', 'Genie de la Data', 'Supply Chain'],
};
export default function OfferSearch() {
  const [offers, setOffers] = useState([]);
  const [filters, setFilters] = useState({ skills: [], cities: [], companies: [], programs: [] });
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 20;

  useEffect(() => { fetchOffers(); }, [selectedSkill, selectedCity, selectedProgram]);
  useEffect(() => { fetchFilters(); }, []);

  async function fetchFilters() {
    try {
      const data = await offersService.getFilters();
      if (data) setFilters(data);
    } catch (err) {}
  }
  async function fetchOffers() {
    setLoading(true);
    try {
      const data = await offersService.search({
        skill: selectedSkill,
        city: selectedCity,
        program: selectedProgram,
        page: 1,
        size: 200,
      });
      setOffers(data.items || data || []);
      if (data.filters) setFilters(data.filters);
    } catch (err) {
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }
  const displayedOffers = searchTerm
    ? offers.filter(o =>
        o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : offers;
  const totalPages = Math.ceil(displayedOffers.length / pageSize);
  return (
    <div>
      <div className="page-header container">
        <h1>Offres de stage</h1>
        <p>Recherchez des offres par compétences, ville ou programme. Les résultats sont générés via SPARQL.</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Rechercher par titre, entreprise ou compétence..."
            />
          </div>
          <Button
            variant={showFilters ? 'primary' : 'secondary'}
            onClick={() => setShowFilters(!showFilters)}
            icon={<FiFilter />}
          >
            Filtres
          </Button>
        </div>
        {showFilters && (
          <div className="card-flat" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
            <div className="grid grid-3" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>Compétence</label>
                <select
                  className="select"
                  value={selectedSkill}
                  onChange={(e) => { setSelectedSkill(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%' }}
                >
                  <option value="">Toutes les compétences</option>
                  {filters.skills.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Ville</label>
                <select
                  className="select"
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%' }}
                >
                  <option value="">Toutes les villes</option>
                  {filters.cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Programme / Filière</label>
                <select
                  className="select"
                  value={selectedProgram}
                  onChange={(e) => { setSelectedProgram(e.target.value); setCurrentPage(1); }}
                  style={{ width: '100%' }}
                >
                  <option value="">Tous les programmes</option>
                  {filters.programs.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            {(selectedSkill || selectedCity || selectedProgram) && (
              <div className="flex items-center gap-1 flex-wrap" style={{ marginTop: '1rem' }}>
                <span className="text-xs text-muted">Filtres actifs :</span>
                {selectedSkill && (
                  <Badge>{selectedSkill} <span onClick={() => setSelectedSkill('')} style={{ cursor: 'pointer', marginLeft: 4 }}>×</span></Badge>
                )}
                {selectedCity && (
                  <Badge>{selectedCity} <span onClick={() => setSelectedCity('')} style={{ cursor: 'pointer', marginLeft: 4 }}>×</span></Badge>
                )}
                {selectedProgram && (
                  <Badge>{selectedProgram} <span onClick={() => setSelectedProgram('')} style={{ cursor: 'pointer', marginLeft: 4 }}>×</span></Badge>
                )}
                <Button variant="ghost" size="sm" onClick={() => { setSelectedSkill(''); setSelectedCity(''); setSelectedProgram(''); }}>
                  Effacer tout
                </Button>
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-muted" style={{ marginBottom: '1rem' }}>
          {displayedOffers.length} offre{displayedOffers.length > 1 ? 's' : ''} trouvée{displayedOffers.length > 1 ? 's' : ''}
        </p>
        {loading ? (
          <Loader text="Recherche en cours..." />
        ) : displayedOffers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>Aucune offre ne correspond à vos critères.</p>
            <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setSelectedSkill(''); setSelectedCity(''); setSelectedProgram(''); }} style={{ marginTop: '1rem' }}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-2">
            {displayedOffers.map((offer) => (
              <Link key={offer.id} to={`/offres/${offer.id}`} style={{ textDecoration: 'none' }}>
                <Card className="flex flex-col" style={{ height: '100%' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                    <Badge size="sm">{offer.level}</Badge>
                    <span className="pill pill-success" style={{ fontSize: '0.7rem' }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span>
                      {offer.status}
                    </span>
                  </div>
                  <h4 style={{ marginBottom: '0.35rem', color: 'var(--text)' }}>{offer.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted" style={{ marginBottom: '0.75rem' }}>
                    <span className="flex items-center gap-1"><FiBriefcase /> {offer.company}</span>
                    <span className="flex items-center gap-1"><FiMapPin /> {offer.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted" style={{ marginBottom: '1rem' }}>
                    <span className="flex items-center gap-1"><FiClock /> {offer.duration} mois</span>
                    <span>•</span>
                    <span>{offer.compensation}</span>
                  </div>
                  <div className="flex flex-wrap gap-1" style={{ marginTop: 'auto' }}>
                    {(offer.skills || []).slice(0, 4).map((skill) => (
                      <Badge key={skill} size="sm">{skill}</Badge>
                    ))}
                    {(offer.skills || []).length > 4 && (
                      <Badge size="sm">+{offer.skills.length - 4}</Badge>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
}
