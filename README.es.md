<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Una plataforma de creación de historias visuales para narrativas interactivas: misiones, campañas, secuencias cinematográficas y la lógica de producción que las conecta.

**Tres áreas de enfoque, una plataforma:**

| Área de enfoque | Dominio |
|---|---|
| `rpg-storyboard` | Misiones/narrativa de juegos de rol: creación lista para su implementación |
| `marketing-storyboard` | Lanzamiento de campaña: preparación para el lanzamiento + ruta crítica |
| `cinematic-storyboard` | Tráiler/secuencia cinematográfica/video explicativo: guion gráfico de producción |

Los tres son productos, no demostraciones. Ninguno importa datos de los otros.

---

## Qué es Storyboard OS

Un panel estructurado para diseñar **narrativas implementables**. Cada cuadro en el lienzo es una escena con:
- Condiciones de entrada y salida
- Cambios de estado (indicadores, variables, estado del mundo)
- Recursos necesarios para la fase de producción
- Criterios de prueba con comprobaciones de aprobación/rechazo
- Lista de verificación de implementación

El panel visualiza el flujo del estado del juego, no solo la secuencia de la historia. Las conexiones transmiten significado: ramas de elección, arcos de consecuencias, líneas de secuencia, rutas alternativas. Un diseñador puede leer el panel y comprender lo que realmente hace el juego.

## Qué no es Storyboard OS

- Una herramienta genérica de diagramación o pizarra
- Una herramienta para dirigir sesiones o ayudar a un Dungeon Master
- Una wiki de construcción de mundos o una base de datos de trasfondo
- Un editor que solo se centra en árboles de diálogo
- Una aplicación de preparación de campañas

Si un lector pudiera confundir esto con cualquiera de esas opciones, el producto se habrá desviado de su propósito.

---

## Qué hace rpg-storyboard (Fase 2)

Después de la Fase 2, un diseñador puede crear un proyecto completo desde el principio hasta la entrega sin salir del navegador:

| Capacidad | Lo que obtiene |
|---|---|
| **Project creation** | Crear un proyecto con nombre a partir de una plantilla; las posiciones y ediciones del panel se guardan en localStorage |
| **Visual board** | Flujo de la misión y lógica de ramificación del estado del juego, lado a lado, en un lienzo Konva |
| **Beat editing** | Editar el título, el resumen y todos los campos de especificación de implementación de cualquier escena directamente en el panel |
| **Progress tracking** | Marcar los elementos de la lista de verificación de implementación y los criterios de prueba por escena; el estado se conserva al recargar |
| **Game-state signal** | Insignias por cuadro (ESTADO, ESPECIFICACIÓN/PARCIAL/BORRADOR) sin salir del panel |
| **Implementation readiness** | Cada escena muestra el estado LISTO/PARCIAL/BORRADOR/BLOQUEADO + lo que falta |
| **Project handoff** | Regenerado a partir del estado actual del proyecto: incluye el contenido editado, el progreso por escena y el origen |
| **Quest handoff** | Exportación estática en Markdown + JSON para paneles de vista previa de plantillas |
| **Templates** | Tres puntos de partida para la producción de juegos de rol con secuencias de tipos de escena y justificación |
| **Board operations** | Zoom, desplazamiento, ajuste al panel, restablecimiento, atajos de teclado: navegación utilizable en un portátil |

El panel es una superficie de creación. El inspector de escenas es una especificación de implementación editable. La entrega es un documento generado a partir del estado real del proyecto, no una instantánea estática.

### Capacidades de la Fase 1 (todavía presentes)

La Fase 1 estableció el área de enfoque de vista previa de solo lectura: renderizado del lienzo, señal del estado del juego, modelo de preparación para la implementación, exportación de la entrega de la misión, galería de plantillas y navegación del panel. Todas las capacidades de la Fase 1 se conservan y se amplían con la Fase 2.

---

## Paquetes

| Paquete | Lo que contiene |
|---|---|
| `@storyboard-os/core` | Primitivas genéricas de guion gráfico: cuadro, conexión (genérica para cada tipo), anotación, plantilla, validador estructural. Los dominios poseen sus vocabularios de conexión. |
| `@storyboard-os/rpg-domain` | Contrato de creación de juegos de rol: tipos de cuadro, campos de contenido, plantillas, modelo de preparación, generador de entrega, misión de demostración de Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrato de implementación de campaña de marketing: tipos de cuadro (audiencia, mensaje, punto de contacto, activo, aprobación, evento de lanzamiento, medición), modelo de preparación para el lanzamiento, ruta crítica, puertas de aprobación, bucles de medición, exportación del resumen de la campaña, campaña de demostración. |
| `@storyboard-os/cinematic-domain` | Contrato de producción cinematográfica: 9 tipos de cuadro, lenguaje de la cámara, requisitos de VFX/audio/continuidad, señales de producción (salud, carga, complejidad, escenas bloqueadas), entrega del resumen de producción, 3 plantillas, secuencia de tráiler de demostración. |
| `@storyboard-os/canvas` | Motor de renderizado de lienzo Konva: cuadros, conexiones, selección, arrastre, insignias de tipo, etiquetas de conexión, vista de zoom/desplazamiento. Se pasa la configuración del dominio. |
| `@storyboard-os/routing` | Ayudantes de URL configurables: generación de rutas de panel y cuadro. Sin dependencias. |

## Aplicaciones

| Aplicación | Qué es |
|---|---|
| `rpg-storyboard` | Producto de creación de juegos de rol Astro. Contiene: configuración del lienzo de RPG, inspector de cuadros, páginas de entrega, galería de plantillas, configuración de rutas, diseño de página. |
| `marketing-storyboard` | Guion gráfico de implementación de campaña Astro. Contiene: configuración del lienzo de marketing, panel de campaña, inspector de cuadros, insignia de preparación para el lanzamiento, énfasis en la ruta crítica, panel de bloqueos de lanzamiento, entrega del resumen de la campaña. |
| `cinematic-storyboard` | Guion gráfico de producción cinematográfica Astro. Contiene: configuración del lienzo cinematográfico, panel de secuencia, inspector de cuadros (cámara/VFX/audio/continuidad), panel de señales de producción (salud/carga/complejidad), entrega del resumen de producción. |

---

## Arquitectura

Los paquetes forman una cadena de dependencias limpia:

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

Un cuarto área de enfoque crearía su propio paquete de dominio y reutilizaría `@storyboard-os/core`, `@storyboard-os/canvas` y `@storyboard-os/routing` sin tocar ningún paquete de dominio existente. Tres áreas de enfoque han demostrado ahora este patrón: cero cambios en el lienzo, el núcleo o el enrutamiento.

Consulte [`docs/architecture.md`](docs/architecture.md) para obtener más detalles.

---

## Primeros pasos

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

Requisitos: Node ≥ 22.13, pnpm ≥ 11.

El ámbito de prueba se filtra automáticamente a los paquetes `@storyboard-os/*` y `rpg-storyboard`; no detecta espacios de trabajo hermanos en el directorio principal.

---

## Modelo de confianza

Storyboard OS es una **aplicación de navegador de solo uso local** (tres áreas de enfoque): sin servidor, sin cuentas, sin salida de red.

- **Datos afectados:** **Solo RPG** — datos del proyecto (especificaciones de las escenas, posiciones en la secuencia, progreso de la lista de verificación) en el navegador `localStorage` en el equipo del usuario. Los paneles de demostración estáticos de marketing y cinematografía se exportan para su entrega y **no** utilizan `localStorage` hoy.
- **Datos NO afectados:** No se utilizan credenciales, información de pago ni datos personales más allá de lo que el operador introduce en los campos de especificación (RPG) o lo que se incluye en el contenido de la demostración estática.
- **No se realizan solicitudes de red en tiempo de ejecución.** Cada aplicación es un sitio estático. Después de la carga inicial de la página, no se realizan llamadas a la red.
- **No se recopilan datos de telemetría.** No se recopila ni se transmite nada.

Consulte [`SECURITY.md`](SECURITY.md) para obtener el modelo de confianza completo y la información sobre vulnerabilidades.

---

## Estado

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

| Fase | Descripción | Estado |
|---|---|---|
| 0A–0F | Prueba de creación de RPG: lienzo, páginas de escenas, plantillas, misión de demostración | ✅ |
| 0R | Reparación y reanclaje: cada fotograma contiene las especificaciones del estado del juego | ✅ |
| 0M | Migración a monorepositorio: se extraen el núcleo, el dominio, el lienzo y el enrutamiento | ✅ |
| 1A | Visibilidad de la rama y el estado en el lienzo | ✅ |
| 1B | Preparación de la implementación por escena | ✅ |
| 1C | Exportación de la misión para su entrega | ✅ |
| 1D | Galería de plantillas | ✅ |
| 1E | Operaciones del panel: zoom, desplazamiento, ajuste, controles de la ventana | ✅ |
| 1F | Cierre del lanzamiento: documentación, registro de cambios, notas de la arquitectura | ✅ |
| 2A | Creación de proyectos a partir de plantillas: persistencia en localStorage | ✅ |
| 2B | Posiciones de los paneles persistentes por proyecto | ✅ |
| 2C | Contenido de las escenas editable: las especificaciones de los campos persisten entre las recargas | ✅ |
| 2D | Persistencia de la lista de verificación/progreso: separada del texto de la especificación | ✅ |
| 2E | Entrega del proyecto: se regenera a partir del estado del proyecto guardado | ✅ |
| 2F | Cierre del lanzamiento: documentación, registro de cambios, notas de la arquitectura | ✅ |
| M-0A | Paquete de dominio de marketing: esquema, señales, plantillas, validación, campaña de demostración | ✅ |
| M-0B | Vertical de la aplicación de marketing: panel de campaña de Astro, inspector de fotogramas, entrega | ✅ |
| M-0C | Capa de señal de preparación para el lanzamiento: ruta crítica, puertas de aprobación, bucles de medición | ✅ |
| M-0D | Cierre de marketing: documentación, registro de cambios, prueba de la arquitectura | ✅ |
| C-0A | Paquete de dominio cinematográfico: esquema, lenguaje de la cámara, VFX/audio, plantillas, validación, demostración | ✅ |
| C-0B | Vertical de la aplicación cinematográfica: panel de secuencia de Astro, inspector de fotogramas, resumen de la producción | ✅ |
| C-0C | Capa de señal de producción: estado, carga de VFX/audio, complejidad de la cámara, escenas bloqueadas | ✅ |
| C-0D | Cierre cinematográfico: documentación, registro de cambios, prueba de la arquitectura | ✅ |
| H-1A | Refuerzo del núcleo: tipos de conexión genéricos, los dominios son dueños de su vocabulario | ✅ |
| v1.2.0 | Refuerzo de la salud: el validador no genera excepciones, resistencia del almacén + versionado del esquema de localStorage, capa de tokens de diseño, acceso al lienzo mediante teclado/lector de pantalla, Astro 5 + puerta de auditoría de dependencias de CI | ✅ |
| v1.3.0 | Pase de funciones: nueve plantillas de oro + catálogos SSG; secuencia cinematográfica `/reels/demo-launch-reel`; anidamiento (`parentFrameId` + `collapsedIds`); adaptadores de motor unidireccionales; entregas de JSON Schema | ✅ |

---

## Demostración

**El libro de cuentas de la caseta de peaje** — tres facciones quieren el mismo libro de cuentas oculto. El jugador decide quién gana, quién pierde y cómo será la región a continuación. Ocho escenas con especificaciones completas del estado del juego: nombres de las banderas, requisitos de los activos, criterios de prueba de aprobación/fracaso, listas de verificación de la implementación.

Cada fotograma de la demostración se puede implementar como una misión en un motor RPG sin documentación adicional.

Ruta: `/storyboards/quest-01`

**Catálogos publicados (SSG):**

| Área de enfoque | Demostración | Plantillas |
|---|---|---|
| RPG | `/storyboards/quest-01` | `/storyboards/template-quest-flow`, `template-quest-branch`, `template-cutscene-beat` |
| Marketing | `/campaigns/campaign-01` | `/campaigns/template-product_launch`, `template-campaign_funnel`, `template-content_to_conversion` |
| Cinematográfico | `/sequences/demo-launch-trailer` · reel `/reels/demo-launch-reel` | `/sequences/template-trailer-flow`, `template-cutscene-sequence`, `template-explainer-video` |

---

## Documentación

- [`docs/architecture.md`](docs/architecture.md) — separación de paquetes, reglas de dependencia, modelo de ventana del lienzo, límite de almacenamiento del proyecto, extensibilidad
- [`docs/product-brief.md`](docs/product-brief.md) — qué es rpg-storyboard, usuario objetivo, advertencias de desviación, puertas de aceptación
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrato de creación de juegos RPG, ciclo de creación completo (Fase 2), modelo de preparación, exportación para su entrega
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrato de implementación de la campaña de marketing, modelo de preparación para el lanzamiento, ruta crítica, exclusiones
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — guion gráfico de producción cinematográfica, señales de producción, lenguaje de la cámara, exclusiones deliberadas
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narración principal de la Fase 0 cinematográfica, puertas de aceptación, prueba
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narración principal de la Fase 0 de marketing, puertas de aceptación, prueba
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narración principal de la Fase 2, registro de integridad de la arquitectura, exclusiones deliberadas
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narración principal de la Fase 1 y registro de integridad de la arquitectura
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — veredicto de la Fase 0 y lista de tareas pendientes original de la Fase 1
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro de la migración 0M: qué se movió, por qué y la arquitectura resultante
- [`CHANGELOG.md`](CHANGELOG.md) — historial de lanzamientos
- [Página de inicio](https://mcp-tool-shop-org.github.io/storyboard-os/) · [Manual](https://mcp-tool-shop-org.github.io/storyboard-os/handbook/)

---

<p align="center">Built by <a href="https://mcp-tool-shop.github.io/">MCP Tool Shop</a></p>
