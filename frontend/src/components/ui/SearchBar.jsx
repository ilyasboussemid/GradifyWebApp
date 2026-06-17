import React from 'react';
import { FiSearch } from 'react-icons/fi';

/**
 * Barre de recherche avec icône et placeholder.
 */
export default function SearchBar({
  value,
  onChange,
  placeholder = 'Rechercher...',
  onSubmit,
  className = '',
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit(value);
    }
  };

  return (
    <div className={`flex items-center ${className}`} style={{ position: 'relative' }}>
      <FiSearch
        style={{
          position: 'absolute',
          left: '1rem',
          color: 'var(--muted)',
          fontSize: '1rem',
        }}
      />
      <input
        type="text"
        className="search-input"
        style={{ paddingLeft: '2.75rem' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
    </div>
  );
}
