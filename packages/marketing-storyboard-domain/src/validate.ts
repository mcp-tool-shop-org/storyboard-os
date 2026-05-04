// ─── marketing-storyboard-domain / validate.ts ───────────────────────────────
//
// Marketing domain validation. Runs the generic structural check from
// @storyboard-os/core and adds marketing-specific invariants:
//
//   • conversion frames must have a conversionGoal
//   • asset frames must have at least one requiredAssets entry
//   • approval frames must have at least one approvalRequirements entry
//   • measurement frames must have at least one metrics entry
//   • touchpoint frames must have a channel
//   • message frames must have a messageClaim
//   • no frame content may contain generic-planner drift terminology
//
// ─────────────────────────────────────────────────────────────────────────────

import {
  validateStoryboard,
  type StoryboardValidationError,
  type StoryboardValidationResult,
} from '@storyboard-os/core';
import type { Storyboard, MarketingFrameContent } from './schema';

export type { StoryboardValidationError, StoryboardValidationResult };
export { validateStoryboard };

// ─── Planner drift guard ──────────────────────────────────────────────────────

const PLANNER_DRIFT_TERMS = [
  'content calendar',
  'editorial calendar',
  'social schedule',
  'posting schedule',
  'upload schedule',
] as const;

// ─── Marketing domain validator ───────────────────────────────────────────────

export function validateMarketingStoryboard(
  storyboard: Storyboard,
): StoryboardValidationResult {
  const base = validateStoryboard(storyboard);
  const errors: StoryboardValidationError[] = [...base.errors];

  for (const frame of storyboard.frames) {
    const content = frame.content as MarketingFrameContent;
    const contentStr = JSON.stringify(content).toLowerCase();

    // conversion frames must carry a conversionGoal.
    if (frame.type === 'conversion') {
      if (!content.conversionGoal?.trim()) {
        errors.push({
          code: 'MARKETING_MISSING_CONVERSION_GOAL',
          message: `Frame "${frame.id}" (type: conversion) must have a conversionGoal.`,
          frameId: frame.id,
        });
      }
    }

    // asset frames must have requiredAssets.
    if (frame.type === 'asset') {
      if (!content.requiredAssets || content.requiredAssets.length === 0) {
        errors.push({
          code: 'MARKETING_MISSING_REQUIRED_ASSETS',
          message: `Frame "${frame.id}" (type: asset) must have at least one requiredAssets entry.`,
          frameId: frame.id,
        });
      }
    }

    // approval frames must have approvalRequirements.
    if (frame.type === 'approval') {
      if (!content.approvalRequirements || content.approvalRequirements.length === 0) {
        errors.push({
          code: 'MARKETING_MISSING_APPROVAL_REQUIREMENTS',
          message: `Frame "${frame.id}" (type: approval) must have at least one approvalRequirements entry.`,
          frameId: frame.id,
        });
      }
    }

    // measurement frames must have metrics.
    if (frame.type === 'measurement') {
      if (!content.metrics || content.metrics.length === 0) {
        errors.push({
          code: 'MARKETING_MISSING_METRICS',
          message: `Frame "${frame.id}" (type: measurement) must have at least one metrics entry.`,
          frameId: frame.id,
        });
      }
    }

    // touchpoint frames must have a channel.
    if (frame.type === 'touchpoint') {
      if (!content.channel?.trim()) {
        errors.push({
          code: 'MARKETING_MISSING_CHANNEL',
          message: `Frame "${frame.id}" (type: touchpoint) must specify a channel.`,
          frameId: frame.id,
        });
      }
    }

    // message frames must have a messageClaim.
    if (frame.type === 'message') {
      if (!content.messageClaim?.trim()) {
        errors.push({
          code: 'MARKETING_MISSING_MESSAGE_CLAIM',
          message: `Frame "${frame.id}" (type: message) must have a messageClaim.`,
          frameId: frame.id,
        });
      }
    }

    // Guard against planner-drift terminology.
    for (const term of PLANNER_DRIFT_TERMS) {
      if (contentStr.includes(term)) {
        errors.push({
          code: 'MARKETING_PLANNER_DRIFT',
          message: `Frame "${frame.id}" contains planner-drift term: "${term}".`,
          frameId: frame.id,
        });
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
