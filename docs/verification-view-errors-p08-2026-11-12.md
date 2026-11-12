# P08 — Recuperación de errores de vistas

Fecha: 12 de noviembre de 2026. Alcance exclusivo P08; sin commits,
despliegue, monitorización externa, instalaciones ni runner nuevo.

## Implementación y decisiones

- `src/router/ViewErrorBoundary.tsx`: frontera React de clase, compuesta mediante
  children. Solo guarda dos booleanos; no muestra ni almacena mensajes, trazas,
  URLs de chunks, cuerpos HTTP o datos de la excepción en la presentación.
- `AppRouter` la sitúa alrededor de Suspense/Routes, después de los controles
  de sesión. Captura render de vistas y rechazos de imports lazy, incluidos
  consumidores anidados. Redux, Query, BrowserRouter, tema y coordinación de
  autorización permanecen montados. No se modifican imports lazy ni guards.
- Fallback con main, h1 enfocable con foco inicial, alerta y botones/enlaces
  accesibles. Advierte de posible pérdida de edición local al desmontarse la
  vista. Conserva cierre de sesión y muestra otra vista solo si `canAccess`
  la permite, excluyendo el dominio de ruta afectado. Visitantes pueden volver
  al acceso cuando no estén ya en él.
- Un reintento local por montaje de frontera. Si vuelve a fallar desaparece ese
  botón; no hay temporizadores, reintentos automáticos ni recargas automáticas.
  React conserva promesa/rechazo de lazy: resetear la frontera no vuelve a
  descargar ese módulo. Se ofrece recarga completa explícita, deshabilitada
  inmediatamente al pulsar, para reiniciar documento/imports. No se promete
  resolver un chunk que continúe ausente ni un defecto persistente.
- Navegar (incluido atrás) o cambiar estado/revisión de autorización monta una
  frontera nueva; no remonta los proveedores ni la coordinación de sesión.
  El reintento local no repite checkAuthToken. La recarga completa sí usa el
  chequeo de sesión existente y su cookie; no crea otra sesión.
- HTTP sigue administrado por Query y su UI actual; no se cambia throwOnError,
  interceptores, invalidación ni política de caché. El logout captura su rechazo
  con mensaje genérico y permite repetir la acción explícita.

## Comprobaciones ejecutadas

- `npm test`: **259/259** aprobadas, cero fallos/omitidas.
- `npm run lint`: aprobado, cero advertencias ESLint; repetido tras el script.
- `npm run build`: TypeScript y build producción aprobados. Chunks de rutas,
  mapa y CSS Leaflet siguen separados. Artefacto tsbuildinfo restaurado.
- Playwright MCP activo, preview producción `127.0.0.1:4176`.
  `tests/browser/view-error-boundary.js`, ejecutado dos veces con éxito en un
  contexto nuevo/cerrado en finally, sin API real ni escrituras reales:
  1. Sustitución aislada del módulo de drogas por componente que lanza una
     excepción con marcador privado: fallback, foco, alerta y ausencia del
     marcador en texto visible. Fallo persistente consume un único reintento
     sin recargar. Navegación a armas y atrás; recuperación transitoria tras
     habilitar el componente y pulsar reintento. Sin nuevos refresh/documentos
     en reintento/navegación; sin logout implícito.
  2. Abort de petición del chunk real DrugRoutes: rechazo de import, fallback,
     reintento acotado sin nueva descarga (rechazo cacheado), otra vista y atrás.
     Restaurada entrega del módulo, recarga explícita descarga el chunk real
     y muestra tabla conservando autenticación simulada. Una sola navegación
     de documento adicional por pulsación.
  3. HTTP 500 simulado en listado de armas: mensaje de error del servidor de
     Query, sin fallback de render; reintento propio recupera tabla.
  4. Fallback móvil 375×812 sin desbordamiento horizontal y captura revisada
     visualmente (`%TEMP%/p08-mobile.png`, artefacto local no versionado).
     Cierre de sesión explícito alcanza login; un solo logout.
  Resultado por ejecución: cuatro grupos aprobados, cero pageErrors; nueve
  errores de consola esperados y filtrados por excepción inyectada, import
  abortado y HTTP simulado. Cinco refresh de entradas completas y un logout;
  ninguno adicional por reintento local/navegación SPA comprobada.
- Regresión `tests/browser/lazy-routes.js`: seis grupos aprobados a 1280×900:
  login sin chunks protegidos/CSS Leaflet, Suspense accesible, carga por ruta,
  gráficos/mapa, atrás y mapa de formulario directo con estilos. Cero pageErrors
  y cero consola inesperada. Primer intento agotó espera de ancho >300 px:
  mapa medía 298×400 y pane absolute, sin fallback ni errores de consola.
  Repetido con viewport explícito de escritorio: 335,67×319,68 px, aprobado.
  No se alteró el mapa ni se cuenta aquel intento como aprobado.
- `git diff --check`: aprobado; workspace inicialmente limpio; se conservan
  solo cambios P08. Sin secretos ni switches de fallo en código del producto.

## Documentación consultada y límites

Versiones resueltas: React 19.3.1, React Router 7.18.5, MUI 6.4.7.
Skills React/composición aplicadas a composición con children y carga condicional
compatible con SPA. Context7 consultado para React 19.3.1; su corpus versionado
de fuente no proporcionó una referencia completa de frontera/lazy, por lo que
se contrastó con la documentación oficial React mediante Context7:
[Component](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
y [lazy](https://react.dev/reference/react/lazy). Referencia oficial actual,
sin snapshot documental exacto de la versión de parche.

La frontera no captura eventos, callbacks asíncronos arbitrarios, bootstrap,
fallos en proveedores superiores o en su propio fallback. React puede registrar
la excepción en la consola del desarrollador; no se añade envío ni persistencia
de diagnósticos. No se afirma eliminación de trazas en herramientas de desarrollo.
No se recuperan formularios desmontados ni se cancela una escritura ya aceptada
por servidor. Redux/filtros y Query permanecen fuera de la frontera; no se añade
persistencia de su estado en recarga completa. La cookie real y un despliegue
con chunks eliminados no se probaron aquí: son escenarios simulados sobre build
real local. No hay auditoría completa de lector de pantalla ni WCAG. No se
amplía P08 a P09/404, mapas, borradores o monitorización.

Siguiente tarea disponible: P09, sin ejecutar. Límites anteriores de P01–P07
permanecen vigentes.
