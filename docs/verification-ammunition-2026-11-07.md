# Tipado y composición CRUD: municiones — 2026-11-07

Se revisaron primero `git status`, AGENTS.md y todos los informes
`verification-*-2026-11-07.md`, incluido armas. Se preservaron los cambios
pendientes. Este bloque modifica únicamente `src/modules/ammunition`, sus pruebas
y este informe; no extrae componentes CRUD compartidos ni cambia dependencias.

## Contratos y cambios

Se contrastaron los contratos concretos con `weapon` y `drugPresentation`:
`descripcion`, `logo` e `identificador`; el identificador del servidor se expone
como `id` en las filas. Se mantienen `/ammunition`, sus parámetros de listado,
cookies del cliente compartido, creación multipart y edición mediante POST
multipart a `/ammunition/{id}` con `_method=PUT`. En edición se envía `logo`
únicamente cuando es un archivo nuevo.

- Props, callbacks, respuestas HTTP, estado de errores y formularios tipados.
  Editar y borrar requieren `id`. El esquema no transforma valores y conserva
  sus validaciones actuales.
- Los cuatro thunks normalizan errores mediante `apiErrors.ts`, limpian errores
  anteriores y rechazan con la causa original. Ante fallos conservan filas y
  selección. Se mantiene `createLatestListRequest` y el callback de listado
  estable con señal opcional, sin alterar su coordinación de cancelaciones.
- El submit captura el rechazo y aplica errores solo a campos conocidos. No
  resetea ni desmonta el formulario ante un fallo: conserva texto y archivo para
  reintentar. `loading || isSubmitting` bloquea el fieldset y el cierre.
- Confirmación de borrado compuesta con MUI dentro del módulo. Mantiene diálogo,
  error y selección ante fallos; bloquea botones y cierre durante la petición.
  Solo cierra tras éxito o cancelación explícita. Cancelar limpia la selección.
- `AmmunitionError` presenta errores en listado, formulario y confirmación.
  Títulos y botón de guardar tienen nombres accesibles.

## Documentación

Versiones resueltas en `package-lock.json`: React 19.3.1, React Hook Form 7.55.0,
resolvers 5.9.2, Zod 4.6.7, Redux Toolkit 2.6.1, Axios 1.21.0 y MUI 6.4.7.
Se leyeron ambas skills Vercel y las reglas sobre acciones en eventos y
composición con children, adaptadas a esta SPA.

Context7 respondió y confirmó `handleSubmit`, `setError` e `isSubmitting`.
No ofrece el parche RHF 7.55.0; se contrastaron la documentación oficial de
[handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit) y
[Dialog MUI v6](https://v6.mui.com/material-ui/react-dialog/), además de compilar
contra los tipos instalados. Estas páginas generales no fijan los parches
instalados; no se adoptaron APIs posteriores ni APIs de Next.js.

## Verificación

- `npm test`: 82 pruebas aprobadas. `tests/ammunition.test.mjs` ejecuta reducer,
  thunks y cliente Axios reales con transporte simulado: los cuatro rechazos
  conservan causa/datos/selección, limpian carga y normalizan errores; creación,
  identificadores, cookies, edición con y sin archivo y borrado tras éxito.
  `tests/list-loading.test.mjs` también cubre municiones: respuesta obsoleta antes
  y después de la vigente, cancelación al desmontar y aislamiento entre stores.
- Lint específico de módulo y ambos scripts nuevos: correcto.
- `npm run lint`: 116 errores y 30 advertencias fuera del módulo. El informe
  anterior de armas registra 122 errores y 35 advertencias. El lint global sigue
  fallando por deuda previa; no se corrigieron módulos ajenos.
- `npm run build`: correcto. Persiste el aviso previo de chunk compartido grande
  (`GraphLayout`, aproximadamente 645 kB). Se restauró el archivo generado
  `tsconfig.app.tsbuildinfo`, que estaba limpio al inicio.
- `git diff --check -- src/modules/ammunition`: correcto.
- Playwright MCP activo; `chrome://version` confirmó el ejecutable
  `C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`.
  Se ejecutó el build con el preview existente en `127.0.0.1:4175`.
- Recorrido reutilizable `tests/browser/ammunition.js`: siete comprobaciones
  aprobadas. Cancelar borrado limpia selección; crear con 422 conserva texto y
  archivo, marca el campo y bloquea descripción, eliminación de imagen, guardar y
  Escape durante envío; reintentar crea la fila y cierra. Editar con desconexión
  conserva datos y reintenta con el contrato multipart correcto. Borrar bloquea
  ambos botones y Escape mientras espera; un 500 conserva fila y diálogo y el
  reintento los elimina. Dos peticiones por operación.
- Cero excepciones de página y mensajes inesperados de consola. Tres errores
  de red deliberados: 422, desconexión y 500. Las interceptaciones y respuestas
  retenidas se liberan en `finally`.
- Se inspeccionó `.playwright-mcp/ammunition-form.png`: título, error, campo,
  imagen y guardar visibles, sin recortes.
- Chrome DevTools MCP respondió a `list_pages`; muestra `about:blank` y ninguna
  herramienta de terceros disponible. No se realizó perfil React.

Para repetir, con el preview en el puerto indicado, ejecutar Playwright MCP
`browser_run_code_unsafe` con `{"filename":"tests/browser/ammunition.js"}`.
El recorrido simula autenticación, HTTP e imágenes y captura el formulario.

## Límites

No se acredita persistencia, permisos ni procesamiento de archivos contra el
backend real. La validación previa de tamaño del archivo sigue pendiente de un
bloque específico, igual que en armas y presentaciones; este cambio conserva el
esquema existente. No se midió rendimiento de renderizado.
