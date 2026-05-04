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

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>

---

Une plateforme de création visuelle pour la narration interactive, permettant de concevoir des quêtes, des embranchements, des scènes, des rencontres, des conséquences, et la logique de l'état du jeu qui les relie.

**rpg-storyboard** est la première application : un outil de création de jeux pour la conception de quêtes et de scènes de jeux de rôle vidéo. Ce n'est pas une démonstration ou un prototype. C'est le produit pour lequel cette plateforme a été conçue.

---

## Qu'est-ce que Storyboard OS ?

Un tableau structuré pour concevoir une **narration réalisable**. Chaque cadre sur la toile représente une étape, avec :
- Les conditions d'entrée et de sortie
- Les changements d'état (indicateurs, variables, état du monde)
- Les ressources nécessaires pour la phase de production
- Les critères de test avec vérifications de succès/échec
- Une liste de contrôle de mise en œuvre

Le tableau visualise le flux de l'état du jeu, et non seulement la séquence de l'histoire. Les connexions ont un sens : embranchements de choix, arcs de conséquences, séquences principales, chemins de secours. Un concepteur peut lire le tableau et comprendre ce que le jeu fait réellement.

## Ce que Storyboard OS n'est pas

- Un outil de diagramme générique ou un tableau blanc.
- Un moteur de session ou un outil d'aide pour le maître de jeu.
- Une base de connaissances ou une encyclopédie du monde du jeu.
- Un éditeur de dialogues uniquement.
- Une application de préparation de campagne.

Si un utilisateur pouvait confondre ce produit avec l'un de ceux-là, cela signifie que le produit a dévié de son objectif.

---

## Ce que rpg-storyboard fait (Phase 2)

Après la phase 2, un concepteur peut créer un projet complet, du début à la remise, sans quitter le navigateur :

| Fonctionnalités | Ce qu'ils obtiennent |
|---|---|
| **Project creation** | Créer un projet nommé à partir d'un modèle ; les positions et les modifications du tableau sont conservées dans le stockage local. |
| **Visual board** | Le flux de la quête et la logique des embranchements de l'état du jeu côte à côte sur une toile Konva. |
| **Beat editing** | Modifier le titre, le résumé et tous les champs de spécification de mise en œuvre de chaque étape directement sur le tableau. |
| **Progress tracking** | Cocher les éléments de la liste de contrôle de mise en œuvre et les critères de test pour chaque étape ; l'état est conservé lors du rechargement. |
| **Game-state signal** | Badges par étape (ÉTAT, SPÉCIFIÉ/PARTIEL/PROJET) sans quitter le tableau. |
| **Implementation readiness** | Chaque étape affiche l'état PRÊT/PARTIEL/PROJET/BLOQUÉ, ainsi que ce qui manque. |
| **Project handoff** | Regénéré à partir de l'état du projet en direct : inclut le contenu modifié, la progression par étape, la provenance. |
| **Quest handoff** | Exportation statique en Markdown + JSON pour les tableaux de modèles. |
| **Templates** | Trois points de départ pour la production de jeux de rôle, avec des séquences de types d'étapes et des justifications. |
| **Board operations** | Zoom, panoramique, ajustement à la taille du tableau, réinitialisation, raccourcis clavier : navigation utilisable avec un ordinateur portable. |

Le tableau est une surface de création. L'inspecteur d'étape est une spécification de mise en œuvre modifiable. La remise est un document généré à partir de l'état réel du projet, et non une simple capture d'écran.

### Fonctionnalités de la phase 1 (toujours présentes)

La phase 1 a établi la version de prévisualisation en lecture seule : rendu de la toile, signal d'état du jeu, modèle de préparation à la mise en œuvre, exportation de remise de quête, galerie de modèles et navigation dans le tableau. Toutes les fonctionnalités de la phase 1 sont conservées et étendues par la phase 2.

---

## Paquets

| Paquet | Ce qu'il contient |
|---|---|
| `@storyboard-os/core` | Primitives de tableau structurées : cadre, connexion, annotation, modèle, validateur structurel. Pas de vocabulaire spécifique au domaine. |
| `@storyboard-os/rpg-domain` | Contrat de création de jeux de rôle : types de cadres, champs de contenu, modèles, modèle de préparation, générateur de remise, démonstration de quête Tollhouse Ledger. |
| `@storyboard-os/canvas` | Rendu de toile Konva : cadres, connexions, sélection, glissement, badges de type, étiquettes de connexion, vue panoramique/zoom. La configuration du domaine est passée en paramètre. |
| `@storyboard-os/routing` | Aideurs d'URL configurables : génération de routes de tableau et de cadres. Aucune dépendance. |

## Applications

| Application | Ce que c'est |
|---|---|
| `rpg-storyboard` | Un produit de création de jeux de rôle Astro. Contient : configuration de la toile de jeu de rôle, inspecteur de cadre, pages de remise, galerie de modèles, configuration de route, mise en page de page. |

---

## Architecture

Les paquets forment une chaîne de dépendances claire :

```
apps/rpg-storyboard
  → @storyboard-os/rpg-domain  (RPG game-authoring contract)
  → @storyboard-os/canvas      (Konva renderer, domain-configurable)
  → @storyboard-os/routing     (URL helpers)

@storyboard-os/rpg-domain
  → @storyboard-os/core        (generic primitives)

@storyboard-os/canvas
  → (no platform deps — pure Konva + React)

@storyboard-os/routing
  → (no deps — pure string helpers)

@storyboard-os/core
  → (no deps)
```

Une deuxième branche verticale (par exemple, `apps/screenplay-storyboard`) créerait son propre paquet de domaine et réutiliserait `@storyboard-os/core`, `@storyboard-os/canvas` et `@storyboard-os/routing` sans modifier `@storyboard-os/rpg-domain`.

Consultez [`docs/architecture.md`](docs/architecture.md) pour plus de détails.

---

## Démarrage rapide

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (368 tests)
pnpm build      # builds rpg-storyboard (42 pages)
pnpm verify     # test + build in one command (ship gate)
```

Prérequis : Node ≥ 20, pnpm ≥ 9.

La portée des tests est automatiquement filtrée pour inclure les paquets `@storyboard-os/*` et `rpg-storyboard` ; elle ne prend pas en compte les espaces de travail frères dans le répertoire parent.

---

## Modèle de confiance

Storyboard OS est une **application de navigateur fonctionnant uniquement localement** : pas de serveur, pas de comptes, pas de communication réseau.

- **Données concernées :** Données du projet (spécifications des séquences, positions des éléments, progression des listes de contrôle) stockées uniquement dans le `localStorage` du navigateur sur la machine de l'utilisateur.
- **Données NON concernées :** Aucune information d'identification, aucune information de paiement, aucune donnée personnelle au-delà de ce que le concepteur saisit dans les champs de spécification des séquences.
- **Aucune requête réseau à l'exécution.** L'application est un site statique. Après le chargement initial de la page, aucune requête réseau n'est effectuée.
- **Aucune télémétrie.** Rien n'est collecté ou transmis.

Consultez [`SECURITY.md`](SECURITY.md) pour le modèle de confiance complet et le signalement des vulnérabilités.

---

## Statut

```
Phase 2 complete
368/368 tests passing
42/42 pages built
```

| Phase | Description | Statut |
|---|---|---|
| 0A–0F | Preuve de création de contenu RPG : zone de dessin, pages de séquences, modèles, quête de démonstration. | ✅ |
| 0R | Correction et réancrage : chaque image contient les spécifications de l'état du jeu. | ✅ |
| 0M | Migration vers un monorepo : extraction des éléments principaux, du domaine, de la zone de dessin et du routage. | ✅ |
| 1A | Visibilité des branches et de l'état sur la zone de dessin. | ✅ |
| 1B | Prêt à être implémenté pour chaque séquence. | ✅ |
| 1C | Exportation de la transmission de la quête. | ✅ |
| 1D | Galerie de modèles. | ✅ |
| 1E | Opérations sur la zone de dessin : zoom, panoramique, ajustement, contrôles de la zone d'affichage. | ✅ |
| 1F | Finalisation de la version : documentation, journal des modifications, notes d'architecture. | ✅ |
| 2A | Création de projets à partir de modèles : persistance dans le `localStorage`. | ✅ |
| 2B | Positions des éléments persistantes par projet. | ✅ |
| 2C | Contenu des séquences modifiable : les champs de spécification sont conservés lors du rechargement. | ✅ |
| 2D | Persistance de la liste de contrôle / de la progression : distincte du texte de la spécification. | ✅ |
| 2E | Transmission du projet : régénérée à partir de l'état du projet enregistré. | ✅ |
| 2F | Finalisation de la version : documentation, journal des modifications, notes d'architecture. | ✅ |

---

## Démo

**The Tollhouse Ledger** — trois factions veulent le même registre caché. Le joueur décide qui gagne, qui perd et à quoi ressemble la région ensuite. Huit séquences avec des spécifications complètes de l'état du jeu : noms des drapeaux, exigences des ressources, critères de réussite/échec, listes de contrôle d'implémentation.

Chaque image de la démo peut être implémentée comme une quête dans un moteur de RPG sans documentation supplémentaire.

Chemin : `/storyboards/quest-01`

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — séparation des paquets, règles de dépendance, modèle de zone d'affichage, limite de stockage du projet, extensibilité.
- [`docs/product-brief.md`](docs/product-brief.md) — ce qu'est rpg-storyboard, utilisateur cible, avertissements de dérive, critères d'acceptation.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrat de création de jeux RPG, boucle de création complète (Phase 2), modèle de préparation, exportation de la transmission.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — récit de la phase 2, enregistrement de l'intégrité de l'architecture, exclusions délibérées.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — récit de la phase 1 et enregistrement de l'intégrité de l'architecture.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — verdict de test de la phase 0 et backlog initial de la phase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — journal de migration 0M : ce qui a été déplacé, pourquoi et l'architecture résultante.
- [`CHANGELOG.md`](CHANGELOG.md) — historique des versions.
