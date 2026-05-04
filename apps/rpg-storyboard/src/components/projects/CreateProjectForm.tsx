import React, { useState } from 'react';
import { createProject } from '../../lib/storyboard/project';
import { saveProject } from '../../lib/storyboard/projectStorage';
import type { StoryboardTemplateId } from '@storyboard-os/rpg-domain';

const TEMPLATE_NAMES: Record<string, string> = {
  quest_flow:    'Quest Flow',
  quest_branch:  'Quest Branch',
  cutscene_beat: 'Cutscene Beat',
};

interface Props {
  templateId: StoryboardTemplateId;
}

export default function CreateProjectForm({ templateId }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError('Project title is required.');
      return;
    }
    setSubmitting(true);
    const project = createProject({
      title: title.trim(),
      description: description.trim() || undefined,
      templateId,
    });
    saveProject(project);
    window.location.href = `/projects/board?id=${project.id}`;
  }

  const templateName = TEMPLATE_NAMES[templateId] ?? templateId;

  return (
    <form onSubmit={handleSubmit} style={styles.form}>

      <div style={styles.templateBadge}>{templateName}</div>

      <h1 style={styles.heading}>Create Project</h1>
      <p style={styles.sub}>
        Your project will be saved locally in this browser and accessible from your Projects list.
      </p>

      <label style={styles.fieldGroup}>
        <span style={styles.labelText}>Project title <span style={styles.required}>*</span></span>
        <input
          type="text"
          value={title}
          onChange={e => { setTitle(e.target.value); setError(''); }}
          placeholder={`My ${templateName}`}
          autoFocus
          required
          style={styles.input}
        />
        {error && <span style={styles.errorMsg}>{error}</span>}
      </label>

      <label style={styles.fieldGroup}>
        <span style={styles.labelText}>
          Description <span style={styles.optional}>(optional)</span>
        </span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Brief summary of what this storyboard covers…"
          rows={3}
          style={{ ...styles.input, resize: 'vertical' as const }}
        />
      </label>

      <div style={styles.actions}>
        <a href="/templates" style={styles.cancelLink}>← Cancel</a>
        <button type="submit" disabled={submitting} style={styles.submitBtn}>
          {submitting ? 'Creating…' : 'Create Project →'}
        </button>
      </div>

    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: 520,
    margin: '0 auto',
    padding: '48px 24px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  templateBadge: {
    display: 'inline-block',
    alignSelf: 'flex-start',
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#8B5CF6',
    padding: '4px 10px',
    borderRadius: 4,
    background: 'rgba(139,92,246,0.12)',
    border: '1px solid rgba(139,92,246,0.25)',
  },
  heading: {
    fontSize: 28,
    fontWeight: 800,
    color: '#f1f5f9',
    lineHeight: 1.2,
    margin: 0,
  },
  sub: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 1.6,
    margin: 0,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: 700,
    color: '#94a3b8',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  required: {
    color: '#ef4444',
  },
  optional: {
    fontWeight: 400,
    color: '#475569',
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    background: '#0f1825',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    color: '#f1f5f9',
    fontSize: 14,
    padding: '10px 14px',
    fontFamily: 'inherit',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  errorMsg: {
    fontSize: 12,
    color: '#ef4444',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
  },
  cancelLink: {
    fontSize: 13,
    color: '#475569',
    textDecoration: 'none',
  },
  submitBtn: {
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 20px',
    borderRadius: 6,
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid rgba(255,255,255,0.14)',
    cursor: 'pointer',
  },
};
