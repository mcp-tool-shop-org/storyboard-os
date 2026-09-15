<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Une plateforme d’écriture de scénarios visuels pour les récits interactifs : quêtes, campagnes, séquences cinématographiques et la logique de production qui les relie.

**Trois axes, une seule plateforme :**

| Axe | Domaine |
|---|---|
| `rpg-storyboard` | Quête/récit de jeu de rôle (RPG) — outil d’écriture prêt à être mis en œuvre |
| `marketing-storyboard` | Lancement de campagne — préparation au lancement + chemin critique |
| `cinematic-storyboard` | Bande-annonce/séquence/vidéo explicative — création de storyboards de production |

Les trois sont des produits, pas des démos. Aucun ne reprend des éléments des autres.

---

## Qu’est-ce que Storyboard OS

Un tableau structuré pour concevoir des **récits implémentables**. Chaque élément du tableau représente une étape avec :
- Conditions d’entrée et de sortie
- Modifications d’état (indicateurs, variables, état du monde)
- Ressources requises pour la phase de production
- Critères de test avec vérifications de réussite/échec
- Liste de contrôle de l’implémentation

Le tableau visualise le flux de l’état du jeu, et pas seulement la séquence de l’histoire. Les connexions ont une signification : branches de choix, arcs de conséquences, axes de séquence, chemins de repli. Un concepteur peut lire le tableau et comprendre ce que le jeu fait réellement.

## Ce que Storyboard OS n’est pas

- Un outil générique de création de diagrammes ou un tableau blanc
- Un outil de gestion de session ou une aide pour le maître de jeu
- Une encyclopédie ou une base de données sur l’univers du jeu
- Un éditeur uniquement pour les arbres de dialogue
- Une application de préparation de campagne

Si un lecteur pouvait le confondre avec l’un de ces éléments, le produit se serait éloigné de son objectif.

---

## Ce que rpg-storyboard fait (phase 2)

Après la phase 2, un concepteur peut créer un projet complet, du début à la livraison, sans quitter le navigateur :

| Capacité | Ce qu’il obtient |
|---|---|
| **Project creation** | Créer un projet nommé à partir d’un modèle ; les positions et les modifications du tableau sont conservées dans localStorage |
| **Visual board** | Flux de quête et logique de branchement de l’état du jeu côte à côte sur un canevas Konva |
| **Beat editing** | Modifier le titre, le résumé et tous les champs de spécification de l’implémentation de n’importe quelle étape directement sur le tableau |
| **Progress tracking** | Cocher les éléments de la liste de contrôle de l’implémentation et les critères de test par étape ; l’état est conservé lors du rechargement |
| **Game-state signal** | Badges par étape (ÉTAT, SPÉCIFIQUE/PARTIEL/BROUISSE) sans quitter le tableau |
| **Implementation readiness** | Chaque étape affiche l’état PRÊT/PARTIEL/BROUISSE/BLOQUÉ + ce qui manque |
| **Project handoff** | Regénéré à partir de l’état actuel du projet : inclut le contenu modifié, la progression par étape et la provenance |
| **Quest handoff** | Exportation statique en Markdown + JSON pour les tableaux de prévisualisation de modèles |
| **Templates** | Trois points de départ pour la production de RPG avec des séquences de types d’étapes et une justification |
| **Board operations** | Zoom, panoramique, ajustement au tableau, réinitialisation, raccourcis clavier — navigation utilisable sur un ordinateur portable |

Le tableau est une surface d’écriture. L’inspecteur d’étape est une spécification d’implémentation modifiable. La livraison est un document généré à partir de l’état réel du projet, et non d’une capture statique.

### Capacités de la phase 1 (toujours présentes)

La phase 1 a établi l’axe de prévisualisation en lecture seule : rendu du canevas, signal d’état du jeu, modèle de préparation à l’implémentation, exportation de la livraison de la quête, galerie de modèles et navigation du tableau. Toutes les capacités de la phase 1 sont conservées et étendues par la phase 2.

---

## Packages

| Package | Ce qu’il contient |
|---|---|
| `@storyboard-os/core` | Primitives génériques de storyboard : étape, connexion (générique par rapport au type), annotation, modèle, validateur structurel. Les domaines possèdent leurs propres vocabulaires de connexion. |
| `@storyboard-os/rpg-domain` | Contrat d’écriture de jeu RPG : types d’étapes, champs de contenu, modèles, modèle de préparation, générateur de livraison, quête de démonstration de Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrat d’implémentation de campagne marketing : types d’étapes (public, message, point de contact, ressource, approbation, événement de lancement, mesure), modèle de préparation au lancement, chemin critique, étapes d’approbation, boucles de mesure, exportation du résumé de la campagne, campagne de démonstration. |
| `@storyboard-os/cinematic-domain` | Contrat de production cinématographique : 9 types d’étapes, langage de la caméra, exigences en matière d’effets visuels/audio/continuité, signaux de production (santé, charge, complexité, plans bloqués), livraison du résumé de la production, 3 modèles, séquence de bande-annonce de démonstration. |
| `@storyboard-os/canvas` | Rendu du canevas Konva : étapes, connexions, sélection, glissement, badges de type, étiquettes de connexion, vue zoom/panoramique. Configuration du domaine transmise. |
| `@storyboard-os/routing` | Aides URL configurables : génération de routes de tableau et d’étape. Aucune dépendance. |

## Applications

| Application | Ce que c’est |
|---|---|
| `rpg-storyboard` | Produit d’écriture de jeu RPG Astro. Contient : configuration du canevas RPG, inspecteur d’étape, pages de livraison, galerie de modèles, configuration de la route, mise en page de la page. |
| `marketing-storyboard` | Storyboard d’implémentation de campagne Astro. Contient : configuration du canevas marketing, tableau de campagne, inspecteur d’étape, badge de préparation au lancement, accent sur le chemin critique, panneau des bloqueurs de lancement, livraison du résumé de la campagne. |
| `cinematic-storyboard` | Storyboard de production cinématographique Astro. Contient : configuration du canevas cinématographique, tableau de séquence, inspecteur d’étape (caméra/effets visuels/audio/continuité), panneau des signaux de production (santé/charge/complexité), livraison du résumé de la production. |

---

## Architecture

Les packages forment une chaîne de dépendances propre :

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

Un quatrième axe créerait son propre package de domaine et réutiliserait `@storyboard-os/core`, `@storyboard-os/canvas` et `@storyboard-os/routing` sans toucher à aucun package de domaine existant. Trois axes ont désormais prouvé ce modèle : aucun changement apporté au canevas, au noyau ou au routage.

Voir [`docs/architecture.md`](docs/architecture.md) pour plus de détails.

---

## Démarrage rapide

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

Prérequis : Node ≥ 22.13, pnpm ≥ 11.

La portée des tests est automatiquement filtrée pour les packages `@storyboard-os/*` et `rpg-storyboard` — elle ne prend pas en compte les espaces de travail frères dans le répertoire parent.

---

## Modèle de confiance

Storyboard OS est une **application de navigateur locale uniquement** (trois axes) — pas de serveur, pas de comptes, pas de transfert de données sur le réseau.

- **Données concernées :** **uniquement RPG** — données du projet (spécifications des séquences, positions des éléments, progression de la liste de contrôle) dans le navigateur `localStorage` sur la machine de l’utilisateur. Les maquettes statiques de démonstration marketing et cinématographique, avec exportation pour le transfert, n’utilisent **pas** `localStorage` aujourd’hui.
- **Données non concernées :** aucun identifiant, aucune information de paiement, aucune donnée personnelle au-delà de ce que l’opérateur saisit dans les champs de spécification (RPG) ou de ce qui est ajouté au contenu de la démonstration statique.
- **Aucune requête réseau pendant l’exécution.** Chaque application est un site statique. Après le chargement initial de la page, aucune requête réseau n’est effectuée.
- **Aucune télémétrie.** Rien n’est collecté ni transmis.

Consultez [`SECURITY.md`](SECURITY.md) pour obtenir le modèle de confiance complet et les informations sur les vulnérabilités.

---

## État

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

| Phase | Description | État |
|---|---|---|
| 0A–0F | Preuve de création RPG — canevas, pages de séquences, modèles, quête de démonstration | ✅ |
| 0R | Réparation + réancrage — chaque image contient les spécifications de l’état du jeu | ✅ |
| 0M | Migration vers un monoréférentiel — cœur, domaine, canevas, routage extraits | ✅ |
| 1A | Visibilité de la branche et de l’état sur le canevas | ✅ |
| 1B | Préparation de l’implémentation par séquence | ✅ |
| 1C | Exportation du transfert de quête | ✅ |
| 1D | Galerie de modèles | ✅ |
| 1E | Opérations sur le canevas — zoom, panoramique, ajustement, commandes de la zone d’affichage | ✅ |
| 1F | Clôture de la publication — documentation, journal des modifications, notes sur l’architecture | ✅ |
| 2A | Création de projet à partir de modèles — persistance dans localStorage | ✅ |
| 2B | Positions des éléments du canevas persistantes par projet | ✅ |
| 2C | Contenu de la séquence modifiable — les champs de spécification sont conservés lors du rechargement | ✅ |
| 2D | Persistance de la liste de contrôle/de la progression — séparée du texte de la spécification | ✅ |
| 2E | Transfert de projet — régénéré à partir de l’état du projet enregistré | ✅ |
| 2F | Clôture de la publication — documentation, journal des modifications, notes sur l’architecture | ✅ |
| M-0A | Package de domaine marketing — schéma, signaux, modèles, validation, campagne de démonstration | ✅ |
| M-0B | Application marketing verticale — canevas de campagne Astro, inspecteur d’images, transfert | ✅ |
| M-0C | Couche de signal de préparation au lancement — chemin critique, étapes d’approbation, boucles de mesure | ✅ |
| M-0D | Clôture marketing — documentation, journal des modifications, preuve de l’architecture | ✅ |
| C-0A | Package de domaine cinématographique — schéma, langage de la caméra, effets visuels/audio, modèles, validation, démonstration | ✅ |
| C-0B | Application cinématographique verticale — canevas de séquence Astro, inspecteur d’images, résumé de la production | ✅ |
| C-0C | Couche de signal de production — état, charge des effets visuels/audio, complexité de la caméra, plans bloqués | ✅ |
| C-0D | Clôture cinématographique — documentation, journal des modifications, preuve de l’architecture | ✅ |
| H-1A | Renforcement du cœur — types de connexion génériques, les domaines gèrent leur propre vocabulaire | ✅ |
| v1.2.0 | Renforcement de la santé — validateur sans exception, résilience du stockage + versionnement du schéma localStorage, couche de jetons de conception, accès au canevas par le clavier/lecteur d’écran, Astro 5 + étape de vérification des dépendances CI | ✅ |
| v1.3.0 | Passage des fonctionnalités — neuf modèles d’or + catalogues SSG ; séquence cinématographique `/reels/demo-launch-reel` ; imbrication (`parentFrameId` + `collapsedIds`) ; adaptateurs de moteur unidirectionnels ; transferts JSON Schema | ✅ |

---

## Démo

**Le registre de la barrière** — trois factions veulent le même registre caché. Le joueur décide qui gagne, qui perd et à quoi ressemblera la région par la suite. Huit séquences avec des spécifications complètes de l’état du jeu : noms des indicateurs, exigences en matière d’actifs, critères de test de réussite/échec, listes de contrôle de l’implémentation.

Chaque image de la démonstration peut être implémentée en tant que quête dans un moteur RPG sans documentation supplémentaire.

Route : `/storyboards/quest-01`

**Catalogues publiés (SSG) :**

| Axe | Démo | Modèles |
|---|---|---|
| RPG | `/storyboards/quest-01` | `/storyboards/template-quest-flow`, `template-quest-branch`, `template-cutscene-beat` |
| Marketing | `/campaigns/campaign-01` | `/campaigns/template-product_launch`, `template-campaign_funnel`, `template-content_to_conversion` |
| Cinématique | `/sequences/demo-launch-trailer` · bobine `/reels/demo-launch-reel` | `/sequences/template-trailer-flow`, `template-cutscene-sequence`, `template-explainer-video` |

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — séparation des packages, règles de dépendance, modèle de zone d’affichage du canevas, limite de stockage du projet, extensibilité
- [`docs/product-brief.md`](docs/product-brief.md) — en quoi consiste rpg-storyboard, utilisateur cible, avertissements de dérive, étapes d’acceptation
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrat d’écriture de jeu RPG, boucle d’écriture complète (phase 2), modèle de préparation, exportation du transfert
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrat d’implémentation de campagne marketing, modèle de préparation au lancement, chemin critique, exclusions
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard de production cinématographique, signaux de production, langage de la caméra, exclusions délibérées
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — récit principal de la phase 0 cinématographique, étapes d’acceptation, preuve
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — récit principal de la phase 0 marketing, étapes d’acceptation, preuve
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — récit principal de la phase 2, enregistrement de l’intégrité de l’architecture, exclusions délibérées
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — récit principal de la phase 1 et enregistrement de l’intégrité de l’architecture
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — verdict de la phase 0 et liste de contrôle initiale de la phase 1
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — journal de la migration 0M : ce qui a été déplacé, pourquoi et l’architecture résultante
- [`CHANGELOG.md`](CHANGELOG.md) — historique des versions
- [Page d’accueil](https://mcp-tool-shop-org.github.io/storyboard-os/) · [Manuel](https://mcp-tool-shop-org.github.io/storyboard-os/handbook/)

---

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
