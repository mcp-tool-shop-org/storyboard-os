// Full-page recovery for STORE_UNREADABLE / STORE_CORRUPT on board and handoff.
// Must not look like "project not found" — the blob is still in localStorage.

import React from 'react';
import { downloadRawStoreBlob } from '../../lib/storyboard/projectStorage';
import { CORRUPT_STORE } from '../../lib/storyboard/projectListEmpty';

export default function CorruptStoreRecovery() {
  const copy = CORRUPT_STORE;

  function handleDownload() {
    const ok = downloadRawStoreBlob();
    if (!ok && typeof window !== 'undefined') {
      window.alert('No raw storage blob is present for this origin.');
    }
  }

  return (
    <div
      role="alert"
      data-empty-kind="corrupt-store"
      style={styles.root}
    >
      <span style={styles.title}>{copy.title}</span>
      <span style={styles.body}>{copy.body}</span>
      <button type="button" onClick={handleDownload} style={styles.download}>
        Download raw storage blob
      </button>
      <a href="/projects" style={styles.link}>← Back to Projects</a>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 12,
    background: '#0f172a',
    color: '#f1f5f9',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
    padding: 24,
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fdba74',
  },
  body: {
    fontSize: 14,
    color: '#94a3b8',
    maxWidth: 520,
    lineHeight: 1.6,
  },
  download: {
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 20px',
    borderRadius: 6,
    background: 'transparent',
    color: '#fdba74',
    border: '1px solid rgba(249,115,22,0.35)',
    cursor: 'pointer',
    marginTop: 8,
  },
  link: {
    fontSize: 13,
    color: '#8B5CF6',
    textDecoration: 'none',
    marginTop: 8,
  },
};
