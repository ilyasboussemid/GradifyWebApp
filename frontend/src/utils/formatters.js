/**
 * Utilitaires de formatage pour Gradify
 */

/**
 * Extrait l'ID court d'une URI RDF
 * Ex: "https://data.lod-school.ma/id/offer-001" → "offer-001"
 */
export function extractId(uri) {
  if (!uri) return '';
  return uri.split('/').pop();
}

/**
 * Formate un score de matching en pourcentage
 */
export function formatMatchScore(score, maxScore) {
  if (!maxScore || maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Formate une date ISO en format lisible FR
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Tronque un texte à N caractères
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Nettoie une valeur RDF (enlève les tags @fr, etc.)
 */
export function cleanRdfValue(value) {
  if (!value) return '';
  // Enlever le suffixe de langue @fr, @en etc.
  return value.replace(/@[a-z]{2}$/, '');
}

/**
 * Convertit les résultats SPARQL JSON en tableau exportable CSV
 */
export function sparqlResultsToCsv(results) {
  if (!results || !results.length) return '';
  const headers = Object.keys(results[0]);
  const rows = results.map(row =>
    headers.map(h => `"${(row[h] || '').replace(/"/g, '""')}"`).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

/**
 * Télécharge un contenu en fichier
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
