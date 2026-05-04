<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>सामान्य स्टोरीबोर्ड तत्वों का संग्रह। किसी विशेष क्षेत्र की शब्दावली का उपयोग नहीं किया गया है।</strong></p>

---

# @storyboard-os/core

स्टोरीबोर्ड ओएस प्लेटफॉर्म की संरचनात्मक नींव। यह सामान्य प्रकारों को परिभाषित करता है जिनका उपयोग सभी डोमेन पैकेजों में किया जाता है - जैसे कि फ्रेम, कनेक्शन, एनोटेशन, स्टोरीबोर्ड, टेम्पलेट, और संरचनात्मक सत्यापन।

`@storyboard-os/core` में **कोई निर्भरता नहीं है** और इसमें **कोई भी डोमेन-विशिष्ट शब्दावली शामिल नहीं है।** यह नहीं जानता कि आरपीजी क्वेस्ट (RPG quest), एक पटकथा दृश्य (screenplay scene), या एक अभियान मानचित्र (campaign map) क्या होता है। डोमेन पैकेज इन सामान्य तत्वों को आयात करते हैं और उन्हें अपने स्वयं के कंटेंट स्कीमा (content schema) और फ्रेम प्रकारों (frame types) के साथ विशिष्ट बनाते हैं।

---

## स्थापित करें।

```bash
npm install @storyboard-os/core
# or
pnpm add @storyboard-os/core
```

---

## यह क्या प्रदान करता है।

### फ्रेम।

एक `स्टोरीबोर्डफ्रेम` एक कहानी का एक अंश होता है - यह किसी भी स्टोरीबोर्ड की सबसे छोटी इकाई है।

```ts
interface StoryboardFrame<
  TFrameType extends string = string,
  TContent = unknown,
  TAnnotationType extends string = string,
> {
  id: string;
  type: TFrameType;
  title: string;
  summary: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  content: TContent;
  annotations: FrameAnnotation<TAnnotationType>[];
}
```

डोमेन, टाइप पैरामीटर को परिभाषित करते हैं:
```ts
// In @storyboard-os/rpg-domain:
type StoryboardFrame = CoreFrame<StoryboardFrameType, FrameContent, FrameAnnotationType>;
```

### टिप्पणी।

प्रत्येक फ्रेम के लिए, डोमेन के अनुसार टाइप किए गए विवरण।

```ts
interface FrameAnnotation<TAnnotationType extends string = string> {
  id: string;
  type: TAnnotationType;
  text: string;
}
```

### संबंध।

कनेक्शन, 'फ्रेम.लिंक्स' में दबे हुए नहीं, बल्कि उच्च श्रेणी के तत्व होते हैं। कनेक्शन का प्रकार दृश्य प्रस्तुति (जैसे रेखा की मोटाई, डैश पैटर्न) को निर्धारित करता है और इसका एक अर्थपूर्ण महत्व भी होता है।

```ts
type StoryboardConnectionType =
  | 'sequence'      // linear progression
  | 'choice'        // player-driven branch
  | 'consequence'   // outcome arc driven by state change
  | 'optional'      // conditional / skippable path
  | 'fallback';     // alternate route if primary is blocked

interface StoryboardConnection {
  id: string;
  fromFrameId: string;
  toFrameId: string;
  type: StoryboardConnectionType;
  label?: string;
}
```

### स्टोरीबोर्ड।

यह फ्रेम और कनेक्शनों का एक संग्रह है, जिसमें प्रत्येक का एक पहचान क्रमांक (आईडी) और शीर्षक है।

```ts
interface Storyboard<TFrame extends AnyStoryboardFrame = AnyStoryboardFrame> {
  id: string;
  title: string;
  description?: string;
  templateId?: string;
  frames: TFrame[];
  connections: StoryboardConnection[];
  canvasWidth?: number;
  canvasHeight?: number;
}
```

### परियोजना।

एक उथला कंटेनर, जिसका उपयोग एक या एक से अधिक स्टोरीबोर्ड रखने के लिए किया जाता है। यह कोई डेटाबेस नहीं है, बल्कि केवल एक ढांचा है जो संबंधित स्टोरीबोर्ड को एक नाम के तहत समूहीकृत करने में मदद करता है।

```ts
interface StoryboardProject<TStoryboard extends Storyboard = Storyboard> {
  id: string;
  title: string;
  description?: string;
  storyboards: TStoryboard[];
}
```

### टेम्प्लेट।

एक ऐसा कारखाना जो किसी विशेष क्षेत्र या विषय से संबंधित स्टोरीबोर्ड बनाने के लिए शुरुआती सामग्री का उपयोग करता है।

```ts
interface StoryboardTemplateDefinition<
  TId extends string = string,
  TStoryboard extends Storyboard = Storyboard,
> {
  id: TId;
  name: string;
  description: string;
  frameCount: number;
  bestFor: string;
  createStoryboard: (input: CreateStoryboardInput) => TStoryboard;
}

interface CreateStoryboardInput {
  id: string;
  title: string;
  description?: string;
}
```

---

## संरचनात्मक सत्यापन।

`validateStoryboard` फ़ंक्शन उन बुनियादी बातों की जांच करता है जो किसी भी स्टोरीबोर्ड के लिए सत्य होती हैं, चाहे वह किसी भी क्षेत्र से संबंधित हो: दोहराए गए फ्रेम आईडी, टूटे हुए कनेक्शन संदर्भ, गायब आवश्यक फ़ील्ड, और अमान्य फ्रेम आयाम।

```ts
import { validateStoryboard } from '@storyboard-os/core';

const result = validateStoryboard(storyboard);

if (!result.valid) {
  for (const error of result.errors) {
    console.error(error.code, error.message, error.frameId ?? error.connectionId);
  }
}
```

### त्रुटि कोड।

| कोड। | अर्थ। |
|---|---|
| `EMPTY_STORYBOARD` | स्टोरीबोर्ड में कोई फ्रेम नहीं हैं। |
| `DUPLICATE_FRAME_ID` | दो फ़्रेमों में एक ही आईडी है। |
| `MISSING_TITLE` | इस फ़्रेम का कोई शीर्षक नहीं है। |
| `MISSING_TYPE` | फ्रेम का कोई प्रकार नहीं है। |
| `MISSING_SUMMARY` | "फ्रेम" का कोई सारांश उपलब्ध नहीं है। |
| `INVALID_DIMENSIONS` | फ्रेम की चौड़ाई या ऊंचाई 40 पिक्सेल से कम नहीं होनी चाहिए। |
| `BROKEN_CONNECTION_FROM` | कनेक्शन `fromFrameId` एक ऐसे फ्रेम को संदर्भित करता है जो मौजूद नहीं है। |
| `BROKEN_CONNECTION_TO` | कनेक्शन `toFrameId` एक ऐसे फ्रेम को संदर्भित करता है जो मौजूद नहीं है। |

डोमेन पैकेज पहले `validateStoryboard` फ़ंक्शन को कॉल करते हैं, और फिर अपने स्वयं के डोमेन नियमों को उस पर लागू करते हैं। `@storyboard-os/rpg-domain` मॉड्यूल `validateRpgStoryboard` नाम का एक फ़ंक्शन प्रदान करता है, जो ठीक यही काम करता है।

---

## प्लेटफ़ॉर्म का विस्तार करना।

`@storyboard-os/core` के ऊपर एक नई सुविधा (फीचर) बनाने के लिए:

```ts
// 1. Define your frame type union
type ScreenplayFrameType = 'scene' | 'beat' | 'sequence' | 'act_break';

// 2. Define your content shape
interface ScreenplayContent {
  sceneHeading: string;
  action: string;
  dialogue: string[];
  characterPresent: string[];
}

// 3. Specialize the generic frame type
import type { StoryboardFrame as CoreFrame } from '@storyboard-os/core';
type ScreenplayFrame = CoreFrame<ScreenplayFrameType, ScreenplayContent, 'note' | 'revision'>;

// 4. Build your domain package — validateStoryboard handles the structural layer
```

---

## आर्किटेक्चर पद।

```
@storyboard-os/core          ← you are here
  └── (no dependencies)

@storyboard-os/rpg-domain
  └── @storyboard-os/core

@storyboard-os/canvas
  └── (no platform deps — pure Konva + React)

apps/rpg-storyboard
  └── all @storyboard-os/* packages
```

`@storyboard-os/core` निर्भरता श्रृंखला में सबसे नीचे स्थित है। यह प्लेटफ़ॉर्म से कुछ भी आयात नहीं करता है। इसके बाद के पैकेज ऊपर से चीजें आयात करते हैं - वे कभी भी नीचे से कुछ भी आयात नहीं करते हैं।

---

## विश्वास मॉडल।

`@storyboard-os/core` एक शुद्ध टाइपस्क्रिप्ट लाइब्रेरी है। इसमें कोई रनटाइम प्रभाव, कोई इनपुट/आउटपुट, कोई नेटवर्क एक्सेस और कोई भी अप्रत्याशित परिणाम नहीं होते हैं। `validateStoryboard` फ़ंक्शन आपके द्वारा दिए गए स्टोरीबोर्ड ऑब्जेक्ट को पढ़ता है और एक साधारण परिणाम ऑब्जेक्ट लौटाता है। कुछ भी संग्रहीत, लॉग या प्रसारित नहीं किया जाता है।

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
