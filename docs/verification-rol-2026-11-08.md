# Tipado y composición CRUD: rol — 2026-11-08

Se revisaron primero `git status`, AGENTS.md y los informes
`verification-*-2026-11-07.md`, incluido drogas. Se conservaron los cambios
pendientes. Este bloque modifica únicamente `src/modules/rol`,
`tests/rol.test.mjs`, `tests/browser/rol.js` y este informe. No añade dependencias
ni extrae componentes CRUD compartidos.

## Contratos y cambios

Se contrastaron los contratos de `drugPresentation`, `weapon`, `ammunition` y
`drug` con el código de roles y el proveedor de opciones `resouce`.
Roles usa JSON: `POST /role`, `PUT /role/{id}`, `DELETE /role/{id}` y listado
`GET /role` con los parámetros existentes. Se conservan cookies del cliente
compartido, `nombre`, `permisos`, `identificador` y su conversión a `id` en filas.
La ruta de la SPA sigue siendo `/rol`; se mantienen los nombres `rol` y `resouce`.

- Props, callbacks, formulario, errores Redux y respuestas HTTP tipados.
  Actualizar y borrar requieren `id`; no se fuerza con una aserción.
- `resouce` obtiene opciones desde `/permission`, usando `identificador` como
  valor y `nombre` como etiqueta. El selector múltiple emite identificadores;
  el tipo anterior solo declaraba `Permission[]`. `RolePermission` contempla
  identificadores string/number y objetos de relación heredados, sin convertir
  valores ni reescribir el cuerpo enviado. El esquema conserva su validación
  permisiva de elementos con `z.custom<RolePermission>()` sin predicado, en lugar
  de `z.any()`: esto aporta tipado, no validación nueva del backend.
- Se compone un `Controller` y un Select MUI dentro del formulario para tipar su
  control y deshabilitar explícitamente el selector, cuyo elemento interactivo
  no queda bloqueado solo por el fieldset. Se conservan selección múltiple,
  etiquetas y opciones. No se modifica el selector compartido ni `resouce`.
- Los cuatro thunks limpian errores anteriores, normalizan mediante
  `apiErrors.ts` y rechazan con la causa original. Los fallos conservan filas y
  selección. Se mantiene `createLatestListRequest`, el callback estable y su
  `AbortSignal` opcional, sin cambiar la coordinación de respuestas obsoletas.
- El submit captura rechazos y aplica errores solo a los campos conocidos.
  No resetea el formulario ante fallos: mantiene nombre y permisos para
  reintentar. `loading || isSubmitting` bloquea campos, selector, guardar y cierre.
- La confirmación de borrado se compone con MUI: conserva selección, error,
  fila y diálogo tras fallo; bloquea controles y cierre durante el envío.
  Solo cierra tras éxito o cancelación explícita. Cancelar limpia la selección.
  `RoleError` presenta errores en listado, formulario y confirmación.

## Documentación

Versiones resueltas en `package-lock.json`: React 19.3.1, React Hook Form 7.55.0,
resolvers 5.9.2, Zod 4.6.7, Redux Toolkit 2.6.1, Axios 1.21.0 y MUI 6.4.7.
Se leyeron las skills Vercel de React y composición y sus reglas de acciones en
eventos y composición con children, aplicándolas a esta SPA.

Context7 respondió para React Hook Form y MUI v6 sobre manejo de rechazos,
`setError`, envío y cierre. No ofrece los parches exactos RHF 7.55.0 y MUI 6.4.7;
se consultaron también las fuentes oficiales de
[handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit) y
[Select v6](https://v6.mui.com/material-ui/react-select/), además de compilar contra
los tipos instalados. Esas páginas no fijan los parches instalados; no se
adoptaron APIs posteriores ni APIs Next.js.

## Verificación

- `npm test`: 93 pruebas aprobadas. La nueva suite ejecuta reducer, thunks y
  cliente Axios reales con transporte simulado. Comprueba los cuatro rechazos
  con causa original, errores de campo/generales/red, datos y selección
  conservados, fin de carga, limpieza de errores y reintento en el mismo store.
  Comprueba JSON, métodos, endpoints, cookies, identificadores y permisos vacíos,
  identificadores mixtos y objetos heredados sin transformaciones. También
  verifica el esquema y que borrar solo elimina tras respuesta satisfactoria.
- `tests/list-loading.test.mjs` conserva sus cuatro escenarios para `rol`:
  respuesta antigua antes/después de la vigente, cancelación al desmontar y
  aislamiento entre stores; todos aprobados dentro de la suite global.
- Lint específico de `src/modules/rol` y ambos scripts: correcto, sin advertencias.
- Lint global inicial: 110 errores y 29 advertencias. Final: 104 errores y
  27 advertencias. Sigue fallando por deuda previa fuera del módulo; no se
  corrigieron archivos ajenos. Diagnósticos en `%TEMP%/rol-lint-before.txt` y
  `%TEMP%/rol-lint-after.txt`.
- `npm run build`: correcto. Persiste la advertencia previa del chunk compartido
  `GraphLayout` de 645,01 kB. Se restauró `tsconfig.app.tsbuildinfo`, limpio al
  inicio, después de las comprobaciones.
- `git diff --check -- src/modules/rol tests/rol.test.mjs tests/browser/rol.js
  docs/verification-rol-2026-11-08.md`: correcto.
- Playwright MCP activo: `chrome://version` confirmó Brave. Esa sesión se cerró
  antes de abrir la del recorrido. Se inició Vite preview en `127.0.0.1:4175`.
- `tests/browser/rol.js`: siete comprobaciones aprobadas en el build de producción.
  Cancelar borrado limpia selección; crear con 422 conserva nombre y permisos y
  marca ambos campos, mostrando además un error de clave ajena sin registrarla
  como campo. Durante envío se bloquean nombre, permisos, guardar y Escape;
  Enter no duplica la petición. El reintento crea y cierra tras éxito.
  Editar carga el permiso previo, permite añadir otro, conserva ambos ante
  desconexión y reintenta con PUT JSON, `id` y los mismos identificadores.
  Borrar bloquea botones y Escape, mantiene fila y diálogo ante 500 y permite
  reintentar. Dos peticiones por operación.
- Cero excepciones de página y mensajes inesperados de consola. Los tres errores
  de red son deliberados: 422, desconexión y 500. El script libera respuestas
  retenidas y retira interceptaciones en `finally`. El `finally` exterior llama
  a `browser_close` de Playwright MCP; cada intento empieza en una sesión nueva.
- El primer intento E2E falló por un selector heredado de la prueba de drogas
  (`Descripción` en vez de `Nombre`). Se corrigió el script. Se cerró el navegador
  también tras ese fallo. Los dos recorridos completos posteriores pasaron;
  el último incluye las comprobaciones ampliadas de permisos.
- Captura `.playwright-mcp/role-form.png`: formulario con título, error, nombre,
  selector y guardar visibles. Se inspeccionó la captura durante la verificación.
- Chrome DevTools MCP respondió a `list_pages`: `about:blank`, sin herramientas
  React de terceros disponibles. No se hizo perfil React ni de rendimiento.

## Repetición y límites

Con el build servido en `127.0.0.1:4175`, ejecutar mediante `functions.exec`:

```js
try {
  text(await tools.mcp__playwright__browser_run_code_unsafe({
    filename: 'tests/browser/rol.js',
  }));
} finally {
  text(await tools.mcp__playwright__browser_close({}));
}
```

Mantener el cierre exterior incluso ante fallos y abrir una sesión nueva para
cada ejecución. El recorrido simula autenticación, permisos, HTTP e imágenes:
no acredita persistencia ni autorización contra el backend real. No hay contrato
de servidor o muestra real que permita asegurar cómo devuelve relaciones con
objetos; se conserva el comportamiento previo sin normalizarlas a identificadores.
La carga de opciones de permisos sigue perteneciendo a `resouce`, fuera de este
bloque; no se modifica su manejo previo de fallos. No se midió rendimiento.
