<p align="center">
  <a href="README.ja.md">日本語</a> | <a href="README.zh.md">中文</a> | <a href="README.md">English</a> | <a href="README.fr.md">Français</a> | <a href="README.hi.md">हिन्दी</a> | <a href="README.it.md">Italiano</a> | <a href="README.pt-BR.md">Português (BR)</a>
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

Una plataforma de creación visual para estructuras narrativas interactivas: misiones, ramificaciones, escenas, encuentros, consecuencias y la lógica del estado del juego que las conecta.

**rpg-storyboard** es la primera aplicación: una herramienta de creación de juegos para el diseño de misiones y escenas de videojuegos de rol. No es una demostración ni un prototipo. Es el producto para el que se creó esta plataforma.

---

## ¿Qué es Storyboard OS?

Un tablero estructurado para diseñar una **narrativa implementable**. Cada cuadro en el lienzo representa un elemento con:
- Condiciones de entrada y salida
- Cambios de estado (banderas, variables, estado del mundo)
- Activos necesarios para la fase de producción
- Criterios de prueba con verificaciones de aprobación/fallo
- Lista de verificación de implementación

El tablero visualiza el flujo del estado del juego, no solo la secuencia de la historia. Las conexiones tienen significado: ramificaciones de elección, arcos de consecuencias, estructuras de secuencia, rutas alternativas. Un diseñador puede leer el tablero y comprender lo que realmente hace el juego.

## ¿Qué NO es Storyboard OS?

- Una herramienta genérica de diagramación o una pizarra.
- Un motor de ejecución de sesiones o una herramienta de ayuda para el director de juego.
- Una wiki de creación de mundos o una base de datos de lore.
- Un editor solo de árboles de diálogo.
- Una aplicación de preparación de campañas.

Si un lector pudiera confundir esto con cualquiera de esas cosas, el producto se ha desviado de su propósito.

---

## ¿Qué hace rpg-storyboard (Fase 2)?

Después de la Fase 2, un diseñador puede crear un proyecto completo desde el principio hasta la entrega sin salir del navegador:

| Capacidades | Lo que obtienen |
|---|---|
| **Project creation** | Crear un proyecto con nombre a partir de una plantilla; las posiciones y ediciones del tablero se guardan en localStorage. |
| **Visual board** | Flujo de la misión y lógica de ramificación del estado del juego, uno al lado del otro, en un lienzo Konva. |
| **Beat editing** | Editar el título, el resumen y todos los campos de especificación de implementación de cada elemento directamente en el tablero. |
| **Progress tracking** | Marcar los elementos de la lista de verificación de implementación y los criterios de prueba para cada elemento; el estado se mantiene al recargar. |
| **Game-state signal** | Insignias por elemento (ESTADO, ESPECIFICADO/PARCIAL/BORRADOR) sin salir del tablero. |
| **Implementation readiness** | Cada elemento muestra el estado LISTO/PARCIAL/BORRADOR + lo que falta. |
| **Project handoff** | Regenerado a partir del estado actual del proyecto: incluye contenido editado, progreso por elemento, origen. |
| **Quest handoff** | Exportación estática de Markdown + JSON para los tableros de vista previa de plantillas. |
| **Templates** | Tres puntos de partida para la producción de juegos de rol con secuencias de tipos de elementos y justificaciones. |
| **Board operations** | Zoom, desplazamiento, ajuste al tablero, restablecimiento, atajos de teclado: navegación utilizable con portátil. |

El tablero es una superficie de creación. El inspector de elementos es una especificación de implementación editable. La entrega es un documento generado a partir del estado real del proyecto, no una instantánea estática.

### Capacidades de la Fase 1 (todavía presentes)

La Fase 1 estableció la aplicación de vista previa de solo lectura: renderizado del lienzo, señal del estado del juego, modelo de preparación de implementación, exportación de entrega de misiones, galería de plantillas y navegación del tablero. Todas las capacidades de la Fase 1 se conservan y se amplían en la Fase 2.

---

## Paquetes

| Paquete | Lo que contiene |
|---|---|
| `@storyboard-os/core` | Primitivas genéricas de tablero: elemento, conexión, anotación, plantilla, validador estructural. Sin vocabulario específico del dominio. |
| `@storyboard-os/rpg-domain` | Contrato de creación de juegos de rol: tipos de elementos, campos de contenido, plantillas, modelo de preparación, generador de entrega, demostración de misión de Tollhouse Ledger. |
| `@storyboard-os/canvas` | Renderizador de lienzo Konva: elementos, conexiones, selección, arrastre, insignias de tipo, etiquetas de conexión, vista de zoom/desplazamiento. Configuración del dominio pasada como parámetro. |
| `@storyboard-os/routing` | Ayudantes de URL configurables: generación de rutas de tablero y elemento. Sin dependencias. |

## Aplicaciones

| Aplicación | Lo que es |
|---|---|
| `rpg-storyboard` | Producto de creación de juegos de rol Astro. Contiene: configuración del lienzo de rol, inspector de elementos, páginas de entrega, galería de plantillas, configuración de rutas, diseño de página. |

---

## Arquitectura

Los paquetes forman una cadena de dependencias limpia:

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

Una segunda rama vertical (por ejemplo, `apps/screenplay-storyboard`) crearía su propio paquete de dominio y reutilizaría `@storyboard-os/core`, `@storyboard-os/canvas` y `@storyboard-os/routing` sin modificar `@storyboard-os/rpg-domain`.

Consulte [`docs/architecture.md`](docs/architecture.md) para obtener todos los detalles.

---

## Cómo empezar

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (368 tests)
pnpm build      # builds rpg-storyboard (42 pages)
pnpm verify     # test + build in one command (ship gate)
```

Requisitos: Node ≥ 20, pnpm ≥ 9.

El alcance de las pruebas se filtra automáticamente a los paquetes `@storyboard-os/*` y `rpg-storyboard`; no incluye los espacios de trabajo relacionados en el directorio principal.

---

## Modelo de Confianza

Storyboard OS es una **aplicación para navegador que funciona solo localmente**: no hay servidor, ni cuentas, ni conexión a la red.

- **Datos accedidos:** Datos del proyecto (especificaciones de los "beats", posiciones en el tablero, progreso de la lista de verificación) solo en el almacenamiento local del navegador en la máquina del usuario.
- **Datos NO accedidos:** No hay credenciales, ni información de pago, ni datos personales más allá de lo que el diseñador introduce en los campos de las especificaciones.
- **No hay solicitudes de red en tiempo de ejecución.** La aplicación es un sitio estático. Después de la carga inicial de la página, no se realizan llamadas a la red.
- **No hay telemetría.** No se recopila ni se transmite nada.

Consulte [`SECURITY.md`](SECURITY.md) para obtener el modelo de confianza completo y la información sobre la notificación de vulnerabilidades.

---

## Estado

```
Phase 2 complete
368/368 tests passing
42/42 pages built
```

| Fase | Descripción | Estado |
|---|---|---|
| 0A–0F | Prueba de creación de juegos de rol: lienzo, páginas de "beats", plantillas, demostración de misión. | ✅ |
| 0R | Corrección y re-anclaje: cada fotograma contiene la especificación del estado del juego. | ✅ |
| 0M | Migración a monorepo: se extraen el núcleo, el dominio, el lienzo y el enrutamiento. | ✅ |
| 1A | Visibilidad de la rama y el estado en el lienzo. | ✅ |
| 1B | Preparación para la implementación por "beat". | ✅ |
| 1C | Exportación de la entrega de la misión. | ✅ |
| 1D | Galería de plantillas. | ✅ |
| 1E | Operaciones del tablero: zoom, desplazamiento, ajuste, controles de la vista. | ✅ |
| 1F | Cierre de la versión: documentación, registro de cambios, notas de arquitectura. | ✅ |
| 2A | Creación de proyectos a partir de plantillas: persistencia en el almacenamiento local. | ✅ |
| 2B | Posiciones persistentes del tablero por proyecto. | ✅ |
| 2C | Contenido editable de los "beats": las especificaciones persisten al recargar. | ✅ |
| 2D | Persistencia de la lista de verificación/progreso: separada del texto de la especificación. | ✅ |
| 2E | Entrega del proyecto: regenerada a partir del estado del proyecto guardado. | ✅ |
| 2F | Cierre de la versión: documentación, registro de cambios, notas de arquitectura. | ✅ |

---

## Demostración

**The Tollhouse Ledger** (El libro mayor de Tollhouse): tres facciones quieren el mismo libro mayor oculto. El jugador decide quién gana, quién pierde y cómo se verá la región a continuación. Ocho "beats" con especificación completa del estado del juego: nombres de las banderas, requisitos de activos, criterios de prueba de aprobación/fallo, listas de verificación de implementación.

Cada fotograma de la demostración se puede implementar como una misión en un motor de juegos de rol sin documentación adicional.

Ruta: `/storyboards/quest-01`

---

## Documentación

- [`docs/architecture.md`](docs/architecture.md) — separación de paquetes, reglas de dependencia, modelo de vista del lienzo, límite de almacenamiento del proyecto, extensibilidad.
- [`docs/product-brief.md`](docs/product-brief.md) — qué es rpg-storyboard, usuario objetivo, advertencias de desviación, criterios de aceptación.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md) — contrato de creación de juegos de rol, bucle completo de creación (Fase 2), modelo de preparación, exportación de la entrega.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md) — narrativa de la Fase 2, registro de la integridad de la arquitectura, exclusiones deliberadas.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md) — narrativa de la Fase 1 y registro de la integridad de la arquitectura.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md) — veredicto de "prueba interna" de la Fase 0 y la lista de tareas pendientes original de la Fase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md) — registro de la migración a monorepo: qué se movió, por qué y la arquitectura resultante.
- [`CHANGELOG.md`](CHANGELOG.md) — historial de versiones.
