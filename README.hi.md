<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.md">English</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="550" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://mcp-tool-shop-org.github.io/storyboard-os/"><img src="https://img.shields.io/badge/landing-Pages-0ea5e9.svg" alt="Landing page" /></a>
  <a href="https://www.npmjs.com/package/@storyboard-os/core"><img src="https://img.shields.io/npm/v/@storyboard-os/core.svg" alt="npm @storyboard-os/core" /></a>
</p>


---

एक इंटरैक्टिव कथा के लिए दृश्य कहानी-संरचना निर्माण मंच — खोज, अभियान, सिनेमाई दृश्य और उत्पादन तर्क जो उन्हें जोड़ता है।

**तीन क्षेत्र, एक मंच:**

| क्षेत्र | डोमेन |
|---|---|
| `rpg-storyboard` | आरपीजी खोज / गेम कथा — कार्यान्वयन के लिए तैयार निर्माण |
| `marketing-storyboard` | अभियान लॉन्च — लॉन्च की तैयारी + महत्वपूर्ण पथ |
| `cinematic-storyboard` | ट्रेलर / कटसीन / व्याख्यात्मक वीडियो — उत्पादन स्टोरीबोर्डिंग |

ये तीनों उत्पाद हैं, डेमो नहीं। इनमें से कोई भी दूसरे से डेटा आयात नहीं करता है।

---

## स्टोरीबोर्ड ओएस क्या है

**कार्यान्वयन योग्य कथा** को डिजाइन करने के लिए एक संरचित बोर्ड। कैनवस पर प्रत्येक फ्रेम एक दृश्य है जिसमें:
- प्रवेश और निकास शर्तें
- स्थिति परिवर्तन (फ्लैग, चर, विश्व-स्थिति)
- उत्पादन चरण के लिए आवश्यक संपत्ति
- पास/फेल जांच के साथ परीक्षण मानदंड
- कार्यान्वयन चेकलिस्ट

बोर्ड गेम-स्थिति प्रवाह को दर्शाता है, न कि केवल कहानी अनुक्रम को। कनेक्शन अर्थ रखते हैं — विकल्प शाखाएं, परिणाम चाप, अनुक्रम रीढ़, वैकल्पिक पथ। एक डिजाइनर बोर्ड को पढ़ सकता है और समझ सकता है कि गेम वास्तव में क्या करता है।

## स्टोरीबोर्ड ओएस क्या नहीं है

- एक सामान्य आरेखण या व्हाइटबोर्ड उपकरण
- एक सत्र चलाने वाला या जीएम सहायक
- एक विश्व-निर्माण विकी या ज्ञानकोश
- केवल संवाद-वृक्ष संपादक
- एक अभियान तैयारी ऐप

यदि कोई पाठक इसे इनमें से किसी के लिए गलत समझ सकता है, तो उत्पाद भटक गया है।

---

## आरपीजी-स्टोरीबोर्ड क्या करता है (चरण 2)

चरण 2 के बाद, एक डिजाइनर ब्राउज़र छोड़ने के बिना, शुरुआत से लेकर अंतिम चरण तक एक पूर्ण परियोजना का निर्माण कर सकता है:

| क्षमता | उन्हें क्या मिलता है |
|---|---|
| **Project creation** | एक टेम्पलेट से एक नामित परियोजना बनाएं; बोर्ड की स्थिति और संपादन localStorage में बने रहते हैं |
| **Visual board** | खोज प्रवाह और गेम-स्थिति शाखा तर्क एक साथ एक कोन्वा कैनवस पर |
| **Beat editing** | किसी भी दृश्य के शीर्षक, सारांश और सभी कार्यान्वयन-विशिष्ट फ़ील्ड को सीधे बोर्ड पर संपादित करें |
| **Progress tracking** | कार्यान्वयन चेकलिस्ट आइटम और प्रति दृश्य परीक्षण मानदंडों की जांच करें; स्थिति रीलोड होने पर भी बनी रहती है |
| **Game-state signal** | प्रति-फ्रेम बैज (स्थिति, विशिष्ट / आंशिक / मसौदा) बोर्ड छोड़ने के बिना |
| **Implementation readiness** | प्रत्येक दृश्य तैयार / आंशिक / मसौदा / अवरुद्ध स्थिति दिखाता है + क्या गायब है |
| **Project handoff** | लाइव परियोजना स्थिति से पुन: उत्पन्न — इसमें संपादित सामग्री, प्रति-दृश्य प्रगति, उत्पत्ति शामिल है |
| **Quest handoff** | टेम्पलेट पूर्वावलोकन बोर्ड के लिए स्थिर मार्कडाउन + JSON निर्यात |
| **Templates** | दृश्य-प्रकार अनुक्रम और तर्क के साथ तीन आरपीजी उत्पादन शुरुआती बिंदु |
| **Board operations** | ज़ूम, पैन, बोर्ड में फिट, रीसेट, कीबोर्ड शॉर्टकट — लैपटॉप पर उपयोग करने योग्य नेविगेशन |

बोर्ड एक निर्माण सतह है। दृश्य निरीक्षक एक संपादन योग्य कार्यान्वयन विनिर्देश है। अंतिम चरण एक वास्तविक परियोजना स्थिति से उत्पन्न एक दस्तावेज है — न कि एक स्थिर स्नैपशॉट।

### चरण 1 क्षमताएं (अभी भी मौजूद)

चरण 1 ने केवल-पढ़ने योग्य पूर्वावलोकन क्षेत्र स्थापित किया: कैनवस रेंडरिंग, गेम-स्थिति संकेत, कार्यान्वयन तत्परता मॉडल, खोज हैंडऑफ़ निर्यात, टेम्पलेट गैलरी और बोर्ड नेविगेशन। चरण 1 की सभी क्षमताएं चरण 2 द्वारा संरक्षित और विस्तारित हैं।

---

## पैकेज

| पैकेज | यह क्या रखता है |
|---|---|
| `@storyboard-os/core` | सामान्य स्टोरीबोर्ड आदिम: फ्रेम, कनेक्शन (प्रकार में सामान्य), एनोटेशन, टेम्पलेट, संरचनात्मक सत्यापनकर्ता। डोमेन अपने कनेक्शन शब्दावली के मालिक हैं। |
| `@storyboard-os/rpg-domain` | आरपीजी गेम-निर्माण अनुबंध: फ्रेम प्रकार, सामग्री फ़ील्ड, टेम्पलेट, तत्परता मॉडल, हैंडऑफ़ जनरेटर, टोलहाउस लेजर डेमो खोज। |
| `@storyboard-os/marketing-domain` | विपणन अभियान-कार्यान्वयन अनुबंध: फ्रेम प्रकार (दर्शक, संदेश, संपर्क बिंदु, संपत्ति, अनुमोदन, लॉन्च_घटना, माप), लॉन्च तत्परता मॉडल, महत्वपूर्ण पथ, अनुमोदन गेट, माप लूप, अभियान संक्षिप्त निर्यात, डेमो अभियान। |
| `@storyboard-os/cinematic-domain` | सिनेमाई उत्पादन अनुबंध: 9 फ्रेम प्रकार, कैमरा भाषा, वीएफएक्स / ऑडियो / निरंतरता आवश्यकताएं, उत्पादन संकेत (स्वास्थ्य, बोझ, जटिलता, अवरुद्ध शॉट्स), उत्पादन संक्षिप्त हैंडऑफ़, 3 टेम्पलेट, डेमो ट्रेलर अनुक्रम। |
| `@storyboard-os/canvas` | कोन्वा कैनवस रेंडरर: फ्रेम, कनेक्शन, चयन, खींचें, प्रकार बैज, कनेक्शन लेबल, ज़ूम / पैन दृश्य। डोमेन कॉन्फ़िगरेशन पारित किया गया। |
| `@storyboard-os/routing` | कॉन्फ़िगर करने योग्य यूआरएल सहायक: बोर्ड और फ्रेम मार्ग पीढ़ी। कोई निर्भरता नहीं। |

## ऐप्स

| ऐप | यह क्या है |
|---|---|
| `rpg-storyboard` | एस्ट्रो आरपीजी गेम-निर्माण उत्पाद। इसमें शामिल हैं: आरपीजी कैनवस कॉन्फ़िगरेशन, फ्रेम इंस्पेक्टर, हैंडऑफ़ पेज, टेम्पलेट गैलरी, मार्ग सेटअप, पेज लेआउट। |
| `marketing-storyboard` | एस्ट्रो अभियान-कार्यान्वयन स्टोरीबोर्ड। इसमें शामिल हैं: विपणन कैनवस कॉन्फ़िगरेशन, अभियान बोर्ड, फ्रेम इंस्पेक्टर, लॉन्च तत्परता बैज, महत्वपूर्ण पथ जोर, लॉन्च अवरोधक पैनल, अभियान संक्षिप्त हैंडऑफ़। |
| `cinematic-storyboard` | एस्ट्रो सिनेमाई उत्पादन स्टोरीबोर्ड। इसमें शामिल हैं: सिनेमाई कैनवस कॉन्फ़िगरेशन, अनुक्रम बोर्ड, फ्रेम इंस्पेक्टर (कैमरा / वीएफएक्स / ऑडियो / निरंतरता), उत्पादन संकेत पैनल (स्वास्थ्य / बोझ / जटिलता), उत्पादन संक्षिप्त हैंडऑफ़। |

---

## आर्किटेक्चर

पैकेज एक स्वच्छ निर्भरता श्रृंखला बनाते हैं:

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain       (RPG game-authoring contract)
  → @storyboard-os/canvas           (Konva renderer, domain-configurable)
  → @storyboard-os/routing          (URL helpers)

apps/marketing-storyboard
  → @storyboard-os/marketing-domain  (marketing campaign-implementation contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

apps/cinematic-storyboard
  → @storyboard-os/cinematic-domain  (cinematic production contract)
  → @storyboard-os/canvas            (same canvas, different config)
  → @storyboard-os/routing           (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/marketing-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/cinematic-domain
  → @storyboard-os/core              (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

एक चौथा क्षेत्र अपना स्वयं का डोमेन पैकेज बनाएगा और `@storyboard-os/core`, `@storyboard-os/canvas` और `@storyboard-os/routing` का पुन: उपयोग करेगा बिना किसी मौजूदा डोमेन पैकेज को छुए। तीन क्षेत्रों ने अब इस पैटर्न को साबित कर दिया है: कैनवस, कोर या रूटिंग में कोई बदलाव नहीं।

पूर्ण विवरण के लिए [`docs/architecture.md`](docs/architecture.md) देखें।

---

## त्वरित शुरुआत

<!-- AUTOGEN-NOTE: Snapshot values (1413 tests, 63 pages) below are manually updated.
     Verify with: pnpm test (test count), pnpm -r build (page count).
     See docs/snapshot-checklist.md for every location that holds these snapshots. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (1413 tests)
pnpm build      # builds all 3 apps (63 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

आवश्यकताएं: नोड ≥ 22.13, पीएनपीएम ≥ 11।

परीक्षण का दायरा स्वचालित रूप से `@storyboard-os/*` पैकेजों और `rpg-storyboard` तक सीमित है — यह मूल निर्देशिका में भाई-बहन कार्यस्थानों को नहीं उठाता है।

---

## विश्वास मॉडल

स्टोरीबोर्ड ओएस एक **केवल-स्थानीय ब्राउज़र एप्लिकेशन** है (तीन क्षेत्र) — कोई सर्वर नहीं, कोई खाता नहीं, कोई नेटवर्क आउटपुट नहीं।

- **डेटा जिस पर कार्रवाई की गई:** **केवल RPG** — ब्राउज़र `localStorage` में उपयोगकर्ता के डिवाइस पर प्रोजेक्ट डेटा (बीट स्पेसिफिकेशन, बोर्ड पोजीशन, चेकलिस्ट प्रगति)। मार्केटिंग और सिनेमैटिक शिप स्टैटिक डेमो बोर्ड, जिसमें हैंडऑफ़ एक्सपोर्ट शामिल है, और आज `localStorage` का उपयोग न करें।
- **डेटा जिस पर कार्रवाई नहीं की गई:** कोई क्रेडेंशियल नहीं, कोई भुगतान जानकारी नहीं, ऑपरेटर द्वारा स्पेसिफिकेशन फ़ील्ड (RPG) में टाइप किए गए डेटा या स्टैटिक डेमो सामग्री में शामिल डेटा से परे कोई व्यक्तिगत डेटा नहीं।
- **रनटाइम पर कोई नेटवर्क अनुरोध नहीं।** प्रत्येक ऐप एक स्टैटिक साइट है। प्रारंभिक पेज लोड के बाद, कोई नेटवर्क कॉल नहीं किया जाता है।
- **कोई टेलीमेट्री नहीं।** कुछ भी एकत्र या प्रसारित नहीं किया जाता है।

पूर्ण ट्रस्ट मॉडल और भेद्यता रिपोर्टिंग के लिए [`SECURITY.md`](SECURITY.md) देखें।

---

## स्थिति

<!-- AUTOGEN-NOTE: Snapshot values below (1413 tests, 63 pages, 6 packages, 3 apps) are
     manually updated. Verify with:
       pnpm test                       # tests passing
       pnpm -r build                   # pages built (count from Astro output)
       ls packages/ | wc -l            # package count
       ls apps/ | wc -l                # app count
     See docs/snapshot-checklist.md for every doc location that holds these. -->

```
v1.3.0 Feature Pass — gold templates, playlist, nest, engine adapters
1413/1413 tests passing
63/63 pages built
6 packages · 3 apps
```

| चरण | विवरण | स्थिति |
|---|---|---|
| 0A–0F | RPG ऑथरिंग प्रूफ — कैनवस, बीट पेज, टेम्पलेट, डेमो क्वेस्ट | ✅ |
| 0R | मरम्मत + री-एंकर — प्रत्येक फ्रेम में गेम-स्टेट स्पेसिफिकेशन होता है | ✅ |
| 0M | मोनोरेपो माइग्रेशन — कोर, डोमेन, कैनवस, रूटिंग को अलग किया गया | ✅ |
| 1A | कैनवस पर शाखा + स्थिति दृश्यता | ✅ |
| 1B | प्रत्येक बीट के लिए कार्यान्वयन की तैयारी | ✅ |
| 1C | क्वेस्ट हैंडऑफ़ एक्सपोर्ट | ✅ |
| 1D | टेम्पलेट गैलरी | ✅ |
| 1E | बोर्ड संचालन — ज़ूम, पैन, फिट, व्यूपोर्ट नियंत्रण | ✅ |
| 1F | रिलीज़ क्लोजआउट — दस्तावेज़, चेंजलॉग, आर्किटेक्चर नोट्स | ✅ |
| 2A | टेम्पलेट से प्रोजेक्ट निर्माण — localStorage पर्सिस्टेंस | ✅ |
| 2B | प्रत्येक प्रोजेक्ट के लिए लगातार बोर्ड पोजीशन | ✅ |
| 2C | संपादित करने योग्य बीट सामग्री — स्पेसिफिकेशन फ़ील्ड रीलोड के बाद भी बने रहते हैं | ✅ |
| 2D | चेकलिस्ट / प्रगति पर्सिस्टेंस — स्पेसिफिकेशन टेक्स्ट से अलग | ✅ |
| 2E | प्रोजेक्ट हैंडऑफ़ — सहेजे गए प्रोजेक्ट स्थिति से पुन: उत्पन्न | ✅ |
| 2F | रिलीज़ क्लोजआउट — दस्तावेज़, चेंजलॉग, आर्किटेक्चर नोट्स | ✅ |
| M-0A | मार्केटिंग डोमेन पैकेज — स्कीमा, सिग्नल, टेम्पलेट, सत्यापन, डेमो अभियान | ✅ |
| M-0B | मार्केटिंग ऐप वर्टिकल — एस्ट्रो अभियान बोर्ड, फ्रेम इंस्पेक्टर, हैंडऑफ़ | ✅ |
| M-0C | लॉन्च रेडीनेस सिग्नल लेयर — महत्वपूर्ण पथ, अनुमोदन गेट, माप लूप | ✅ |
| M-0D | मार्केटिंग क्लोजआउट — दस्तावेज़, चेंजलॉग, आर्किटेक्चर प्रूफ | ✅ |
| C-0A | सिनेमैटिक डोमेन पैकेज — स्कीमा, कैमरा भाषा, VFX/ऑडियो, टेम्पलेट, सत्यापन, डेमो | ✅ |
| C-0B | सिनेमैटिक ऐप वर्टिकल — एस्ट्रो सीक्वेंस बोर्ड, फ्रेम इंस्पेक्टर, प्रोडक्शन ब्रीफ | ✅ |
| C-0C | प्रोडक्शन सिग्नल लेयर — स्वास्थ्य, VFX/ऑडियो भार, कैमरा जटिलता, अवरुद्ध शॉट्स | ✅ |
| C-0D | सिनेमैटिक क्लोजआउट — दस्तावेज़, चेंजलॉग, आर्किटेक्चर प्रूफ | ✅ |
| H-1A | कोर हार्डनिंग — सामान्य कनेक्शन प्रकार, डोमेन अपनी शब्दावली के मालिक हैं | ✅ |
| v1.2.0 | स्वास्थ्य हार्डनिंग — वैलिडेटर नो-थ्रो, स्टोर लचीलापन + localStorage स्कीमा संस्करण, डिज़ाइन-टोकन लेयर, कीबोर्ड/स्क्रीन-रीडर कैनवस एक्सेस, एस्ट्रो 5 + CI निर्भरता-ऑडिट गेट | ✅ |
| v1.3.0 | फ़ीचर पास — नौ स्वर्ण टेम्पलेट + SSG कैटलॉग; सिनेमैटिक सीक्वेंसप्लेलिस्ट `/reels/demo-launch-reel`; नेस्ट (`parentFrameId` + `collapsedIds`); वन-वे इंजन एडेप्टर; JSON स्कीमा हैंडऑफ़ | ✅ |

---

## डेमो

**द टोलहाउस लेजर** — तीन गुट एक ही छिपे हुए लेजर चाहते हैं। खिलाड़ी यह तय करता है कि कौन जीतेगा, कौन हारेगा और अगले क्षेत्र कैसा दिखेगा। पूर्ण गेम-स्टेट स्पेसिफिकेशन के साथ आठ बीट: ध्वज नाम, संपत्ति आवश्यकताएं, पास/असफल परीक्षण मानदंड, कार्यान्वयन चेकलिस्ट।

डेमो में प्रत्येक फ्रेम को RPG इंजन में पूरक दस्तावेज़ के बिना एक क्वेस्ट के रूप में लागू किया जा सकता है।

मार्ग: `/storyboards/quest-01`

**प्रकाशित कैटलॉग (SSG):**

| क्षेत्र | डेमो | टेम्पलेट |
|---|---|---|
| RPG | `/storyboards/quest-01` | `/storyboards/template-quest-flow`, `template-quest-branch`, `template-cutscene-beat` |
| मार्केटिंग | `/campaigns/campaign-01` | `/campaigns/template-product_launch`, `template-campaign_funnel`, `template-content_to_conversion` |
| सिनेमैटिक | `/sequences/demo-launch-trailer` · रील `/reels/demo-launch-reel` | `/sequences/template-trailer-flow`, `template-cutscene-sequence`, `template-explainer-video` |

---

## दस्तावेज़

- [`docs/architecture.md`](docs/architecture.md) — पैकेज पृथक्करण, निर्भरता नियम, कैनवस व्यूपोर्ट मॉडल, प्रोजेक्ट स्टोरेज सीमा, विस्तारशीलता
- [`docs/product-brief.md`](docs/product-brief.md) — rpg-स्टोरीबोर्ड क्या है, लक्षित उपयोगकर्ता, विचलन चेतावनी, स्वीकृति गेट
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — RPG गेम-ऑथरिंग अनुबंध, पूर्ण ऑथरिंग लूप (चरण 2), तत्परता मॉडल, हैंडऑफ़ एक्सपोर्ट
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — मार्केटिंग अभियान-कार्यान्वयन अनुबंध, लॉन्च तत्परता मॉडल, महत्वपूर्ण पथ, बहिष्करण
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — सिनेमैटिक प्रोडक्शन स्टोरीबोर्ड, प्रोडक्शन सिग्नल, कैमरा भाषा, जानबूझकर बहिष्करण
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — सिनेमैटिक चरण 0 स्पाइन नैरेटिव, स्वीकृति गेट, प्रूफ
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — मार्केटिंग चरण 0 स्पाइन नैरेटिव, स्वीकृति गेट, प्रूफ
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — चरण 2 स्पाइन नैरेटिव, आर्किटेक्चर इंटीग्रिटी रिकॉर्ड, जानबूझकर बहिष्करण
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — चरण 1 स्पाइन नैरेटिव और आर्किटेक्चर इंटीग्रिटी रिकॉर्ड
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — चरण 0 डॉगफूड निर्णय और मूल चरण 1 बैकलॉग
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — 0M माइग्रेशन लॉग: क्या स्थानांतरित किया गया, क्यों, और परिणामी आर्किटेक्चर
- [`CHANGELOG.md`](CHANGELOG.md) — रिलीज़ इतिहास
- [लैंडिंग पेज](https://mcp-tool-shop-org.github.io/storyboard-os/) · [हैंडबुक](https://mcp-tool-shop-org.github.io/storyboard-os/handbook/)

---

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
