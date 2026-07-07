<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.md">English</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>


---

Une plateforme d’écriture de scénarios visuels pour les récits interactifs : quêtes, campagnes, séquences cinématographiques et la logique de production qui les relie.

**Trois axes, une seule plateforme :**

| Axe | Domaine |
|---|---|
| `rpg-storyboard` | Quête/récit de jeu RPG : outil d’écriture prêt à être mis en œuvre. |
| `marketing-storyboard` | Lancement de campagne : préparation au lancement + chemin critique. |
| `cinematic-storyboard` | Bande-annonce / scène coupée / vidéo explicative : création du storyboard de production. |

Les trois sont des produits, et non des démos. Aucun ne reprend les éléments des autres.

---

## Qu’est-ce que Storyboard OS ?

Un tableau structuré pour concevoir un récit **pouvant être mis en œuvre**. Chaque image sur le canevas représente une étape avec :
- Conditions d’entrée et de sortie
- Modifications d’état (indicateurs, variables, état du monde)
- Ressources requises pour la phase de production
- Critères de test avec vérifications de réussite/échec
- Liste de contrôle de mise en œuvre

Le tableau visualise le flux de l’état du jeu, et pas seulement la séquence narrative. Les connexions ont une signification : branches de choix, arcs de conséquences, axes de séquences, chemins alternatifs. Un concepteur peut lire le tableau et comprendre ce que fait réellement le jeu.

## Ce que Storyboard OS n’est pas

- Un outil générique de création de diagrammes ou un tableau blanc
- Un outil d’animation de session ou une aide pour le maître du jeu
- Une base de connaissances collaborative ou une base de données sur l’univers du jeu
- Un éditeur uniquement dédié aux arbres de dialogue
- Une application de préparation de campagne

Si un lecteur pouvait confondre cela avec l’un de ces éléments, le produit se serait éloigné de son objectif.

---

## Ce que fait rpg-storyboard (phase 2)

Après la phase 2, un concepteur peut créer un projet complet du début à la livraison sans quitter le navigateur :

| Capacité | Ce qu’il obtient |
|---|---|
| **Project creation** | Créer un projet nommé à partir d’un modèle ; les positions et modifications du tableau sont conservées dans localStorage. |
| **Visual board** | Flux de la quête et logique des branches de l’état du jeu côte à côte sur un canevas Konva. |
| **Beat editing** | Modifier le titre, le résumé et tous les champs de spécification de mise en œuvre d’une étape directement sur le tableau. |
| **Progress tracking** | Cocher les éléments de la liste de contrôle de mise en œuvre et les critères de test par étape ; l’état est conservé lors du rechargement. |
| **Game-state signal** | Badges par image (ÉTAT, SPÉCIFIQUE/PARTIEL/BROUISSON) sans quitter le tableau. |
| **Implementation readiness** | Chaque étape affiche un statut PRÊT/PARTIEL/BROUISSON/BLOQUÉ + ce qui manque. |
| **Project handoff** | Regénéré à partir de l’état actuel du projet : inclut le contenu modifié, la progression par étape et la provenance. |
| **Quest handoff** | Exportation statique en Markdown + JSON pour les tableaux d’aperçu des modèles. |
| **Templates** | Trois points de départ pour la production RPG avec des séquences de types d’étapes et une justification. |
| **Board operations** | Zoom, panoramique, ajustement au tableau, réinitialisation, raccourcis clavier : navigation utilisable sur un ordinateur portable. |

Le tableau est une surface d’écriture. L’inspecteur des étapes est une spécification de mise en œuvre modifiable. La livraison est un document généré à partir de l’état réel du projet, et non d’une capture statique.

### Capacités de la phase 1 (toujours présentes)

La phase 1 a établi l’axe d’aperçu en lecture seule : rendu sur le canevas, signal d’état du jeu, modèle de préparation à la mise en œuvre, exportation pour la livraison des quêtes, galerie de modèles et navigation dans le tableau. Toutes les capacités de la phase 1 sont conservées et étendues par la phase 2.

---

## Packages

| Package | Ce qu’il contient |
|---|---|
| `@storyboard-os/core` | Primitives génériques du storyboard : image, connexion (générique pour tous les types), annotation, modèle, validateur structurel. Les domaines possèdent leurs propres vocabulaires de connexion. |
| `@storyboard-os/rpg-domain` | Contrat d’écriture de jeux RPG : types d’images, champs de contenu, modèles, modèle de préparation, générateur de livraison, quête de démonstration Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrat de mise en œuvre de campagne marketing : types d’images (public cible, message, point de contact, ressource, approbation, événement de lancement, mesure), modèle de préparation au lancement, chemin critique, étapes d’approbation, boucles de mesure, exportation du résumé de la campagne, campagne de démonstration. |
| `@storyboard-os/cinematic-domain` | Contrat de production cinématographique : 9 types d’images, langage de la caméra, exigences en matière d’effets visuels/audio/continuité, signaux de production (état, charge, complexité, plans bloqués), livraison du résumé de production, 3 modèles, séquence de bande-annonce de démonstration. |
| `@storyboard-os/canvas` | Rendu sur canevas Konva : images, connexions, sélection, glisser-déposer, badges de type, étiquettes de connexion, vue zoom/panoramique. Configuration du domaine transmise. |
| `@storyboard-os/routing` | Aides URL configurables : génération des routes du tableau et des images. Aucune dépendance. |

## Applications

| Application | Ce que c’est |
|---|---|
| `rpg-storyboard` | Produit d’écriture de jeux RPG Astro. Contient : configuration du canevas RPG, inspecteur des images, pages de livraison, galerie de modèles, configuration des routes, mise en page des pages. |
| `marketing-storyboard` | Storyboard de mise en œuvre de campagne Astro. Contient : configuration du canevas marketing, tableau de la campagne, inspecteur des images, badge de préparation au lancement, emphase sur le chemin critique, panneau des bloqueurs de lancement, livraison du résumé de la campagne. |
| `cinematic-storyboard` | Storyboard de production cinématographique Astro. Contient : configuration du canevas cinématographique, tableau des séquences, inspecteur des images (caméra/effets visuels/audio/continuité), panneau des signaux de production (état/charge/complexité), livraison du résumé de production. |

---

## Architecture

Les packages forment une chaîne de dépendances propre :

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

Un quatrième axe créerait son propre package de domaine et réutiliserait `@storyboard-os/core`, `@storyboard-os/canvas` et `@storyboard-os/routing` sans toucher à aucun package de domaine existant. Trois axes ont désormais prouvé ce modèle : zéro modification du canevas, du cœur ou du routage.

Voir [`docs/architecture.md`](docs/architecture.md) pour plus de détails.

---

## Démarrage rapide

<!-- NOTE D’AUTOGÉNÉRATION : les valeurs instantanées (937 tests, 54 pages) ci-dessous sont mises à jour manuellement.
Vérifiez avec : pnpm test (nombre de tests), pnpm -r build (nombre de pages).
Voir docs/snapshot-checklist.md pour chaque emplacement qui contient ces instantanés. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (937 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

Configuration requise : Node ≥ 20, pnpm ≥ 10.

Le champ d’application des tests est automatiquement filtré pour inclure les paquets `@storyboard-os/*` et `rpg-storyboard`. Il n’inclut pas les espaces de travail frères dans le répertoire parent.

---

## Modèle de confiance

Storyboard OS est une **application de navigateur locale uniquement** — aucun serveur, aucun compte, aucune communication réseau sortante.

- **Données concernées :** Données du projet (spécifications des séquences, positions sur le tableau, progression de la liste de contrôle) dans `localStorage` du navigateur, uniquement sur la machine de l’utilisateur.
- **Données non concernées :** Aucun identifiant, aucune information de paiement, aucune donnée personnelle au-delà de ce que le concepteur saisit dans les champs des spécifications des séquences.
- **Aucune requête réseau pendant l’exécution.** L’application est un site statique. Après le chargement initial de la page, aucune communication réseau n’est effectuée.
- **Pas de télémétrie.** Aucune donnée n’est collectée ni transmise.

Consultez [`SECURITY.md`](SECURITY.md) pour obtenir le modèle de confiance complet et les informations sur la déclaration des vulnérabilités.

---

## État

<!-- NOTE AUTOGÉNÉRÉE : Les valeurs instantanées ci-dessous (937 tests, 54 pages, 6 paquets, 3 applications) sont mises à jour manuellement. Vérifiez avec :
pnpm test                       # tests réussis
pnpm -r build                   # pages générées (comptez à partir de la sortie d’Astro)
ls packages/ | wc -l            # nombre de paquets
ls apps/ | wc -l                # nombre d’applications
Consultez docs/snapshot-checklist.md pour connaître l’emplacement de chaque document contenant ces informations. -->

```
Phase 2 + Marketing Phase 0 + Cinematic Phase 0 + Core Hardening 1A + v1.2.0 Health Hardening
937/937 tests passing
54/54 pages built
6 packages · 3 apps
```

| Phase | Description | État |
|---|---|---|
| 0A–0F | Preuve de création RPG — toile, pages de séquences, modèles, quête de démonstration | ✅ |
| 0R | Réparation + réancrage — chaque image contient les spécifications de l’état du jeu | ✅ |
| 0M | Migration vers un monorepositoire — cœur, domaine, toile, routage extraits | ✅ |
| 1A | Visibilité des branches et des états sur la toile | ✅ |
| 1B | Préparation à l’implémentation par séquence | ✅ |
| 1C | Export de transfert de quête | ✅ |
| 1D | Galerie de modèles | ✅ |
| 1E | Opérations sur le tableau — zoom, panoramique, ajustement, commandes de la zone d’affichage | ✅ |
| 1F | Clôture du lancement — documentation, journal des modifications, notes sur l’architecture | ✅ |
| 2A | Création de projet à partir de modèles — persistance dans `localStorage` | ✅ |
| 2B | Positions persistantes du tableau par projet | ✅ |
| 2C | Contenu de séquence modifiable — les champs des spécifications sont conservés lors du rechargement | ✅ |
| 2D | Persistance de la liste de contrôle/de la progression — séparée du texte des spécifications | ✅ |
| 2E | Transfert de projet — régénéré à partir de l’état du projet enregistré | ✅ |
| 2F | Clôture du lancement — documentation, journal des modifications, notes sur l’architecture | ✅ |
| M-0A | Paquet de domaine marketing — schéma, signaux, modèles, validation, campagne de démonstration | ✅ |
| M-0B | Application verticale de marketing — tableau de campagne Astro, inspecteur d’images, transfert | ✅ |
| M-0C | Couche de signal de préparation au lancement — chemin critique, étapes d’approbation, boucles de mesure | ✅ |
| M-0D | Clôture du marketing — documentation, journal des modifications, preuve de l’architecture | ✅ |
| C-0A | Paquet de domaine cinématographique — schéma, langage de la caméra, effets visuels/audio, modèles, validation, démonstration | ✅ |
| C-0B | Application verticale cinématographique — tableau de séquences Astro, inspecteur d’images, résumé de la production | ✅ |
| C-0C | Couche de signal de production — état, charge des effets visuels/audio, complexité de la caméra, plans bloqués | ✅ |
| C-0D | Clôture cinématographique — documentation, journal des modifications, preuve de l’architecture | ✅ |
| H-1A | Renforcement du cœur — types de connexion génériques, les domaines gèrent leur propre vocabulaire | ✅ |
| v1.2.0 | Renforcement de la santé — validateur sans exception, résilience du stockage + versionnage du schéma `localStorage`, couche de jetons de conception, accès à la toile par le clavier/lecteur d’écran, Astro 5 + étape d’audit des dépendances CI | ✅ |

---

## Démonstration

**The Tollhouse Ledger** — trois factions veulent le même registre caché. Le joueur décide qui gagne, qui perd et à quoi ressemblera la région par la suite. Huit séquences avec des spécifications complètes de l’état du jeu : noms des drapeaux, exigences en matière d’actifs, critères de test de réussite/échec, listes de contrôle de l’implémentation.

Chaque image de la démonstration peut être implémentée comme une quête dans un moteur RPG sans documentation supplémentaire.

Route : `/storyboards/quest-01`

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — séparation des paquets, règles de dépendance, modèle de zone d’affichage de la toile, limite de stockage du projet, extensibilité
- [`docs/product-brief.md`](docs/product-brief.md) — en quoi consiste rpg-storyboard, utilisateur cible, avertissements sur les dérives, étapes d’approbation
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrat de création de jeux RPG, cycle de création complet (Phase 2), modèle de préparation, exportation du transfert
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrat d’implémentation de la campagne de marketing, modèle de préparation au lancement, chemin critique, exclusions
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard de production cinématographique, signaux de production, langage de la caméra, exclusions délibérées
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — récit principal de la phase 0 cinématographique, étapes d’approbation, preuve
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — récit principal de la phase 0 marketing, étapes d’approbation, preuve
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — récit principal de la phase 2, enregistrement de l’intégrité de l’architecture, exclusions délibérées
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — récit principal de la phase 1 et enregistrement de l’intégrité de l’architecture
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — verdict du test bêta de la phase 0 et liste des tâches initiales de la phase 1
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — journal de migration 0M : ce qui a été déplacé, pourquoi et l’architecture résultante
- [`CHANGELOG.md`](CHANGELOG.md) — historique des versions
