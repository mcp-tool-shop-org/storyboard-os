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


---

Una plataforma de creación visual de estructuras narrativas para narrativas interactivas: misiones, campañas, secuencias cinematográficas y la lógica de producción que las conecta.

**Tres áreas verticales, una sola plataforma:**

| Área vertical | Dominio |
|---|---|
| `rpg-storyboard` | Misiones/narrativa de juegos de rol: creación lista para su implementación. |
| `marketing-storyboard` | Lanzamiento de campaña: preparación para el lanzamiento + ruta crítica. |
| `cinematic-storyboard` | Tráiler / escena / video explicativo: guion gráfico de producción. |

Los tres son productos, no demostraciones. Ninguno importa datos de los otros.

---

## Qué es Storyboard OS

Un panel estructurado para diseñar narrativas **implementables**. Cada cuadro en el lienzo es una escena con:
- Condiciones de entrada y salida
- Cambios de estado (indicadores, variables, estado del mundo)
- Recursos necesarios para la fase de producción
- Criterios de prueba con comprobaciones de aprobación/rechazo
- Lista de verificación de implementación

El panel visualiza el flujo del estado del juego, no solo la secuencia de la historia. Las conexiones transmiten significado: ramas de elección, arcos de consecuencias, líneas principales de la secuencia, rutas alternativas. Un diseñador puede leer el panel y comprender lo que realmente hace el juego.

## Qué NO es Storyboard OS

- Una herramienta genérica de diagramación o pizarra blanca
- Una herramienta para dirigir sesiones o ayudar al Dungeon Master (GM)
- Una wiki de construcción de mundos o base de datos de conocimientos
- Un editor que solo se centra en árboles de diálogo
- Una aplicación de preparación de campañas

Si un lector pudiera confundir esto con cualquiera de esas opciones, el producto se habrá desviado de su propósito.

---

## Qué hace rpg-storyboard (Fase 2)

Después de la Fase 2, un diseñador puede crear un proyecto completo desde el principio hasta la entrega sin salir del navegador:

| Capacidad | Lo que se obtiene |
|---|---|
| **Project creation** | Crear un proyecto con nombre a partir de una plantilla; las posiciones y ediciones del panel persisten en localStorage. |
| **Visual board** | Flujo de la misión y lógica de ramificación del estado del juego, lado a lado, en un lienzo Konva. |
| **Beat editing** | Editar el título, el resumen y todos los campos de especificación de implementación de cualquier escena directamente en el panel. |
| **Progress tracking** | Marcar los elementos de la lista de verificación de implementación y los criterios de prueba por cada escena; el estado se conserva al recargar la página. |
| **Game-state signal** | Insignias por cuadro (ESTADO, ESPECIFICACIÓN/PARCIAL/BORRADOR) sin salir del panel. |
| **Implementation readiness** | Cada escena muestra el estado LISTO/PARCIAL/BORRADOR/BLOQUEADO + lo que falta. |
| **Project handoff** | Regenerado a partir del estado actual del proyecto: incluye contenido editado, progreso por escena y procedencia. |
| **Quest handoff** | Exportación estática en Markdown + JSON para paneles de vista previa de plantillas. |
| **Templates** | Tres puntos de partida para la producción de juegos de rol con secuencias de tipos de escenas y justificación. |
| **Board operations** | Zoom, desplazamiento, ajuste al panel, restablecimiento, atajos de teclado: navegación utilizable en un portátil. |

El panel es una superficie de creación. El inspector de la escena es una especificación de implementación editable. La entrega es un documento generado a partir del estado real del proyecto, no una instantánea estática.

### Capacidades de la Fase 1 (todavía presentes)

La Fase 1 estableció el área vertical de vista previa de solo lectura: renderizado en lienzo, señal de estado del juego, modelo de preparación para la implementación, exportación de entrega de misiones, galería de plantillas y navegación del panel. Todas las capacidades de la Fase 1 se conservan y amplían con la Fase 2.

---

## Paquetes

| Paquete | Lo que contiene |
|---|---|
| `@storyboard-os/core` | Primitivas genéricas de guion gráfico: cuadro, conexión (genérica para cada tipo), anotación, plantilla, validador estructural. Los dominios poseen sus vocabularios de conexión. |
| `@storyboard-os/rpg-domain` | Contrato de creación de juegos de rol: tipos de cuadros, campos de contenido, plantillas, modelo de preparación, generador de entrega, misión de demostración de Tollhouse Ledger. |
| `@storyboard-os/marketing-domain` | Contrato de implementación de campaña de marketing: tipos de cuadros (audiencia, mensaje, punto de contacto, activo, aprobación, evento de lanzamiento, medición), modelo de preparación para el lanzamiento, ruta crítica, puertas de aprobación, bucles de medición, exportación del resumen de la campaña, campaña de demostración. |
| `@storyboard-os/cinematic-domain` | Contrato de producción cinematográfica: 9 tipos de cuadros, lenguaje de cámara, requisitos de VFX/audio/continuidad, señales de producción (salud, carga, complejidad, escenas bloqueadas), entrega del resumen de producción, 3 plantillas, secuencia de tráiler de demostración. |
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

Una cuarta área vertical crearía su propio paquete de dominio y reutilizaría `@storyboard-os/core`, `@storyboard-os/canvas` y `@storyboard-os/routing` sin tocar ningún paquete de dominio existente. Tres áreas verticales han demostrado ahora este patrón: cero cambios en el lienzo, el núcleo o el enrutamiento.

Consulte [`docs/architecture.md`](docs/architecture.md) para obtener más detalles.

---

## Primeros pasos

<!-- NOTA DE AUTOGENERACIÓN: Los valores de instantánea (937 pruebas, 54 páginas) a continuación se actualizan manualmente.
Verificar con: pnpm test (recuento de pruebas), pnpm -r build (recuento de páginas).
Consulte docs/snapshot-checklist.md para cada ubicación que contiene estas instantáneas. -->

```bash
pnpm install
pnpm dev        # starts rpg-storyboard at localhost:4321
pnpm test       # runs all package + app tests (937 tests)
pnpm build      # builds all 3 apps (54 pages)
pnpm verify     # typecheck + test + build in one command (ship gate)
```

Requisitos: Node ≥ 20, pnpm ≥ 10.

El alcance de las pruebas se filtra automáticamente a los paquetes `@storyboard-os/*` y `rpg-storyboard`; no incluye espacios de trabajo hermanos en el directorio principal.

---

## Modelo de confianza

Storyboard OS es una **aplicación de navegador que solo funciona localmente**: sin servidor, sin cuentas, sin comunicación con la red.

- **Datos afectados:** Datos del proyecto (especificaciones de escenas, posiciones en el storyboard, progreso de la lista de verificación) en `localStorage` del navegador, únicamente en la máquina del usuario.
- **Datos NO afectados:** No se utilizan credenciales, información de pago ni datos personales más allá de lo que el diseñador introduce en los campos de las especificaciones de las escenas.
- **No hay solicitudes a la red durante la ejecución.** La aplicación es un sitio estático. Después de la carga inicial de la página, no se realizan llamadas a la red.
- **No hay telemetría.** No se recopila ni transmite nada.

Consulte [`SECURITY.md`](SECURITY.md) para obtener el modelo de confianza completo y la información sobre cómo informar sobre vulnerabilidades.

---

## Estado

<!-- NOTA DE AUTOGENERACIÓN: Los valores de instantánea que se muestran a continuación (937 pruebas, 54 páginas, 6 paquetes, 3 aplicaciones) se actualizan manualmente. Verifique con:
pnpm test                       # pruebas superadas
pnpm -r build                   # páginas generadas (cuente desde la salida de Astro)
ls packages/ | wc -l            # recuento de paquetes
ls apps/ | wc -l                # recuento de aplicaciones
Consulte docs/snapshot-checklist.md para conocer la ubicación de cada documento que contiene estos datos. -->

```
Phase 2 + Marketing Phase 0 + Cinematic Phase 0 + Core Hardening 1A + v1.2.0 Health Hardening
937/937 tests passing
54/54 pages built
6 packages · 3 apps
```

| Fase | Descripción | Estado |
|---|---|---|
| 0A–0F | Prueba de creación de RPG: lienzo, páginas de escenas, plantillas, demostración de una misión. | ✅ |
| 0R | Reparación y reanclaje: cada fotograma contiene las especificaciones del estado del juego. | ✅ |
| 0M | Migración a un monorepositorio: se extraen el núcleo, el dominio, el lienzo y el enrutamiento. | ✅ |
| 1A | Visibilidad de la rama y el estado en el lienzo. | ✅ |
| 1B | Preparación para la implementación por escena. | ✅ |
| 1C | Exportación del flujo de trabajo de la misión. | ✅ |
| 1D | Galería de plantillas. | ✅ |
| 1E | Operaciones en el storyboard: zoom, desplazamiento, ajuste y controles de la ventana gráfica. | ✅ |
| 1F | Cierre del lanzamiento: documentación, registro de cambios y notas sobre la arquitectura. | ✅ |
| 2A | Creación de proyectos a partir de plantillas: persistencia en `localStorage`. | ✅ |
| 2B | Posiciones del storyboard persistentes por proyecto. | ✅ |
| 2C | Contenido editable de las escenas: las especificaciones se conservan al volver a cargar la página. | ✅ |
| 2D | Persistencia de la lista de verificación/progreso: independiente del texto de la especificación. | ✅ |
| 2E | Transferencia del proyecto: regenerado a partir del estado guardado del proyecto. | ✅ |
| 2F | Cierre del lanzamiento: documentación, registro de cambios y notas sobre la arquitectura. | ✅ |
| M-0A | Paquete de dominio de marketing: esquema, señales, plantillas, validación y campaña de demostración. | ✅ |
| M-0B | Aplicación vertical de marketing: storyboard de la campaña Astro, inspector de fotogramas y transferencia. | ✅ |
| M-0C | Capa de señalización de preparación para el lanzamiento: ruta crítica, puertas de aprobación y ciclos de medición. | ✅ |
| M-0D | Cierre del marketing: documentación, registro de cambios y prueba de la arquitectura. | ✅ |
| C-0A | Paquete de dominio cinematográfico: esquema, lenguaje de cámara, VFX/audio, plantillas, validación y demostración. | ✅ |
| C-0B | Aplicación vertical cinematográfica: storyboard de la secuencia Astro, inspector de fotogramas y resumen de producción. | ✅ |
| C-0C | Capa de señalización de producción: estado, carga de VFX/audio, complejidad de la cámara y escenas bloqueadas. | ✅ |
| C-0D | Cierre cinematográfico: documentación, registro de cambios y prueba de la arquitectura. | ✅ |
| H-1A | Refuerzo del núcleo: tipos de conexión genéricos; cada dominio posee su propio vocabulario. | ✅ |
| v1.2.0 | Refuerzo de la seguridad: el validador no genera errores, resistencia del almacén + versionado del esquema de `localStorage`, capa de tokens de diseño, acceso al lienzo mediante teclado/lector de pantalla, Astro 5 y puerta de auditoría de dependencias en CI. | ✅ |

---

## Demostración

**The Tollhouse Ledger**: tres facciones quieren el mismo libro mayor oculto. El jugador decide quién gana, quién pierde y cómo será la región a continuación. Ocho escenas con especificaciones completas del estado del juego: nombres de las banderas, requisitos de los activos, criterios de prueba de aprobación/rechazo y listas de verificación de implementación.

Cada fotograma de la demostración se puede implementar como una misión en un motor de RPG sin documentación adicional.

Ruta: `/storyboards/quest-01`

---

## Documentación

- [`docs/architecture.md`](docs/architecture.md): separación de paquetes, reglas de dependencia, modelo de ventana gráfica del lienzo, límite de almacenamiento del proyecto y extensibilidad.
- [`docs/product-brief.md`](docs/product-brief.md): qué es rpg-storyboard, usuario objetivo, advertencias sobre la desviación y puertas de aceptación.
- [`docs/rpg-storyboard.md`](docs/rpg-storyboard.md): contrato de creación de juegos RPG, ciclo completo de creación (Fase 2), modelo de preparación y exportación del flujo de trabajo.
- [`docs/marketing-storyboard.md`](docs/marketing-storyboard.md): contrato de implementación de la campaña de marketing, modelo de preparación para el lanzamiento, ruta crítica y exclusiones.
- [`docs/cinematic-storyboard.md`](docs/cinematic-storyboard.md): storyboard de producción cinematográfica, señales de producción, lenguaje de cámara y exclusiones deliberadas.
- [`docs/cinematic-phase-0-closeout.md`](docs/cinematic-phase-0-closeout.md): narrativa principal de la Fase 0 cinematográfica, puertas de aceptación y prueba.
- [`docs/marketing-phase-0-closeout.md`](docs/marketing-phase-0-closeout.md): narrativa principal de la Fase 0 de marketing, puertas de aceptación y prueba.
- [`docs/phase-2-closeout.md`](docs/phase-2-closeout.md): narrativa principal de la Fase 2, registro de integridad de la arquitectura y exclusiones deliberadas.
- [`docs/phase-1-closeout.md`](docs/phase-1-closeout.md): narrativa principal de la Fase 1 y registro de integridad de la arquitectura.
- [`docs/phase-0-closeout.md`](docs/phase-0-closeout.md): veredicto de la prueba piloto de la Fase 0 y el backlog original de la Fase 1.
- [`docs/monorepo-migration.md`](docs/monorepo-migration.md): registro de la migración a un monorepositorio: qué se movió, por qué y la arquitectura resultante.
- [`CHANGELOG.md`](CHANGELOG.md): historial de lanzamientos.
