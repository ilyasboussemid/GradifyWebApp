import React from 'react';
import Header from './Header';
import Footer from './Footer';

/**
 * Layout principal : Header sticky + contenu + Footer.
 * Utilisé par toutes les pages (sauf Login qui a son propre layout).
 */
export default function PageLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
