<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.es.md">Español</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/mcp-tool-shop-org/brand/main/logos/storyboard-os/readme.png" alt="Storyboard OS — Visual Stories. Structured. Implemented." width="400" />
</p>

<p align="center">
  <a href="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml"><img src="https://github.com/mcp-tool-shop-org/storyboard-os/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
</p>


---

Une plateforme de création de récits interactifs, basée sur une structure visuelle, permettant de concevoir des quêtes, des campagnes, des cinématiques, et la logique de production qui les relie.

Trois tours, une plateforme.

| Vertical. | Domaine. |
|---|---|
| `rpg-storyboard` | Quête/narration de jeu de rôle — outil de création prêt à être utilisé. |
| `marketing-storyboard` | Lancement de la campagne : préparation au lancement + chemin critique. |
| `cinematic-storyboard` | Storyboard pour les bandes-annonces, les cinématiques et les vidéos explicatives — récit de la production. |

Les trois éléments sont des produits, et non des versions de démonstration. Aucun ne dépend des autres.

---

## Qu'est-ce que Storyboard OS ?

Un tableau structuré pour concevoir une **narration réalisable**. Chaque cadre du tableau représente une étape, avec :
- Les conditions d'entrée et de sortie
- Les changements d'état (indicateurs, variables, état du monde)
- Les ressources nécessaires pour la phase de production
- Les critères de test avec des vérifications de succès/échec
- Une liste de contrôle pour la mise en œuvre.

Le tableau permet de visualiser le déroulement du jeu, et pas seulement la séquence narrative. Les connexions ont une signification : elles représentent les embranchements possibles, les conséquences, les séquences principales et les chemins de secours. Un concepteur peut examiner ce tableau et comprendre le fonctionnement réel du jeu.

## Ce que Storyboard OS n'est pas

- Un outil générique de création de schémas ou de tableau blanc.
- Un outil de gestion de session ou une aide pour le maître de jeu.
- Une base de connaissances ou une encyclopédie pour la création de mondes.
- Un éditeur dédié uniquement à la création d'arbres de dialogue.
- Une application de préparation de campagne.

Si un lecteur pouvait confondre ce produit avec l'un de ceux-là, cela signifie que le produit a perdu de sa spécificité.

---

## Ce que fait rpg-storyboard (phase 2) :

Après la phase 2, un concepteur peut créer un projet complet, de sa conception à sa finalisation, sans quitter le navigateur.

| Capacité. | Ce qu'ils reçoivent. |
|---|---|
| **Project creation** | Créer un projet nommé à partir d'un modèle ; les positions des éléments et les modifications sont conservées dans le stockage local (localStorage). |
| **Visual board** | Affichage côte à côte du flux de questions et de la logique de gestion de l'état du jeu sur une toile Konva. |
| **Beat editing** | Modifiez directement sur le tableau le titre, le résumé et tous les champs spécifiques de chaque morceau musical. |
| **Progress tracking** | Cochez les éléments de la liste de contrôle de mise en œuvre et les critères de test pour chaque section ; le système reste opérationnel après un redémarrage. |
| **Game-state signal** | Badges par image (ÉTAT, SPÉCIFIQUE/PARTIEL/AVANT-PROJET) sans quitter l'interface. |
| **Implementation readiness** | Chaque étape indique l'état : PRÊT, PARTIEL, PROVISOIRE ou BLOQUÉ, ainsi que les éléments manquants. |
| **Project handoff** | Restauré à partir de l'état initial du projet : inclut le contenu modifié, l'évolution étape par étape et les informations d'origine. |
| **Quest handoff** | Exportation en Markdown statique et en JSON pour les tableaux de prévisualisation des modèles. |
| **Templates** | Trois points de départ pour la création de jeux de rôle, avec des séquences structurées et une justification pour chaque approche. |
| **Board operations** | Zoom, panoramique, ajustement à la taille de l'écran, réinitialisation, raccourcis clavier : navigation optimisée pour les ordinateurs portables. |

La maquette est une surface de conception. Le document de spécifications techniques est une version modifiable. Le rapport de transmission est un document généré à partir de l'état réel du projet, et non une simple copie statique.

### Fonctionnalités de la phase 1 (toujours présentes)

La phase 1 a défini la fonctionnalité de prévisualisation en lecture seule, comprenant le rendu de l'interface, la transmission de l'état du jeu, le modèle de préparation à la mise en œuvre, l'exportation des données de mission, la galerie de modèles et la navigation dans l'interface. Toutes les fonctionnalités de la phase 1 sont conservées et étendues dans la phase 2.

---

## Forfaits

| Paquet. | Ce qu'il possède. |
|---|---|
| `@storyboard-os/core` | Éléments de base génériques pour les storyboards : cadre, connexion (générique, applicable à différents types), annotation, modèle, validateur structurel. Chaque domaine possède son propre vocabulaire de connexions. |
| `@storyboard-os/rpg-domain` | Contrat de développement de jeux de rôle : types de structures, champs de contenu, modèles, modèle de préparation, générateur de transfert de données, et une démonstration de quête appelée "Tollhouse Ledger". |
| `@storyboard-os/marketing-domain` | Contrat de mise en œuvre de la campagne marketing : types de paramètres (public cible, message, point de contact, ressource, approbation, événement de lancement, mesure), modèle de préparation au lancement, chemin critique, étapes d'approbation, boucles de mesure, exportation du brief de campagne, campagne de démonstration. |
| `@storyboard-os/cinematic-domain` | Contrat de production cinématographique : 9 types de plans, langage de la caméra, exigences relatives aux effets spéciaux/audio/continuité, signaux de production (état, charge, complexité, plans bloqués), transmission du brief de production, 3 modèles, séquence de bande-annonce. |
| `@storyboard-os/canvas` | Rendu de canvas Konva : plans, connexions, sélection, glisser-déposer, badges de type, étiquettes de connexion, zoom/déplacement de la vue. Configuration du domaine passée en paramètre. |
| `@storyboard-os/routing` | Fonctions d'aide d'URL configurables : génération des routes du tableau et des plans. Aucune dépendance. |

## Applications

| Application | Description |
|---|---|
| `rpg-storyboard` | Produit de création de jeux de rôle (RPG). Inclut : configuration du canvas RPG, inspecteur de plans, pages de transmission, galerie de modèles, configuration des routes, mise en page des pages. |
| `marketing-storyboard` | Storyboard d'implémentation de campagne RPG. Inclut : configuration du canvas de marketing, tableau de campagne, inspecteur de plans, indicateur de préparation au lancement, mise en évidence du chemin critique, panneau des blocages de lancement, transmission du brief de campagne. |
| `cinematic-storyboard` | Storyboard de production cinématographique. Inclut : configuration du canvas cinématographique, tableau de séquence, inspecteur de plans (caméra/effets spéciaux/audio/continuité), panneau des signaux de production (état/charge/complexité), transmission du brief de production. |

---

## Architecture

Les packages forment une chaîne de dépendances claire :

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

Un quatrième module créerait son propre package de domaine et réutiliserait `@storyboard-os/core`, `@storyboard-os/canvas` et `@storyboard-os/routing` sans modifier aucun package de domaine existant. Trois modules ont déjà démontré ce modèle : aucun changement apporté au canvas, au core ou au routing.

Consultez [`docs/architecture.md`](docs/architecture.md) pour plus de détails.

---

## Démarrage rapide

<!-- AUTOGEN-NOTE : Les valeurs des snapshots (649 tests, 54 pages) ci-dessous sont mises à jour manuellement.
Vérifiez avec : pnpm test (nombre de tests), pnpm -r build (nombre de pages).
Consultez docs/snapshot-checklist.md pour chaque emplacement contenant ces snapshots. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (649 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # test + build in one command (ship gate)
```

Prérequis : Node ≥ 20, pnpm ≥ 9.

La portée des tests est automatiquement filtrée pour inclure les packages `@storyboard-os/*` et `rpg-storyboard` ; elle n'inclut pas les espaces de travail frères du répertoire parent.

---

## Modèle de confiance

Storyboard OS est une **application pour navigateur fonctionnant uniquement localement** : pas de serveur, pas de comptes, pas de communication réseau.

- **Données concernées :** Données du projet (spécifications des étapes, positions du tableau, progression des listes de contrôle) stockées dans le `localStorage` du navigateur sur la machine de l'utilisateur uniquement.
- **Données NON concernées :** Aucune identité, aucune information de paiement, aucune donnée personnelle au-delà de ce que le concepteur saisit dans les champs des spécifications des étapes.
- **Aucune requête réseau à l'exécution.** L'application est un site statique. Après le chargement initial de la page, aucune requête réseau n'est effectuée.
- **Aucune télémétrie.** Rien n'est collecté ou transmis.

Consultez [`SECURITY.md`](SECURITY.md) pour le modèle de confiance complet et le signalement des vulnérabilités.

---

## Statut

<!-- AUTOGEN-NOTE : Les valeurs des snapshots ci-dessous (649 tests, 54 pages, 6 packages, 3 applications) sont
mises à jour manuellement. Vérifiez avec :
pnpm test                       # tests réussis
pnpm -r build                   # pages construites (nombre à partir de la sortie Astro)
ls packages/ | wc -l            # nombre de packages
ls apps/ | wc -l                # nombre d'applications
Consultez docs/snapshot-checklist.md pour chaque document contenant ces informations. -->

```
Phase 2 complete + Marketing Phase 0 complete + Cinematic Phase 0 complete + Core Hardening 1A
649/649 tests passing
54/54 pages built
6 packages · 3 apps
```

| Phase | Description | Statut |
|---|---|---|
| 0A–0F | Preuve de création de RPG : canvas, pages d'étapes, modèles, quête de démonstration | ✅ |
| 0R | Correction et réancrage : chaque plan contient une spécification de l'état du jeu | ✅ |
| 0M | Migration vers un monorepo : core, domain, canvas, routing extraits | ✅ |
| 1A | Visibilité des branches et de l'état sur le canvas | ✅ |
| 1B | Préparation à la mise en œuvre par étape | ✅ |
| 1C | Exportation de la quête | ✅ |
| 1D | Galerie de modèles | ✅ |
| 1E | Opérations sur le tableau : zoom, déplacement, ajustement, contrôles de la vue | ✅ |
| 1F | Release : finalisation, documentation, journal des modifications, notes d'architecture. | ✅ |
| 2A | Création de projets à partir de modèles : persistance via localStorage. | ✅ |
| 2B | Positions des éléments du tableau persistantes par projet. | ✅ |
| 2C | Contenu des séquences modifiable : les champs de spécification persistent lors du rechargement. | ✅ |
| 2D | Persistance des listes de contrôle / de l'état d'avancement : séparée du texte de la spécification. | ✅ |
| 2E | Transmission de projet : régénéré à partir de l'état du projet enregistré. | ✅ |
| 2F | Release : finalisation, documentation, journal des modifications, notes d'architecture. | ✅ |
| M-0A | Package du domaine marketing : schéma, signaux, modèles, validation, campagne de démonstration. | ✅ |
| M-0B | Verticale applicative marketing : tableau de campagne Astro, inspecteur de trame, transmission de projet. | ✅ |
| M-0C | Couche de signaux de préparation au lancement : chemin critique, étapes d'approbation, boucles de mesure. | ✅ |
| M-0D | Finalisation du marketing : documentation, journal des modifications, validation de l'architecture. | ✅ |
| C-0A | Package du domaine cinématographique : schéma, langage de la caméra, effets spéciaux/audio, modèles, validation, démonstration. | ✅ |
| C-0B | Verticale applicative cinématographique : tableau de séquence Astro, inspecteur de trame, brief de production. | ✅ |
| C-0C | Couche de signaux de production : état de santé, charge des effets spéciaux/audio, complexité de la caméra, plans bloqués. | ✅ |
| C-0D | Finalisation du cinématographique : documentation, journal des modifications, validation de l'architecture. | ✅ |
| H-1A | Renforcement de la sécurité : types de connexion génériques, les domaines gèrent leur propre vocabulaire. | ✅ |

---

## Démonstration

**Le registre de Tollhouse** : trois factions veulent le même registre caché. Le joueur décide qui gagne, qui perd, et à quoi ressemble la région ensuite. Huit séquences avec une spécification complète de l'état du jeu : noms des drapeaux, exigences en matière de ressources, critères de test de réussite/échec, listes de contrôle de mise en œuvre.

Chaque trame de la démonstration peut être implémentée comme une quête dans un moteur de jeu de rôle sans documentation supplémentaire.

Chemin : `/storyboards/quest-01`

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — séparation des packages, règles de dépendance, modèle de viewport du canevas, limite de stockage du projet, extensibilité.
- [`docs/product-brief.md`](docs/product-brief.md) — qu'est-ce que rpg-storyboard, utilisateur cible, avertissements de dérive, étapes d'acceptation.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrat de création de jeux de rôle, boucle de création complète (Phase 2), modèle de préparation, exportation de transmission.
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrat de mise en œuvre de campagne marketing, modèle de préparation au lancement, chemin critique, exclusions.
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — storyboard de production cinématographique, signaux de production, langage de la caméra, exclusions délibérées.
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narration de la phase 0 cinématographique, étapes d'acceptation, validation.
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narration de la phase 0 marketing, étapes d'acceptation, validation.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narration de la phase 2, enregistrement de l'intégrité de l'architecture, exclusions délibérées.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narration de la phase 1 et enregistrement de l'intégrité de l'architecture.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — verdict de la phase 0 (test interne) et backlog original de la phase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — journal de migration vers le monorepo : ce qui a été déplacé, pourquoi, et l'architecture résultante.
- [`CHANGELOG.md`](CHANGELOG.md) — historique des versions.
