// Reads `?templateId=` from the URL at runtime, then renders CreateProjectForm.
// Used by the static /projects/new page — the template ID cannot be known at
// build time since it comes from the user's navigation choice.

import React, { useEffect, useState } from 'react';
import CreateProjectForm from './CreateProjectForm';
import type { StoryboardTemplateId } from '@storyboard-os/rpg-domain';

const VALID_TEMPLATE_IDS: StoryboardTemplateId[] = ['quest_flow', 'quest_branch', 'cutscene_beat'];

export default function NewProjectPage() {
  const [templateId, setTemplateId] = useState<StoryboardTemplateId | null>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tid = params.get('templateId') as StoryboardTemplateId | null;
    if (!tid || !VALID_TEMPLATE_IDS.includes(tid)) {
      setInvalid(true);
    } else {
      setTemplateId(tid);
    }
  }, []);

  if (invalid) {
    return (
      <div style={styles.errorState}>
        <span style={styles.errorTitle}>No template selected</span>
        <span style={styles.errorSub}>Choose a template to create a project from.</span>
        <a href="/templates" style={styles.errorLink}>← Browse Templates</a>
      </div>
    );
  }

  // Still resolving URL (first render — server has no window)
  if (!templateId) return null;

  return <CreateProjectForm templateId={templateId} />;
}

const styles: Record<string, React.CSSProperties> = {
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    gap: 12,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#334155',
  },
  errorSub: {
    fontSize: 14,
    color: '#475569',
    maxWidth: 360,
    lineHeight: 1.6,
  },
  errorLink: {
    fontSize: 13,
    color: '#8B5CF6',
    textDecoration: 'none',
    marginTop: 8,
  },
};
