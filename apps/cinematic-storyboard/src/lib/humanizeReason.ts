// ─── cinematic-storyboard / lib/humanizeReason.ts ─────────────────────────────
//
// Shared labels for beatStatus missing-reason codes. Used by the frame
// inspector and the production-signals panel so both surfaces show the same
// human-readable copy for the same codes.
//
// ─────────────────────────────────────────────────────────────────────────────

const REASON_LABELS: Record<string, string> = {
  no_visualDescription: 'Visual description missing',
  no_cameraMovement: 'Camera movement missing',
  no_actionNotes: 'Action notes missing',
  no_dialogue: 'Dialogue missing',
  no_editNotes: 'Edit notes missing',
  no_vfxRequirements: 'VFX requirements missing',
  no_audioRequirements: 'Audio requirements missing',
  no_durationEstimate: 'Duration estimate missing',
  no_spec: 'No spec content yet — add at least one of: intent, framing, duration estimate, or implementation checklist',
};

/** Map a `no_*` reason code to short UI copy. Unknown codes get a snake-case decode. */
export function humanizeReason(code: string): string {
  return (
    REASON_LABELS[code] ??
    code
      .replace(/^no_/, 'Missing ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .replace(/^./, c => c.toUpperCase())
  );
}
