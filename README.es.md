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

Una plataforma de creación de estructuras narrativas visuales para narrativas interactivas: misiones, campañas, cinemáticas y la lógica de producción que las conecta.

**Tres áreas, una plataforma:**

| Área | Dominio |
|---|---|
| `rpg-storyboard` | Narrativa/misión de juego de rol (RPG) — creación lista para la implementación. |
| `marketing-storyboard` | Lanzamiento de campaña — preparación para el lanzamiento + ruta crítica. |
| `cinematic-storyboard` | Tráiler/escena cinemática/explicación — guion gráfico de producción. |

Los tres son productos, no demostraciones. Ninguno importa datos de los otros.

---

## ¿Qué es Storyboard OS?

Un tablero estructurado para diseñar una **narrativa implementable**. Cada cuadro en el lienzo es un elemento con:
- Condiciones de entrada y salida.
- Cambios de estado (banderas, variables, estado del mundo).
- Activos necesarios para la fase de producción.
- Criterios de prueba con verificaciones de aprobación/fallo.
- Lista de verificación de implementación.

El tablero visualiza el flujo del estado del juego, no solo la secuencia de la historia. Las conexiones tienen significado: ramas de elección, arcos de consecuencias, estructuras de secuencia, rutas de respaldo. Un diseñador puede leer el tablero y comprender lo que realmente hace el juego.

## ¿Qué NO es Storyboard OS?

- Una herramienta genérica de diagramación o pizarra.
- Un ejecutor de sesiones o una herramienta de ayuda para el director de juego (GM).
- Una wiki de creación de mundos o una base de datos de lore.
- Un editor de árboles de diálogo.
- Una aplicación de preparación de campañas.

Si un lector pudiera confundir esto con cualquiera de esos, el producto se ha desviado.

---

## ¿Qué hace rpg-storyboard (Fase 2)?

Después de la Fase 2, un diseñador puede crear un proyecto completo desde el principio hasta la entrega sin salir del navegador:

| Capacidad | Lo que obtienen |
|---|---|
| **Project creation** | Crear un proyecto con nombre a partir de una plantilla; las posiciones y ediciones del tablero se conservan en localStorage. |
| **Visual board** | Flujo de la misión y lógica de ramificación del estado del juego, uno al lado del otro, en un lienzo Konva. |
| **Beat editing** | Editar el título, el resumen y todos los campos de especificación de implementación de cada elemento directamente en el tablero. |
| **Progress tracking** | Marcar los elementos de la lista de verificación de implementación y los criterios de prueba para cada elemento; el estado se conserva al recargar. |
| **Game-state signal** | Insignias por cuadro (ESTADO, ESPECIFICADO/PARCIAL/BORRADOR) sin salir del tablero. |
| **Implementation readiness** | Cada elemento muestra el estado LISTO/PARCIAL/BORRADOR/BLOQUEADO, además de lo que falta. |
| **Project handoff** | Regenerado a partir del estado actual del proyecto: incluye contenido editado, progreso por elemento, procedencia. |
| **Quest handoff** | Exportación estática de Markdown + JSON para tableros de vista previa de plantillas. |
| **Templates** | Tres puntos de partida para la producción de juegos de rol con secuencias de tipos de elementos y justificación. |
| **Board operations** | Zoom, desplazamiento, ajuste al tablero, restablecimiento, atajos de teclado: navegación utilizable con portátil. |

El tablero es una superficie de creación. El inspector de elementos es una especificación de implementación editable. La entrega es un documento generado a partir del estado real del proyecto, no una instantánea estática.

### Capacidades de la Fase 1 (todavía presentes)

La Fase 1 estableció el área de vista previa de solo lectura: renderizado del lienzo, señal de estado del juego, modelo de preparación para la implementación, exportación de entrega de misiones, galería de plantillas y navegación del tablero. Todas las capacidades de la Fase 1 se conservan y se amplían en la Fase 2.

---

## Paquetes

| Paquete | Lo que contiene |
|---|---|
| `@storyboard-os/core` | Primitivos genéricos de tablero: cuadro, conexión (genérico según el tipo), anotación, plantilla, validador estructural. Los dominios poseen sus propios vocabularios de conexión. |
| `@storyboard-os/rpg-domain` | Contrato de creación de juegos de rol: tipos de elementos, campos de contenido, plantillas, modelo de preparación, generador de entrega, demostración de misión de Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrato de implementación de campaña de marketing: tipos de elementos (audiencia, mensaje, punto de contacto, activo, aprobación, evento de lanzamiento, medición), modelo de preparación para el lanzamiento, ruta crítica, puertas de aprobación, bucles de medición, exportación de resumen de campaña, campaña de demostración. |
| `@storyboard-os/cinematic-domain` | Contrato de producción cinematográfica: 9 tipos de fotogramas, lenguaje de cámara, requisitos de efectos visuales/audio/continuidad, señales de producción (estado, carga, complejidad, tomas bloqueadas), entrega del resumen de producción, 3 plantillas, secuencia de tráiler de demostración. |
| `@storyboard-os/canvas` | Renderizador de lienzo Konva: fotogramas, conexiones, selección, arrastre, etiquetas de tipo, etiquetas de conexión, vista de zoom/desplazamiento. Configuración del dominio proporcionada. |
| `@storyboard-os/routing` | Ayudantes de URL configurables: generación de rutas de tablero y fotogramas. Sin dependencias. |

## Aplicaciones

| Aplicación | ¿Qué es? |
|---|---|
| `rpg-storyboard` | Producto para la creación de juegos de rol (RPG). Incluye: configuración del lienzo de RPG, inspector de fotogramas, páginas de entrega, galería de plantillas, configuración de rutas, diseño de página. |
| `marketing-storyboard` | Guion gráfico para la implementación de campañas de RPG. Incluye: configuración del lienzo de campaña, tablero de campaña, inspector de fotogramas, indicador de preparación para el lanzamiento, énfasis en la ruta crítica, panel de bloqueos del lanzamiento, entrega del resumen de la campaña. |
| `cinematic-storyboard` | Guion gráfico para la producción cinematográfica. Incluye: configuración del lienzo cinematográfico, tablero de secuencia, inspector de fotogramas (cámara/efectos visuales/audio/continuidad), panel de señales de producción (estado/carga/complejidad), entrega del resumen de producción. |

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

Un cuarto módulo vertical crearía su propio paquete de dominio y reutilizaría `@storyboard-os/core`, `@storyboard-os/canvas` y `@storyboard-os/routing` sin modificar ningún paquete de dominio existente. Tres módulos verticales ya han demostrado este patrón: cero cambios en el lienzo, el núcleo o el enrutamiento.

Consulte [`docs/architecture.md`](docs/architecture.md) para obtener más detalles.

---

## Comienzo rápido

<!-- AUTOGEN-NOTE: Los valores de instantáneas (649 pruebas, 54 páginas) a continuación se actualizan manualmente.
Verifique con: pnpm test (conteo de pruebas), pnpm -r build (conteo de páginas).
Consulte docs/snapshot-checklist.md para cada ubicación que contenga estas instantáneas. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (649 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # test + build in one command (ship gate)
```

Requisitos: Node ≥ 20, pnpm ≥ 9.

El alcance de las pruebas se filtra automáticamente a los paquetes `@storyboard-os/*` y `rpg-storyboard`; no incluye los espacios de trabajo hermanos en el directorio principal.

---

## Modelo de confianza

Storyboard OS es una **aplicación para navegador que funciona solo localmente**; no requiere servidor, cuentas ni conexión a la red.

- **Datos accedidos:** Datos del proyecto (especificaciones de los elementos, posiciones del tablero, progreso de la lista de verificación) solo en el almacenamiento local del navegador en la máquina del usuario.
- **Datos NO accedidos:** No se almacenan credenciales, información de pago ni datos personales más allá de lo que el diseñador ingresa en los campos de las especificaciones de los elementos.
- **No hay solicitudes de red en tiempo de ejecución.** La aplicación es un sitio estático. Después de la carga inicial de la página, no se realizan llamadas a la red.
- **No hay telemetría.** No se recopila ni se transmite nada.

Consulte [`SECURITY.md`](SECURITY.md) para obtener el modelo de confianza completo y la información sobre la notificación de vulnerabilidades.

---

## Estado

<!-- AUTOGEN-NOTE: Los valores de instantáneas a continuación (649 pruebas, 54 páginas, 6 paquetes, 3 aplicaciones) son
actualizados manualmente. Verifique con:
pnpm test                       # pruebas aprobadas
pnpm -r build                   # páginas construidas (conteo de la salida de Astro)
ls packages/ | wc -l            # conteo de paquetes
ls apps/ | wc -l                # conteo de aplicaciones
Consulte docs/snapshot-checklist.md para cada ubicación de documento que contenga estas. -->

```
Phase 2 complete + Marketing Phase 0 complete + Cinematic Phase 0 complete + Core Hardening 1A
649/649 tests passing
54/54 pages built
6 packages · 3 apps
```

| Fase | Descripción | Estado |
|---|---|---|
| 0A–0F | Prueba de creación de RPG: lienzo, páginas de elementos, plantillas, misión de demostración. | ✅ |
| 0R | Reparación y re-anclaje: cada fotograma lleva la especificación del estado del juego. | ✅ |
| 0M | Migración a monorepo: extracción del núcleo, dominio, lienzo y enrutamiento. | ✅ |
| 1A | Visibilidad de la rama y el estado en el lienzo. | ✅ |
| 1B | Preparación para la implementación por elemento. | ✅ |
| 1C | Exportación de la entrega de la misión. | ✅ |
| 1D | Galería de plantillas. | ✅ |
| 1E | Operaciones del tablero: zoom, desplazamiento, ajuste, controles de vista. | ✅ |
| 1F | Cierre de la versión — documentación, registro de cambios, notas de arquitectura. | ✅ |
| 2A | Creación de proyectos a partir de plantillas — persistencia en localStorage. | ✅ |
| 2B | Posiciones de la tabla persistentes por proyecto. | ✅ |
| 2C | Contenido de los "beats" (secciones) editable — los campos de especificación persisten al recargar. | ✅ |
| 2D | Persistencia de la lista de verificación/progreso — separada del texto de la especificación. | ✅ |
| 2E | Entrega de proyectos — regenerados a partir del estado del proyecto guardado. | ✅ |
| 2F | Cierre de la versión — documentación, registro de cambios, notas de arquitectura. | ✅ |
| M-0A | Paquete de dominio de marketing — esquema, señales, plantillas, validación, campaña de demostración. | ✅ |
| M-0B | Vertical de aplicación de marketing — panel de campaña Astro, inspector de fotogramas, entrega. | ✅ |
| M-0C | Capa de señales de lanzamiento — ruta crítica, puertas de aprobación, bucles de medición. | ✅ |
| M-0D | Cierre de marketing — documentación, registro de cambios, prueba de arquitectura. | ✅ |
| C-0A | Paquete de dominio cinematográfico — esquema, lenguaje de cámara, efectos visuales/audio, plantillas, validación, demostración. | ✅ |
| C-0B | Vertical de aplicación cinematográfica — panel de secuencia Astro, inspector de fotogramas, resumen de producción. | ✅ |
| C-0C | Capa de señales de producción — estado de salud, carga de efectos visuales/audio, complejidad de la cámara, tomas bloqueadas. | ✅ |
| C-0D | Cierre cinematográfico — documentación, registro de cambios, prueba de arquitectura. | ✅ |
| H-1A | Endurecimiento del núcleo — tipos de conexión genéricos, los dominios gestionan su propio vocabulario. | ✅ |

---

## Demostración

**El Libro Mayor de Tollhouse** — tres facciones quieren el mismo libro mayor oculto. El jugador decide quién gana, quién pierde y cómo se verá la región a continuación. Ocho "beats" con especificación completa del estado del juego: nombres de las banderas, requisitos de activos, criterios de prueba de aprobación/fallo, listas de verificación de implementación.

Cada fotograma de la demostración se puede implementar como una misión en un motor de RPG sin documentación adicional.

Ruta: `/storyboards/quest-01`

---

## Documentación

- [`docs/architecture.md`](docs/architecture.md) — separación de paquetes, reglas de dependencia, modelo de vista de lienzo, límite de almacenamiento de proyectos, extensibilidad.
- [`docs/product-brief.md`](docs/product-brief.md) — qué es rpg-storyboard, usuario objetivo, advertencias de desviación, puertas de aceptación.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrato de creación de juegos RPG, bucle completo de creación (Fase 2), modelo de preparación, exportación de entrega.
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md) — contrato de implementación de campañas de marketing, modelo de preparación para el lanzamiento, ruta crítica, exclusiones.
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md) — guion gráfico cinematográfico, señales de producción, lenguaje de cámara, exclusiones deliberadas.
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md) — narrativa principal de la Fase 0 cinematográfica, puertas de aceptación, prueba.
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md) — narrativa principal de la Fase 0 de marketing, puertas de aceptación, prueba.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa principal de la Fase 2, registro de integridad de la arquitectura, exclusiones deliberadas.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa principal de la Fase 1 y registro de integridad de la arquitectura.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — veredicto de la Fase 0 (prueba interna) y backlog original de la Fase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro de migración a monorepo: qué se movió, por qué y la arquitectura resultante.
- [`CHANGELOG.md`](CHANGELOG.md) — historial de versiones.
