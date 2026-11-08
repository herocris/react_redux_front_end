# Carga diferida de rutas — 2026-11-07

Primera entrega del bloque «Tipado, composición CRUD y carga diferida».

## Cambio

- Las doce entradas protegidas del router se cargan con `React.lazy`, declarado
  fuera del componente, y una frontera `Suspense` con indicador accesible.
- El store importa directamente los slices. Las exportaciones generales de los
  módulos enlazaban también sus rutas y anulaban parte de la separación.
- Se conservan autenticación, rutas, reducers, estado y contratos HTTP.
- Sin dependencias nuevas ni cambios de configuración del bundler.

React 19.3.1, React Router 7.18.5 y Vite 8.3.5 comprobados en el lockfile.
Context7 confirmó `lazy` y `Suspense` en la documentación de React; el catálogo
consultado no identifica exactamente el parche 19.3.1. Se aplicaron las reglas
de carga condicional de Vercel adaptadas a una SPA con Vite.

## Verificación

- `npm test`: 67 pruebas aprobadas.
- `npm run build`: aprobado. El archivo bootstrap pasa de 1.889,90 kB a
  328,54 kB (gzip: 556,07 a 98,03 kB). Son tamaños de archivos, no una medición
  del tráfico total ni del tiempo de carga. Se mantiene una advertencia por un
  chunk compartido de GraphLayout de 644,97 kB.
- `npm run lint`: 134 errores y 37 advertencias, iguales al estado inicial.
- Brave con Playwright MCP sobre el build servido por Vite preview:
  seis comprobaciones aprobadas: login sin rutas protegidas descargadas,
  indicador accesible con un chunk retenido, usuarios sin rutas ajenas,
  navegación a gráficos y mapa, botón atrás y entrada directa a creación de
  decomisos. Sin excepciones de página. El 401 de refresh es simulado y esperado
  en el caso sin sesión.
- Recorrido reutilizable: `tests/browser/lazy-routes.js`, ejecutado mediante
  `browser_run_code_unsafe` con `filename`. Requiere preview en 127.0.0.1:4175.

Las respuestas del backend se simulan; no se comprobaron persistencia real ni
permisos del servidor. No se midió rendimiento de renderizado con React DevTools.
La navegación por defecto al dashboard sí necesita mapas y gráficos porque esa
pantalla los muestra; la carga diferida no elimina ese coste.

## Continuación

Quedan el tipado y la composición CRUD por módulos. Empezar por un catálogo
pequeño, tipando sus callbacks y formulario antes de extraer componentes comunes.
Revisar después los imports compartidos que reúnen código de varias vistas.
