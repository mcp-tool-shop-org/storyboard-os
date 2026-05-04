// Reads `?id=` from the URL at runtime, loads the project from localStorage,
// and renders the full StoryboardCanvas for it.
// This is the client-side board for user-created projects.

import React, { useEffect, useState } from 'react';
import { getProject } from '../../lib/storyboard/projectStorage';
import type { RpgStoryboardProject } from '@storyboard-os/rpg-domain';
import StoryboardCanvas from '../StoryboardCanvas';

export default function ProjectBoard() {
  const [project, setProject] = useState<RpgStoryboardProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const p = getProject(id);
    if (!p) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setProject(p);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div style={styles.state}>
        <span style={styles.stateText}>Loading project…</span>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div style={styles.state}>
        <span style={styles.stateTitle}>Project not found</span>
        <span style={styles.stateText}>
          This project may have been removed or the link is incorrect.
        </span>
        <a href="/projects" style={styles.stateLink}>← Back to Projects</a>
      </div>
    );
  }

  return <StoryboardCanvas storyboard={project.storyboard} />;
}

const styles: Record<string, React.CSSProperties> = {
  state: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: 12,
    background: '#0f172a',
    color: '#f1f5f9',
    fontFamily: 'ui-sans-serif, system-ui, sans-serif',
  },
  stateTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#334155',
  },
  stateText: {
    fontSize: 14,
    color: '#475569',
  },
  stateLink: {
    fontSize: 13,
    color: '#8B5CF6',
    textDecoration: 'none',
    marginTop: 8,
  },
};
