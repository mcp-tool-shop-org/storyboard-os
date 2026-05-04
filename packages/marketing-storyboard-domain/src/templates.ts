// ─── marketing-domain / templates.ts ─────────────────────────────────────────
//
// Three production campaign templates.
//
// Each template generates a complete storyboard with full spec depth — not
// blank starting points. A marketer can read the generated board and understand
// what each beat requires without supplementary docs.
//
// ─────────────────────────────────────────────────────────────────────────────

import type { CreateStoryboardInput } from '@storyboard-os/core';
import type {
  MarketingTemplateId,
  MarketingFrameType,
  MarketingFrameContent,
  StoryboardFrame,
  Storyboard,
  StoryboardTemplateDefinition,
} from './schema';
// ─── Helper ───────────────────────────────────────────────────────────────────

function makeFrame(
  idPrefix: string,
  slug: string,
  type: MarketingFrameType,
  title: string,
  summary: string,
  content: MarketingFrameContent,
  position: { x: number; y: number },
): StoryboardFrame {
  return {
    id: `${idPrefix}-${slug}`,
    type,
    title,
    summary,
    position,
    size: { width: 260, height: 160 },
    content,
    annotations: [],
  };
}

// ─── Product Launch Flow ──────────────────────────────────────────────────────

function productLaunchFrames(idPrefix: string): StoryboardFrame[] {
  return [
    makeFrame(idPrefix, 'audience', 'audience', 'Target Audience', 'Define who this launch is for — segment, persona, intent.', {
      objective: 'Identify and qualify the primary audience for launch messaging',
      audienceSegment: 'Define segment here',
      customerStateBefore: ['Unaware of product', 'Using competitor or manual process'],
      customerStateAfter: ['Aware product exists', 'Understands core value prop'],
      testCriteria: ['Segment is specific enough to target via paid channels', 'Persona has confirmed pain point'],
      implementationChecklist: ['Research audience demographics', 'Validate segment size', 'Document persona'],
    }, { x: 80, y: 200 }),

    makeFrame(idPrefix, 'message', 'message', 'Core Message', 'The central claim, proof, and objection handling for this launch.', {
      objective: 'Craft the primary message that moves audience from unaware to interested',
      messageClaim: 'Define the single sentence claim',
      proofPoints: ['Social proof or data point', 'Demo or example', 'Testimonial or case study'],
      objectionsHandled: ['Price objection', 'Complexity objection', 'Trust objection'],
      customerStateBefore: ['Unaware or skeptical'],
      customerStateAfter: ['Interested and willing to explore'],
      testCriteria: ['Message passes the "so what?" test', 'Claim is provable'],
      implementationChecklist: ['Draft headline variations', 'Test message with 3 people', 'Finalize proof points'],
    }, { x: 380, y: 200 }),

    makeFrame(idPrefix, 'touchpoint-landing', 'touchpoint', 'Landing Page', 'Primary conversion surface for the launch.', {
      objective: 'Convert interested visitors into signups or purchasers',
      channel: 'Landing page (web)',
      requiredAssets: ['Hero copy', 'Social proof section', 'CTA button copy', 'OG image'],
      customerStateBefore: ['Interested from ad or announcement'],
      customerStateAfter: ['Evaluated and ready to convert or bounce'],
      testCriteria: ['Page loads in < 2s', 'CTA is above the fold', 'Mobile-responsive'],
      implementationChecklist: ['Design landing page', 'Write copy', 'Set up analytics', 'Deploy'],
    }, { x: 680, y: 200 }),

    makeFrame(idPrefix, 'announcement', 'launch_event', 'Launch Announcement', 'Time-bound public release moment.', {
      objective: 'Maximize awareness within the first 48 hours',
      channel: 'Multi-channel (social, email, community)',
      launchDependencies: ['Landing page live', 'Product stable', 'Support coverage confirmed'],
      requiredAssets: ['Announcement post copy', 'Email blast template', 'Social media assets'],
      customerStateBefore: ['Aware product is coming'],
      customerStateAfter: ['Knows product is live and available'],
      testCriteria: ['All channels fire within 1 hour window', 'No broken links'],
      implementationChecklist: ['Schedule posts', 'Queue email', 'Brief support team', 'Monitor launch day'],
    }, { x: 980, y: 200 }),

    makeFrame(idPrefix, 'conversion', 'conversion', 'Primary Conversion', 'The desired action: signup, purchase, or waitlist.', {
      objective: 'Maximize conversion rate from launch traffic',
      conversionGoal: 'Signup / purchase / waitlist join',
      metrics: ['Conversion rate', 'Signups in first 48h', 'Revenue (if paid)'],
      customerStateBefore: ['On landing page, evaluating'],
      customerStateAfter: ['Converted — signed up or purchased'],
      testCriteria: ['Payment flow works end-to-end', 'Confirmation email sends', 'User lands in correct state'],
      implementationChecklist: ['Wire payment/signup flow', 'Test confirmation flow', 'Set up conversion tracking'],
    }, { x: 1280, y: 200 }),

    makeFrame(idPrefix, 'follow-up', 'follow_up', 'Post-Launch Follow-up', 'Nurture, onboarding, and engagement after conversion.', {
      objective: 'Retain converted users and reduce churn in first week',
      channel: 'Email + in-product',
      customerStateBefore: ['Just converted — excited but uncertain'],
      customerStateAfter: ['Onboarded, using product, retained past day 7'],
      requiredAssets: ['Welcome email sequence', 'Onboarding guide', 'Day-3 check-in email'],
      testCriteria: ['Email sequence fires on schedule', 'Onboarding guide is findable'],
      implementationChecklist: ['Write 3-email welcome sequence', 'Build onboarding flow', 'Set up drip triggers'],
    }, { x: 1580, y: 200 }),

    makeFrame(idPrefix, 'measurement', 'measurement', 'Launch Measurement', 'KPIs, attribution, and learning loop.', {
      objective: 'Determine launch success and extract learnings for next campaign',
      metrics: ['Total signups', 'Conversion rate', 'CAC', 'Day-7 retention', 'Revenue'],
      customerStateBefore: ['Post-launch activity data accumulating'],
      customerStateAfter: ['Learnings documented, next campaign informed'],
      testCriteria: ['Dashboard shows all KPIs within 48h', 'Attribution is correct'],
      implementationChecklist: ['Build launch dashboard', 'Set attribution windows', 'Schedule week-1 readout', 'Document learnings'],
    }, { x: 1880, y: 200 }),
  ];
}

// ─── Campaign Funnel ──────────────────────────────────────────────────────────

function campaignFunnelFrames(idPrefix: string): StoryboardFrame[] {
  return [
    makeFrame(idPrefix, 'audience', 'audience', 'Target Segment', 'Who enters this funnel — qualification criteria and intent signals.', {
      objective: 'Define the segment entering this acquisition funnel',
      audienceSegment: 'Define segment here',
      customerStateBefore: ['Cold — no prior relationship'],
      customerStateAfter: ['Aware of brand or offer'],
      testCriteria: ['Segment is targetable in ad platforms', 'Intent signal is measurable'],
      implementationChecklist: ['Define targeting criteria', 'Estimate segment size', 'Set up audience in ad platform'],
    }, { x: 80, y: 200 }),

    makeFrame(idPrefix, 'awareness', 'touchpoint', 'Awareness Touchpoint', 'First contact — the top-of-funnel interaction.', {
      objective: 'Generate awareness and drive initial click-through',
      channel: 'Paid social / search / content',
      messageClaim: 'Hook that earns attention',
      requiredAssets: ['Ad creative', 'Ad copy variations', 'Targeting config'],
      customerStateBefore: ['Unaware'],
      customerStateAfter: ['Clicked through — now a visitor'],
      metrics: ['Impressions', 'CTR', 'CPC'],
      testCriteria: ['CTR > benchmark for channel', 'Landing page loads from ad'],
      implementationChecklist: ['Create ad variations', 'Set up A/B test', 'Configure targeting', 'Set budget'],
    }, { x: 380, y: 200 }),

    makeFrame(idPrefix, 'proof', 'asset', 'Proof Asset', 'Content that builds trust — case study, demo, or social proof.', {
      objective: 'Move visitor from curious to convinced',
      requiredAssets: ['Case study or demo video', 'Social proof section', 'Comparison table'],
      customerStateBefore: ['Interested but skeptical'],
      customerStateAfter: ['Convinced of value — ready to evaluate'],
      testCriteria: ['Asset is accessible without signup', 'Load time < 3s'],
      implementationChecklist: ['Produce proof content', 'Place on landing page', 'Track engagement'],
    }, { x: 680, y: 200 }),

    makeFrame(idPrefix, 'conversion-page', 'conversion', 'Conversion Page', 'The point where visitor becomes lead or customer.', {
      objective: 'Maximize conversion from qualified visitors',
      conversionGoal: 'Lead capture or purchase',
      channel: 'Landing page CTA',
      metrics: ['Conversion rate', 'Form completion rate', 'Drop-off point'],
      customerStateBefore: ['Convinced and evaluating'],
      customerStateAfter: ['Converted — lead captured or purchase made'],
      testCriteria: ['Form submits correctly', 'Confirmation displays', 'Data flows to CRM'],
      implementationChecklist: ['Design conversion page', 'Wire form to backend', 'Set up thank-you page', 'Test flow'],
    }, { x: 980, y: 200 }),

    makeFrame(idPrefix, 'follow-up', 'follow_up', 'Nurture Sequence', 'Post-conversion engagement — email, retargeting, onboarding.', {
      objective: 'Move converted leads toward activation or purchase',
      channel: 'Email + retargeting',
      customerStateBefore: ['Just converted — warm but not activated'],
      customerStateAfter: ['Activated, engaged, or purchased'],
      requiredAssets: ['Email sequence (3-5 emails)', 'Retargeting creative'],
      testCriteria: ['Emails deliver (no spam folder)', 'Retargeting pixel fires'],
      implementationChecklist: ['Write email sequence', 'Set up automation', 'Create retargeting audience', 'Test delivery'],
    }, { x: 1280, y: 200 }),

    makeFrame(idPrefix, 'measurement', 'measurement', 'Funnel Measurement', 'End-to-end funnel metrics, attribution, and optimization learnings.', {
      objective: 'Quantify funnel performance and identify optimization opportunities',
      metrics: ['Funnel conversion rate (end-to-end)', 'CAC', 'ROAS', 'Stage drop-off rates'],
      customerStateBefore: ['Data accumulating across funnel stages'],
      customerStateAfter: ['Optimization opportunities identified'],
      testCriteria: ['Attribution tracks from first touch to conversion', 'Dashboard updates daily'],
      implementationChecklist: ['Build funnel dashboard', 'Set attribution model', 'Schedule weekly review', 'Document stage benchmarks'],
    }, { x: 1580, y: 200 }),
  ];
}

// ─── Content-to-Conversion Sequence ──────────────────────────────────────────

function contentToConversionFrames(idPrefix: string): StoryboardFrame[] {
  return [
    makeFrame(idPrefix, 'idea', 'message', 'Content Idea', 'The core insight or value that anchors this content piece.', {
      objective: 'Define a content idea that serves the conversion goal, not just engagement',
      messageClaim: 'The single insight this content delivers',
      audienceSegment: 'Who needs this insight',
      customerStateBefore: ['Has the problem but hasn\'t found the solution'],
      customerStateAfter: ['Understands the solution exists and who provides it'],
      testCriteria: ['Idea directly connects to product/service value', 'Not "content for content\'s sake"'],
      implementationChecklist: ['Research topic demand', 'Validate uniqueness', 'Outline content structure'],
    }, { x: 80, y: 200 }),

    makeFrame(idPrefix, 'content-asset', 'asset', 'Content Asset', 'The produced artifact — article, video, guide, thread.', {
      objective: 'Produce a complete content artifact ready for distribution',
      requiredAssets: ['Written/recorded content', 'Graphics or visuals', 'SEO metadata'],
      customerStateBefore: ['Searching for or scrolling past this topic'],
      customerStateAfter: ['Consumed content, trusts the source'],
      testCriteria: ['Content delivers on headline promise', 'CTA is present and relevant'],
      implementationChecklist: ['Draft content', 'Review and edit', 'Add visuals', 'Add CTA', 'Publish'],
    }, { x: 380, y: 200 }),

    makeFrame(idPrefix, 'distribution', 'touchpoint', 'Distribution Touchpoint', 'Where and how the content reaches the audience.', {
      objective: 'Maximize qualified reach for this content piece',
      channel: 'Define primary distribution channel',
      requiredAssets: ['Platform-specific formatting', 'Social copy', 'Email intro'],
      customerStateBefore: ['In-feed or in-inbox, not yet engaged'],
      customerStateAfter: ['Clicked through and consuming content'],
      metrics: ['Reach', 'Click-through rate', 'Time on page'],
      testCriteria: ['Content displays correctly on platform', 'Links work', 'Tracking fires'],
      implementationChecklist: ['Format for platform', 'Schedule distribution', 'Set up tracking', 'Cross-post if relevant'],
    }, { x: 680, y: 200 }),

    makeFrame(idPrefix, 'cta', 'conversion', 'Call to Action', 'The conversion moment embedded in or following the content.', {
      objective: 'Convert engaged content consumers into leads or customers',
      conversionGoal: 'Define the specific action (signup, download, purchase, booking)',
      customerStateBefore: ['Engaged with content, trusts source'],
      customerStateAfter: ['Took the action — converted'],
      metrics: ['CTA click rate', 'Conversion rate from content'],
      testCriteria: ['CTA is visible and compelling', 'Flow after click works end-to-end'],
      implementationChecklist: ['Design CTA placement', 'Write CTA copy', 'Wire conversion flow', 'Test'],
    }, { x: 980, y: 200 }),

    makeFrame(idPrefix, 'follow-up', 'follow_up', 'Follow-up', 'Post-conversion nurture or next step in the relationship.', {
      objective: 'Deepen relationship after content-driven conversion',
      channel: 'Email or in-product',
      customerStateBefore: ['Just converted from content'],
      customerStateAfter: ['Engaged further, moving toward retention or upsell'],
      requiredAssets: ['Follow-up email', 'Next resource or offer'],
      testCriteria: ['Follow-up triggers within 24h', 'Content is relevant to original piece'],
      implementationChecklist: ['Write follow-up content', 'Set up trigger', 'Test delivery'],
    }, { x: 1280, y: 200 }),

    makeFrame(idPrefix, 'measurement', 'measurement', 'Content ROI Measurement', 'Attribution from content to conversion and downstream revenue.', {
      objective: 'Prove content ROI and inform next content investment',
      metrics: ['Content-attributed conversions', 'Revenue from content path', 'CAC via content vs. paid'],
      customerStateBefore: ['Conversion data accumulating'],
      customerStateAfter: ['ROI quantified, next content investment decision informed'],
      testCriteria: ['Attribution tracks from content view to conversion', 'Report is actionable'],
      implementationChecklist: ['Set up content attribution', 'Build content ROI report', 'Schedule monthly review'],
    }, { x: 1580, y: 200 }),
  ];
}

// ─── Template definitions ─────────────────────────────────────────────────────

function buildTemplate(
  id: MarketingTemplateId,
  name: string,
  description: string,
  bestFor: string,
  frameBuilder: (prefix: string) => StoryboardFrame[],
): StoryboardTemplateDefinition {
  const frameCount = frameBuilder(`count-${id}`).length;

  return {
    id,
    name,
    description,
    frameCount,
    bestFor,
    createStoryboard(input: CreateStoryboardInput): Storyboard {
      const frames = frameBuilder(input.id);

      // Auto-generate sequence connections between adjacent frames
      const connections = frames.slice(0, -1).map((frame, i) => ({
        id: `${input.id}-conn-${i}`,
        fromFrameId: frame.id,
        toFrameId: frames[i + 1].id,
        type: 'sequence' as const,
      }));

      return {
        id: input.id,
        title: input.title,
        description: input.description ?? description,
        templateId: id,
        frames,
        connections,
      };
    },
  };
}

export const MARKETING_TEMPLATES: StoryboardTemplateDefinition[] = [
  buildTemplate(
    'product_launch',
    'Product Launch Flow',
    'Audience → Message → Landing Page → Announcement → Conversion → Follow-up → Measurement.',
    'Releasing a product, feature, repo, tool, or package.',
    productLaunchFrames,
  ),
  buildTemplate(
    'campaign_funnel',
    'Campaign Funnel',
    'Audience → Awareness Touchpoint → Proof Asset → Conversion Page → Follow-up → Measurement.',
    'Acquisition, waitlists, sales funnels, creator products.',
    campaignFunnelFrames,
  ),
  buildTemplate(
    'content_to_conversion',
    'Content-to-Conversion Sequence',
    'Idea → Content Asset → Distribution Touchpoint → CTA → Follow-up → Measurement.',
    'Turning content into action, not just publishing.',
    contentToConversionFrames,
  ),
];

export function getMarketingTemplate(id: MarketingTemplateId): StoryboardTemplateDefinition | undefined {
  return MARKETING_TEMPLATES.find(t => t.id === id);
}

export function createCampaignFromTemplate(
  templateId: MarketingTemplateId,
  input: CreateStoryboardInput,
): Storyboard {
  const template = getMarketingTemplate(templateId);
  if (!template) {
    throw new Error(`Unknown marketing template: ${templateId}`);
  }

  return template.createStoryboard(input);
}
