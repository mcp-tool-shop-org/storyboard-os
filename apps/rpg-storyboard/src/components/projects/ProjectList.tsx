import React, { useEffect, useState } from 'react';
import { listProjects, getLastReadWarning, type ReadWarning } from '../../lib/storyboard/projectStorage';
import type { RpgStoryboardProject } from '@storyboard-os/rpg-domain';
import ErrorBoundary from '../ErrorBoundary';

const TEMPLATE_LABELS: Record<string, string> = {
  quest_flow:    'Quest Flow',
  quest_branch:  'Quest Branch',
  cutscene_beat: 'Cutscene Beat',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function ProjectListInner() {
  const [projects, setProjects] = useState<RpgStoryboardProject[]>([]);
  const [readWarning, setReadWarning] = useState<ReadWarning | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setProjects(listProjects());
    // AP-003: if corrupt records were skipped (or the whole store was
    // unreadable), say so — an unexplained shorter/empty list looks like
    // silent data loss even when the data is still sitting in storage.
    setReadWarning(getLastReadWarning());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return <div style={styles.loading}>Loading…</div>;
  }

  return (
    <div style={styles.root}>

      {/* ── Storage read warning ── */}
      {readWarning && (
        <div role="alert" style={styles.readWarning}>
          <span style={styles.readWarningTitle}>
            {readWarning.code === 'STORE_UNREADABLE'
              ? 'Saved projects could not be read'
              : `${readWarning.dropped} saved ${readWarning.dropped === 1 ? 'project' : 'projects'} skipped`}
          </span>
          <span style={styles.readWarningBody}>{readWarning.message}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <p style={styles.sectionLabel}>RPG Authoring</p>
          <h1 style={styles.heading}>Your Projects</h1>
        </div>
        <a href="/templates" style={styles.newBtn}>+ New Project</a>
      </div>

      {/* ── Empty state ── */}
      {projects.length === 0 && (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>No projects yet</p>
          <p style={styles.emptySub}>
            Create a project from one of the three RPG templates to get started.
            Projects are saved in this browser.
          </p>
          <a href="/templates" style={styles.emptyBtn}>Browse Templates →</a>
        </div>
      )}

      {/* ── Project cards ── */}
      {projects.length > 0 && (
        <div style={styles.list}>
          {projects.map(project => {
            const templateLabel = project.sourceTemplateId
              ? (TEMPLATE_LABELS[project.sourceTemplateId] ?? project.sourceTemplateId)
              : 'Custom';
            const frameCount = project.storyboard.frames.length;
            const boardUrl = `/projects/board?id=${project.id}`;

            return (
              <a href={boardUrl} key={project.id} style={styles.card}>
                <div style={styles.cardMain}>
                  <span style={styles.cardTitle}>{project.title}</span>
                  {project.description && (
                    <span style={styles.cardDesc}>{project.description}</span>
                  )}
                </div>
                <div style={styles.cardMeta}>
                  <span style={styles.templateBadge}>{templateLabel}</span>
                  <span style={styles.metaDetail}>{frameCount} beats</span>
                  <span style={styles.metaDetail}>Updated {formatDate(project.updatedAt)}</span>
                </div>
                <span style={styles.cardArrow}>→</span>
              </a>
            );
          })}
        </div>
      )}

    </div>
  );
}

// AP-002: the list island mounts `client:only` with no boundary above it —
// a render throw (e.g. a corrupt project slipping past validation) would
// blank the whole page. The boundary keeps the failure visible and recoverable.
export default function ProjectList() {
  return (
    <ErrorBoundary fallbackTitle="Project list failed to load">
      <ProjectListInner />
    </ErrorBoundary>
  );
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  loading: {
    color: '#475569',
    fontSize: 14,
    padding: 40,
  },
  readWarning: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '12px 16px',
    marginBottom: 24,
    background: 'rgba(249,115,22,0.08)',
    border: '1px solid rgba(249,115,22,0.28)',
    borderRadius: 8,
  },
  readWarningTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#fdba74',
  },
  readWarningBody: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 40,
    gap: 16,
    flexWrap: 'wrap',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#334155',
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: 800,
    color: '#f1f5f9',
    margin: 0,
  },
  newBtn: {
    fontSize: 12,
    fontWeight: 700,
    padding: '8px 16px',
    borderRadius: 6,
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid rgba(255,255,255,0.12)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-start',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '80px 24px',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#334155',
    margin: 0,
  },
  emptySub: {
    fontSize: 14,
    color: '#475569',
    maxWidth: 400,
    margin: 0,
    lineHeight: 1.6,
  },
  emptyBtn: {
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 20px',
    borderRadius: 6,
    background: '#1e293b',
    color: '#f1f5f9',
    border: '1px solid rgba(255,255,255,0.12)',
    textDecoration: 'none',
    marginTop: 8,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    background: '#0f1825',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: 8,
    textDecoration: 'none',
    transition: 'border-color 0.15s',
  },
  cardMain: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    minWidth: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#f1f5f9',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardDesc: {
    fontSize: 12,
    color: '#475569',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexShrink: 0,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  templateBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#8B5CF6',
    padding: '3px 8px',
    borderRadius: 3,
    background: 'rgba(139,92,246,0.1)',
    border: '1px solid rgba(139,92,246,0.2)',
  },
  metaDetail: {
    fontSize: 11,
    color: '#334155',
  },
  cardArrow: {
    fontSize: 14,
    color: '#334155',
    flexShrink: 0,
  },
};
