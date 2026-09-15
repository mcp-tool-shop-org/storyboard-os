// Reads `?id=` from the URL at runtime, loads the project from localStorage,
// renders the full StoryboardCanvas, and persists frame position changes back.
//
// This is the authoring board for user-created projects.
// Template preview boards (/storyboards/*) are NOT wired here — they remain
// read-only and never call onFramePositionChange.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getProject, saveProject, getLastReadWarning } from '../../lib/storyboard/projectStorage';
import {
  updateFramePosition,
  updateFrameBasics,
  updateFrameContent,
  updateFrameAnnotations,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getProjectProgress,
  addFrame,
  removeFrame,
  addConnection,
  updateConnection,
  removeConnection,
} from '../../lib/storyboard/project';
import type { RpgStoryboardProject, FrameContent, FrameAnnotation, TopologyResult } from '@storyboard-os/rpg-domain';
import type { FrameBasicsPatch } from '../../lib/storyboard/project';
import type { StoryboardFrameType, StoryboardConnectionType } from '../../lib/storyboard/schema';
import { addBeatBlocked, densityBanner, topologyOpBanner, type TopologyBanner } from '../../lib/storyboard/topology';
import StoryboardCanvas, { type SaveStatus } from '../StoryboardCanvas';
import { measureBoardDensity, textColors } from '@storyboard-os/core';
import ErrorBoundary from '../ErrorBoundary';
import CorruptStoreRecovery from './CorruptStoreRecovery';

function ProjectBoardInner() {
  const [project, setProject]   = useState<RpgStoryboardProject | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [storeUnreadable, setStoreUnreadable] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(null);
  const [topoBanner, setTopoBanner] = useState<TopologyBanner | null>(null);

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
      // A corrupt root looks like a miss (readAll → []). Do not call that
      // "project not found" — recovery lives on /projects.
      if (getLastReadWarning()?.code === 'STORE_UNREADABLE') {
        setStoreUnreadable(true);
      } else {
        setNotFound(true);
      }
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
        : result.code === 'STORE_CORRUPT'
          ? 'Storage corrupt — '
          : 'Save error — ';
      setSaveStatus({
        kind: 'failed',
        message: `${prefix}${result.message}`,
        code: result.code,
      });
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
    (
      frameId: string,
      basics: FrameBasicsPatch,
      content: Partial<FrameContent>,
      annotations?: FrameAnnotation[],
    ) => {
      const current = projectRef.current;
      if (!current) return;
      // Apply basics first, then content, then annotations (frame-level, not content).
      const afterBasics  = updateFrameBasics(current, frameId, basics);
      const afterContent = updateFrameContent(afterBasics, frameId, content);
      const afterAnn = annotations
        ? updateFrameAnnotations(afterContent, frameId, annotations)
        : afterContent;
      persistAndNotify(afterAnn);
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

  // ── Topology (manual only — C3: no proposed edges) ────────────────────────
  const applyTopology = useCallback((result: TopologyResult): boolean => {
    const banner = topologyOpBanner(result);
    setTopoBanner(banner);
    if (!result.ok) return false;
    persistAndNotify(result.project);
    return true;
  }, [persistAndNotify]);

  const handleAddFrame = useCallback((type: StoryboardFrameType): boolean => {
    const current = projectRef.current;
    if (!current) return false;
    return applyTopology(addFrame(current, { type }));
  }, [applyTopology]);

  const handleRemoveFrame = useCallback((frameId: string): boolean => {
    const current = projectRef.current;
    if (!current) return false;
    return applyTopology(removeFrame(current, frameId));
  }, [applyTopology]);

  const handleAddConnection = useCallback((input: {
    fromFrameId: string;
    toFrameId: string;
    type: StoryboardConnectionType;
    label?: string;
  }): boolean => {
    const current = projectRef.current;
    if (!current) return false;
    return applyTopology(addConnection(current, input));
  }, [applyTopology]);

  const handleUpdateConnection = useCallback((
    connectionId: string,
    patch: { type?: StoryboardConnectionType; label?: string | null },
  ): boolean => {
    const current = projectRef.current;
    if (!current) return false;
    return applyTopology(updateConnection(current, connectionId, patch));
  }, [applyTopology]);

  const handleRemoveConnection = useCallback((connectionId: string): boolean => {
    const current = projectRef.current;
    if (!current) return false;
    return applyTopology(removeConnection(current, connectionId));
  }, [applyTopology]);

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={styles.state}>
        <span style={styles.stateText}>Loading project…</span>
      </div>
    );
  }

  if (storeUnreadable) {
    return <CorruptStoreRecovery />;
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
  const density = measureBoardDensity(project.storyboard);
  const banner = topoBanner ?? densityBanner(density);
  const topology = useMemo(() => ({
    addDisabled: addBeatBlocked(density),
    banner,
    onAddFrame: handleAddFrame,
    onRemoveFrame: handleRemoveFrame,
    onAddConnection: handleAddConnection,
    onUpdateConnection: handleUpdateConnection,
    onRemoveConnection: handleRemoveConnection,
  }), [
    density,
    banner,
    handleAddFrame,
    handleRemoveFrame,
    handleAddConnection,
    handleUpdateConnection,
    handleRemoveConnection,
  ]);

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
      viewStorageKey={project.id}
      topology={topology}
    />
  );
}

// AP-001: board.astro mounts this island `client:only` — a render throw above
// StoryboardCanvas's internal boundary (e.g. getProjectProgress on a corrupt
// project) would silently unmount the island and blank the page. Wrapping the
// WHOLE island here means any throw shows the boundary fallback instead.
export default function ProjectBoard() {
  return (
    <ErrorBoundary
      fallbackTitle="Board failed to load"
      fallbackBody="The project board could not be loaded. Your data is unchanged — only this view failed."
      fallbackCtaHref="/projects"
      fallbackCtaLabel="← Projects"
    >
      <ProjectBoardInner />
    </ErrorBoundary>
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
    color: textColors.heading,
  },
  stateText: {
    fontSize: 14,
    color: textColors.secondary,
  },
  stateLink: {
    fontSize: 13,
    color: '#8B5CF6',
    textDecoration: 'none',
    marginTop: 8,
  },
};
