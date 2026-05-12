// Reads `?id=` from the URL at runtime, loads the project from localStorage,
// renders the full StoryboardCanvas, and persists frame position changes back.
//
// This is the authoring board for user-created projects.
// Template preview boards (/storyboards/*) are NOT wired here — they remain
// read-only and never call onFramePositionChange.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getProject, saveProject } from '../../lib/storyboard/projectStorage';
import {
  updateFramePosition,
  updateFrameBasics,
  updateFrameContent,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getProjectProgress,
} from '../../lib/storyboard/project';
import type { RpgStoryboardProject, FrameContent } from '@storyboard-os/rpg-domain';
import type { FrameBasicsPatch, ProjectProgressSummary } from '../../lib/storyboard/project';
import StoryboardCanvas, { type SaveStatus } from '../StoryboardCanvas';

export default function ProjectBoard() {
  const [project, setProject]   = useState<RpgStoryboardProject | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);

  // Keep a mutable ref to the latest project so handlePositionChange
  // always reads the most current value without a stale closure.
  const projectRef = useRef<RpgStoryboardProject | null>(null);

  // Timer ref for clearing the "Saved" chip after 2 seconds
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load project from localStorage on mount ────────────────────────────────
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
    projectRef.current = p;
    setProject(p);
    setLoading(false);
  }, []);

  // Cleanup saved timer on unmount
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  // ── Shared save helper ─────────────────────────────────────────────────────
  //
  // F-AP-201: saveProject returns a WriteResult. If localStorage throws
  // (quota exceeded, Safari private-mode, serialization error), we must surface
  // a visible failure state instead of the green "Saved" chip — otherwise the
  // user thinks their edits landed when they didn't. We still update the
  // in-memory project so the canvas keeps reflecting what the user did; the
  // chip tells them the persistence step failed.
  const persistAndNotify = useCallback((updated: RpgStoryboardProject) => {
    projectRef.current = updated;
    setProject(updated);
    const result = saveProject(updated);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    if (result.ok) {
      setSaveStatus('saved');
      savedTimerRef.current = setTimeout(() => setSaveStatus(null), 2000);
    } else {
      // Failed writes stick until the next attempt — the chip must not auto-clear
      // back to null while data is unsaved. Pre-pending the code keeps the
      // tooltip distinct (QUOTA vs WRITE_FAILED) without leaking enum vocabulary
      // into the visible label.
      const prefix = result.code === 'QUOTA_EXCEEDED'
        ? 'Storage full — '
        : 'Save error — ';
      setSaveStatus({ kind: 'failed', message: `${prefix}${result.message}` });
    }
  }, []);

  // ── Frame position change → update project → save to localStorage ──────────
  const handlePositionChange = useCallback(
    (frameId: string, position: { x: number; y: number }) => {
      const current = projectRef.current;
      if (!current) return;
      persistAndNotify(updateFramePosition(current, frameId, position));
    },
    [persistAndNotify],
  );

  // ── Frame content change → update project → save to localStorage ───────────
  const handleFrameContentChange = useCallback(
    (frameId: string, basics: FrameBasicsPatch, content: Partial<FrameContent>) => {
      const current = projectRef.current;
      if (!current) return;
      // Apply basics first, then content on the result
      const afterBasics  = updateFrameBasics(current, frameId, basics);
      const afterContent = updateFrameContent(afterBasics, frameId, content);
      persistAndNotify(afterContent);
    },
    [persistAndNotify],
  );

  // ── Progress change → update project → save to localStorage ───────────────
  const handleProgressChange = useCallback(
    (frameId: string, type: 'checklist' | 'test', index: number, complete: boolean) => {
      const current = projectRef.current;
      if (!current) return;
      const updated = type === 'checklist'
        ? setChecklistItemComplete(current, frameId, index, complete)
        : setTestCriterionComplete(current, frameId, index, complete);
      persistAndNotify(updated);
    },
    [persistAndNotify],
  );

  // ── Render states ──────────────────────────────────────────────────────────

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

  const progressSummary = getProjectProgress(project);

  return (
    <StoryboardCanvas
      storyboard={project.storyboard}
      onFramePositionChange={handlePositionChange}
      onFrameContentChange={handleFrameContentChange}
      onProgressChange={handleProgressChange}
      projectProgress={project.progress}
      progressSummary={progressSummary}
      saveStatus={saveStatus}
      handoffHref={`/projects/handoff?id=${project.id}`}
    />
  );
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
