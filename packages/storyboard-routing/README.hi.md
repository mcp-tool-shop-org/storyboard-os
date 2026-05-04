<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS" width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/routing"><img src="https://img.shields.io/npm/v/@storyboard-os/routing.svg" alt="npm" /></a>
  <a href="../../LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>

<p align="center"><strong>स्टोरीबोर्ड ओएस ऐप्स के लिए कॉन्फ़िगर करने योग्य यूआरएल हेल्पर। कोई निर्भरता नहीं।</strong></p>

---

# `@storyboard-os/routing`

स्टोरीबोर्ड ओएस प्लेटफॉर्म पर बने ऐप्स के लिए यूआरएल निर्माण हेल्पर। यह एक ही कॉन्फ़िगरेशन से बोर्ड, फ्रेम और प्रोजेक्ट यूआरएल उत्पन्न करता है। यह केवल स्ट्रिंग से स्ट्रिंग में रूपांतरण करता है - कोई फ्रेमवर्क निर्भरता नहीं, कोई डोम नहीं, कोई दुष्प्रभाव नहीं।

प्रत्येक ऐप अपना बेस पाथ प्रदान करता है। एक दूसरा ऐप, जिसका यूआरएल संरचना अलग है, उसे एक अलग कॉन्फ़िगरेशन मिलता है और यह कभी भी पहले ऐप के साथ टकराव नहीं करता है।

---

## इंस्टॉलेशन

```bash
npm install @storyboard-os/routing
# or
pnpm add @storyboard-os/routing
```

---

## उपयोग

```ts
import { createStoryboardRoutes } from '@storyboard-os/routing';

// Create a route factory for your app's URL structure
const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// Board — the canvas view
routes.boardRoute('quest-01')
// → '/storyboards/quest-01'

// Frame — the beat detail page
routes.frameRoute('quest-01', 'hook-arrival')
// → '/storyboards/quest-01/frames/hook-arrival'

// Project — a user-authored project board
routes.projectRoute('my-project-id')
// → '/projects/my-project-id'
```

फ़ैक्टरी `storyboardBasePath` से अंतिम स्लैश को हटा देता है:

```ts
createStoryboardRoutes({ storyboardBasePath: '/storyboards/' })
  .boardRoute('quest-01')
// → '/storyboards/quest-01'   (trailing slash removed)
```

---

## एपीआई

### `createStoryboardRoutes(config)`

यह दिए गए बेस पाथ से बंधा हुआ `StoryboardRoutes` ऑब्जेक्ट लौटाता है।

```ts
function createStoryboardRoutes(config: StoryboardRouteConfig): StoryboardRoutes;

interface StoryboardRouteConfig {
  /** Base path for board and frame URLs. Example: '/storyboards'. */
  storyboardBasePath: string;
}

interface StoryboardRoutes {
  /** Board canvas URL: `<base>/<storyboardId>` */
  boardRoute(storyboardId: string): string;

  /** Beat detail page URL: `<base>/<storyboardId>/frames/<frameId>` */
  frameRoute(storyboardId: string, frameId: string): string;

  /** Project board URL: `/projects/<projectId>` (always at /projects) */
  projectRoute(projectId: string): string;
}
```

`projectRoute` `storyboardBasePath` से प्रभावित नहीं होता है - प्रोजेक्ट हमेशा `/projects` पर स्थित होते हैं। केवल स्टोरीबोर्ड और फ्रेम रूट ही कॉन्फ़िगर किए गए बेस का उपयोग करते हैं।

---

## एकाधिक ऐप्स, एकाधिक कॉन्फ़िगरेशन

प्रत्येक ऐप अपना रूट फ़ैक्टरी बनाता है। वे कभी भी स्टेट साझा नहीं करते हैं:

```ts
// rpg-storyboard app
const rpgRoutes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });

// A hypothetical screenplay app
const screenplayRoutes = createStoryboardRoutes({ storyboardBasePath: '/scenes' });

rpgRoutes.boardRoute('quest-01')       // '/storyboards/quest-01'
screenplayRoutes.boardRoute('act-1')   // '/scenes/act-1'
```

---

## पतला री-एक्सपोर्ट पैटर्न

आमतौर पर, ऐप्स एक पूर्व-कॉन्फ़िगर किए गए इंस्टेंस को री-एक्सपोर्ट करते हैं ताकि पेज कंपोनेंट ऐप लेयर से आयात किए जा सकें, न कि सीधे पैकेज से:

```ts
// apps/rpg-storyboard/src/lib/routes.ts
import { createStoryboardRoutes } from '@storyboard-os/routing';

export const routes = createStoryboardRoutes({ storyboardBasePath: '/storyboards' });
```

```ts
// anywhere in the app
import { routes } from '../lib/routes';

const href = routes.boardRoute(storyboard.id);
```

यह आंतरिक इम्पोर्ट को स्थिर रखता है क्योंकि पैकेज संस्करण विकसित होते हैं - केवल री-एक्सपोर्ट फ़ाइल को अपडेट करने की आवश्यकता होती है।

---

## आर्किटेक्चर स्थिति

```
@storyboard-os/routing       ← you are here
  └── (no dependencies)

apps/rpg-storyboard
  └── @storyboard-os/routing
```

`@storyboard-os/routing` में प्लेटफॉर्म या किसी भी डोमेन पैकेज से कोई इम्पोर्ट नहीं है। यह एक शुद्ध उपयोगिता है - यह केवल वही करता है जो यह करता है कि यह आपके द्वारा प्रदान किए गए कॉन्फ़िगरेशन के अनुसार स्ट्रिंग को जोड़ता है।

---

## ट्रस्ट मॉडल

`@storyboard-os/routing` एक शुद्ध स्ट्रिंग-मैनिपुलेशन लाइब्रेरी है। इसमें कोई रनटाइम दुष्प्रभाव नहीं है, कोई इनपुट/आउटपुट नहीं है, कोई नेटवर्क एक्सेस नहीं है और कोई निर्भरता नहीं है। सभी फ़ंक्शन सिंक्रोनस हैं और संदर्भ रूप से पारदर्शी हैं।

---

<p align="center">Part of <a href="https://github.com/mcp-tool-shop-org/storyboard-os">storyboard-os</a> · Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
