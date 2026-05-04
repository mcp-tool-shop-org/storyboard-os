<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/rpg-domain"><img src="https://img.shields.io/npm/v/@storyboard-os/rpg-domain.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>आरपीजी गेम बनाने के लिए स्टोरीबोर्ड ओएस प्लेटफॉर्म के लिए अनुबंध।</strong></p>

---

# @storyboard-os/rpg-domain

यह आरपीजी गेम बनाने के लिए आवश्यक पैकेज है। इसमें एक आरपीजी गेम डिजाइनर, लेखक या डेवलपर को कार्यान्वयन योग्य खोज (क्वेस्ट) और दृश्य (सीन) की संरचना बनाने के लिए आवश्यक सभी चीजें शामिल हैं - जैसे कि फ्रेम के प्रकार, सामग्री का ढांचा, टेम्पलेट, सत्यापन नियम, कैनवास संकेत, तैयारी मॉडल, डेटा हस्तांतरण (हैंडऑफ) निर्माण, और परियोजना प्रबंधन सहायक उपकरण।

**लक्षित उपयोगकर्ता:** एक गेम डिजाइनर या डेवलपर जो एक आरपीजी वीडियो गेम पर काम कर रहा है और जिसे ऐसे तत्वों को डिजाइन करने की आवश्यकता है जिन्हें इंजन या उत्पादन प्रक्रिया में आसानी से उपयोग किया जा सके।

**उपयुक्त नहीं:** टेबलटॉप गेम की तैयारी, गेम मास्टर (जीएम) के लिए उपकरण, वर्चुअल टेबलटॉप (वीटीटी), अभियान नोट्स, या केवल संवाद (डायलाग) के लिए संपादक। सत्यापनकर्ता (वैलिडेटर) इसे लागू करता है - टेबलटॉप से संबंधित शब्दावली वाले फ्रेम सत्यापन में विफल हो जाते हैं।

---

## इंस्टॉल करें

```bash
npm install @storyboard-os/rpg-domain
# or
pnpm add @storyboard-os/rpg-domain
```

---

## फ्रेम के प्रकार

सात प्रकार। प्रत्येक एक खेलने योग्य आरपीजी खोज या दृश्य में एक विशिष्ट कार्य को दर्शाता है।

| प्रकार | कार्य | अनुशंसित रंग |
|---|---|---|
| `hook` | प्रारंभिक बिंदु या खुली श्रृंखला - खोज की शुरुआत या भविष्य की दिशा का संकेत | `#EAB308` |
| `scene` | कथा या स्थान का विवरण - "कहाँ और क्या" | `#3B82F6` |
| `choice` | खिलाड़ी का निर्णय बिंदु - बोर्ड को शाखाओं में विभाजित करता है, स्थिति ध्वज (स्टेट फ्लैग) सेट करता है | `#8B5CF6` |
| `encounter` | लड़ाई, पहेली, सामाजिक संघर्ष, या उच्च जोखिम वाला अवरोध | `#EF4444` |
| `reveal` | जानकारी, रहस्योद्घाटन, सुराग, या गेम की स्थिति का खुलासा | `#F97316` |
| `npc_beat` | चरित्र का संवाद के साथ इंटरैक्शन | `#22C55E` |
| `consequence` | दुनिया की स्थिति का परिणाम - एक विकल्प या घटना के बाद क्या बदलता है | `#6B7280` |

**`validateRpgStoryboard` द्वारा लागू नियम:**
- `choice` और `consequence` फ्रेम में कम से कम एक `stateChanges` प्रविष्टि होनी चाहिए।
- `reveal` फ्रेम में कम से कम एक `entryCondition` या `stateChange` होना चाहिए।
- फ्रेम की सामग्री में टेबलटॉप से संबंधित शब्द नहीं होने चाहिए।

---

## सामग्री का ढांचा

प्रत्येक आरपीजी फ्रेम में एक `FrameContent` ऑब्जेक्ट होता है, जिसमें केवल कहानी के नोट्स ही नहीं, बल्कि कार्यान्वयन से संबंधित जानकारी भी होती है।

```ts
interface FrameContent {
  designerNotes?: string;          // Intent, tone, design rationale — author-facing
  playerVisibleText?: string;      // What the player actually sees or hears
  authorOnlyNotes?: string;        // Spoilers, hidden logic — never shown in-game
  stakes?: string;                 // What is at risk if this beat fails or is skipped
  entryConditions?: string[];      // Game-state flags that must be true before this fires
  exitConditions?: string[];       // What must be true for this beat to resolve
  stateChanges?: string[];         // Flags / variables / world-state this beat sets
  involvedCharacters?: string[];   // Named characters present or referenced
  involvedFactions?: string[];     // Factions with stakes in this beat
  possibleOutcomes?: string[];     // All distinct results this beat can produce
  requiredAssets?: string[];       // Art, audio, props, dialogue, animations needed
  testCriteria?: string[];         // Pass/fail checks that verify correct implementation
  implementationChecklist?: string[]; // Ordered task list for the dev or production pass
}
```

बिना `entryConditions`, `stateChanges`, `requiredAssets`, और `testCriteria` वाले फ्रेम केवल कहानी के नोट्स होते हैं, गेम विनिर्देश नहीं। गार्डरेल परीक्षण हर टेम्पलेट-जनरेटेड फ्रेम पर इसे लागू करते हैं।

---

## टेम्पलेट

आरपीजी उत्पादन के लिए तीन शुरुआती बिंदु। प्रत्येक टेम्पलेट-जनरेटेड फ्रेम में एंट्री कंडीशन, स्टेट चेंज, आवश्यक संसाधन और परीक्षण मानदंड होते हैं। टेम्पलेट सोचने की संरचनाएं हैं, खाली शुरुआती बिंदु नहीं।

```ts
import { STORYBOARD_TEMPLATES, createStoryboardFromTemplate } from '@storyboard-os/rpg-domain';

const template = STORYBOARD_TEMPLATES.find(t => t.id === 'quest_flow');
console.log(template.name);       // 'Quest Flow'
console.log(template.frameCount); // 8
console.log(template.bestFor);    // 'First draft of any new quest...'

const storyboard = createStoryboardFromTemplate('quest_flow', {
  id: 'my-quest',
  title: 'The Ruined Tollhouse',
  description: 'Three factions want the same ledger.',
});
```

### क्वेस्ट फ्लो (`quest_flow`) - 8 फ्रेम

```
Opening Hook → Establishing Scene → Character Contact → Key Choice
  → The Obstacle → The Reveal → The Consequence → Future Thread
```

एक प्रमुख खिलाड़ी-संचालित शाखा वाला रैखिक खोज। शुरुआती ड्राफ्ट के लिए सबसे उपयुक्त - यह सुनिश्चित करता है कि प्रत्येक तत्व शुरुआत से ही स्थिति तर्क को शामिल करे।

### क्वेस्ट ब्रांच (`quest_branch`) - 7 फ्रेम

```
Inciting Situation → Decision Point → [Path A | Path B | Path C]
  → Convergence Point → Fallout Thread
```

तीन अलग-अलग रास्ते, जिनमें अलग-अलग लागतें और लाभ हैं। उन खिलाड़ी निर्णयों के लिए सबसे उपयुक्त जो वास्तव में अलग गेमप्ले बनाते हैं, न कि समान अनुक्रम जिसमें केवल रंग बदल गया हो।

### कटसीन बीट (`cutscene_beat`) - 5 फ्रेम

```
Establishing Frame → Character Beat → The Revelation
  → Player Response → The Shift
```

एक नाटकीय, संरचित क्षण जो खिलाड़ी की स्वतंत्रता को बनाए रखता है। खिलाड़ी प्रतिक्रिया फ्रेम अनिवार्य है - इसके बिना, यह अनुक्रम सबसे खराब तरीके से एक कटसीन होगा।

---

## सत्यापन

```ts
import { validateStoryboard, validateRpgStoryboard } from '@storyboard-os/rpg-domain';

// Structural validation only (from @storyboard-os/core)
const structural = validateStoryboard(storyboard);

// RPG domain rules layered on top
const rpg = validateRpgStoryboard(storyboard);

if (!rpg.valid) {
  rpg.errors.forEach(e => console.error(e.code, e.message, e.frameId));
}
```

आरपीजी-विशिष्ट त्रुटि कोड में शामिल हैं: `CHOICE_MISSING_STATE_CHANGES`, `CONSEQUENCE_MISSING_STATE_CHANGES`, `REVEAL_MISSING_ENTRY_OR_STATE`, और `TABLETOP_DRIFT_TERM`.

---

## कैनवास संकेत

ये फ़ंक्शन फ्रेम सामग्री से डिस्प्ले डेटा उत्पन्न करते हैं, बिना किसी कैनवास या रिएक्ट कोड की आवश्यकता के। कैनवास पैकेज परिणामों को प्रदर्शित करता है; डोमेन उनकी गणना करता है।

```ts
import { getFrameSignal, getFrameBadges, getChoiceBranchCount } from '@storyboard-os/rpg-domain';

const signal = getFrameSignal(frame);
signal.stateChangeSummary;     // e.g. "Sets 2 flags"
signal.branchConditionSummary; // e.g. "3 outgoing branches"
signal.readiness;              // 'full' | 'partial' | 'none'
signal.hasStateChanges;        // boolean
signal.specScore;              // 0–4

const badges = getFrameBadges(frame, connections);
// → [{ text: 'STATE', color: '#3B82F6' }, { text: 'SPEC', color: '#22C55E' }]
// Rendered by @storyboard-os/canvas without needing to know what they mean
```

---

## कार्यान्वयन तत्परता मॉडल

`getBeatStatus` यह निर्धारित करने का आधिकारिक स्रोत है कि "तैयार" का क्या अर्थ है। ऐप परिणाम प्रदर्शित करता है; डोमेन इसका निर्धारण करता है।

```ts
import { getBeatStatus, getStoryboardReadiness, BLOCKING_REASONS } from '@storyboard-os/rpg-domain';

const status = getBeatStatus(frame);

status.level;             // 'ready' | 'partial' | 'draft' | 'blocked'
status.missing;           // MissingSpecReason[]
status.assetCount;        // number of requiredAssets entries
status.testCriteriaCount; // number of testCriteria entries
status.checklistCount;    // number of implementationChecklist entries

// Distinguish domain violations (blockers) from spec gaps
const blockers = status.missing.filter(r => BLOCKING_REASONS.has(r));
const gaps     = status.missing.filter(r => !BLOCKING_REASONS.has(r));
```

### स्थिति स्तर

| स्तर | अर्थ |
|---|---|
| `ready` | सभी विशिष्टताएँ (स्पेसिफिकेशन) मौजूद हैं। विशिष्टता स्कोर ≥ 3 (डिजाइनर नोट्स, आवश्यक संसाधन, परीक्षण मानदंड, कार्यान्वयन चेकलिस्ट)। कोई डोमेन उल्लंघन नहीं। |
| `partial` | कुछ विशिष्टताएँ मौजूद हैं लेकिन अधूरी हैं। विशिष्टता स्कोर 1–2। |
| `draft` | कोई विशिष्टता नहीं (स्कोर = 0)। ढांचा संरचनात्मक रूप से मौजूद है लेकिन इसमें कोई कार्यान्वयन गहराई नहीं है। |
| `blocked` | डोमेन उल्लंघन: `choice`/`consequence` में `stateChanges` गायब हैं, या `reveal` में `entryConditions` और `stateChanges` दोनों गायब हैं। |

```ts
// Board-level readiness summary
const summary = getStoryboardReadiness(storyboard);
summary.total;         // total frame count
summary.ready;         // frames at 'ready'
summary.partial;       // frames at 'partial'
summary.draft;         // frames at 'draft'
summary.blocked;       // frames at 'blocked'
summary.readyFraction; // ready / total (0–1)
summary.byFrame;       // Map<frameId, BeatStatus>
```

---

## हैंडऑफ एक्सपोर्ट

```ts
import { generateHandoff, generateMarkdown } from '@storyboard-os/rpg-domain';

// For template preview boards — static storyboard data
const handoff = generateHandoff(storyboard);
const markdown = generateMarkdown(handoff);
```

बीट्स को काह्न के एल्गोरिदम का उपयोग करके टोपोलॉजिकल रूप से व्यवस्थित किया जाता है - अपस्ट्रीम निर्भरताएँ डाउनस्ट्रीम परिणामों से पहले। चक्रों का पता लगाया जाता है और शेष फ़्रेम क्रैश किए बिना जोड़े जाते हैं।

प्रत्येक `HandoffBeat` में शामिल हैं: स्थिति, गुम होने के कारण, सभी विशिष्टता फ़ील्ड, प्रकार और लेबल के साथ आउटगोइंग शाखाएँ, और इनकमिंग बीट आईडी। हैंडऑफ हेडर में कुल/तैयार/आंशिक/ड्राफ्ट/ब्लॉक किए गए की संख्या और तत्काल वर्गीकरण के लिए `blockedBeatIds` / `partialBeatIds` प्रदर्शित होते हैं।

---

## परियोजना डोमेन सहायक उपकरण

स्थायी लेखन परियोजनाओं के लिए - एक परियोजना बनाएं, विशिष्टता सामग्री संपादित करें, और विशिष्टता पाठ से अलग प्रगति को ट्रैक करें।

```ts
import {
  createProject,
  updateFrameBasics,
  updateFrameContent,
  updateFramePosition,
  setChecklistItemComplete,
  setTestCriterionComplete,
  getFrameProgress,
  getProjectProgress,
} from '@storyboard-os/rpg-domain';

// Create a project from a template
const project = createProject({
  title: 'The Ruined Tollhouse',
  description: 'Three factions want the same ledger.',
  sourceTemplateId: 'quest_flow',
});

// All update functions are pure — they return a new project object
const updated = updateFrameBasics(project, 'hook-1', { title: 'The Caravan Arrives' });
const edited  = updateFrameContent(updated, 'hook-1', {
  designerNotes: 'Environmental storytelling — no dialogue in this beat.',
  entryConditions: ['quest_tollhouse_active === true'],
  requiredAssets: ['ruined tollhouse exterior', 'abandoned caravan prop'],
});

// Track progress separately from spec text (spec strings are never modified)
const p1 = setChecklistItemComplete(edited, 'hook-1', 0, true);
const p2 = setTestCriterionComplete(p1, 'hook-1', 0, true);

// Read back progress
const frameProgress = getFrameProgress(p2, 'hook-1');
frameProgress.checklist;    // { "0": true, ... }
frameProgress.testCriteria; // { "0": true, ... }

const summary = getProjectProgress(p2);
summary.totalChecklist; // total checklist items across all frames
summary.doneChecklist;  // completed items
summary.totalTests;     // total test criteria across all frames
summary.doneTests;      // completed criteria
```

**प्रगति अपरिवर्तनीय:** `implementationChecklist` और `testCriteria` विशिष्टता स्ट्रिंग को प्रगति कार्यों द्वारा कभी संशोधित नहीं किया जाता है। पूर्णता की स्थिति `project.progress.frames` में अलग से मौजूद है। विशिष्टता को प्रगति से स्वतंत्र रूप से संपादित किया जा सकता है, और हैंडऑफ को किसी भी समय दोनों की वर्तमान स्थिति से पुन: उत्पन्न किया जा सकता है।

### परियोजना हैंडऑफ

```ts
import { generateProjectHandoff, generateProjectMarkdown } from '@storyboard-os/rpg-domain';

// For durable projects — includes edited content + progress
const handoff = generateProjectHandoff(project);

handoff.projectId;       // project.id
handoff.title;           // project.title
handoff.sourceTemplateId;
handoff.generatedAt;
handoff.progress;        // ProjectProgressSummary
handoff.beats;           // ProjectHandoffBeat[] — spec + completion arrays

// Each ProjectHandoffBeat extends HandoffBeat with:
// checklistProgress: boolean[]   — one entry per checklist item
// testProgress: boolean[]        — one entry per test criterion

const markdown = generateProjectMarkdown(handoff);
// Produces Markdown with [x]/[ ] per item, project identity header, progress summary
```

---

## डेमो क्वेस्ट - द टोलहाउस लेजर

एक पूरी तरह से विशिष्ट 8-बीट क्वेस्ट। प्रत्येक फ़्रेम में विशिष्ट फ़्लैग नाम, संसाधन आवश्यकताएँ और परीक्षण मानदंड होते हैं - जिसका उपयोग संदर्भ कार्यान्वयन या लाइव डेमो के रूप में किया जा सकता है।

```ts
import { tollhouseLedgerProject } from '@storyboard-os/rpg-domain';

const storyboard = tollhouseLedgerProject.storyboard;
console.log(storyboard.frames.length); // 8

const hook = storyboard.frames[0];
hook.content.stateChanges;   // ['Sets: quest_tollhouse_active = true']
hook.content.requiredAssets; // ['Ruined tollhouse exterior environment', ...]
hook.content.testCriteria;   // ['Player can observe the abandoned caravan without dialogue trigger', ...]
```

**परिदृश्य:** खिलाड़ी एक युद्ध-ग्रस्त टोलहाउस में आता है। तीन गुट एक ही छिपे हुए लेजर को चाहते हैं। खिलाड़ी यह तय करता है कि किसे यह मिलेगा, किसे हार होगी, और क्षेत्र कैसा दिखेगा। आठ बीट्स, दो परिणाम शाखाओं के साथ।

---

## विश्वास मॉडल

`@storyboard-os/rpg-domain` एक शुद्ध टाइपस्क्रिप्ट लाइब्रेरी है। इसमें कोई रनटाइम दुष्प्रभाव नहीं है, कोई I/O नहीं है, कोई नेटवर्क एक्सेस नहीं है, और कोई ब्राउज़र या Node.js API नहीं है। सभी फ़ंक्शन डेटा स्वीकार करते हैं और डेटा वापस करते हैं। इस पैकेज द्वारा कुछ भी संग्रहीत, लॉग या प्रसारित नहीं किया जाता है - दृढ़ता (persistence) उपभोग करने वाले ऐप की जिम्मेदारी है।

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
