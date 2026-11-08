# Tipado y composición CRUD: drogas — 2026-11-07

Se revisaron primero `git status`, AGENTS.md y todos los informes
`verification-*-2026-11-07.md`, incluido municiones. Se conservaron los cambios
pendientes. Este bloque modifica únicamente `src/modules/drug`, sus pruebas y
este informe; no añade dependencias ni extrae componentes CRUD compartidos.

## Contratos y cambios

Se contrastaron `drugPresentation`, `weapon` y `ammunition` con el catálogo de
drogas. Se mantienen `descripcion`, `logo`, `identificador`, su conversión a `id`
en las filas, `/drug`, parámetros de listado y cookies del cliente Axios
compartido. Crear sigue usando multipart; editar usa POST multipart a
`/drug/{id}` con `_method=PUT`, enviando `logo` solo cuando es un archivo nuevo.
No se modifica el esquema ni sus validaciones existentes.

- Props, callbacks, formulario, estado de errores y respuestas HTTP tipados.
  Editar y borrar exigen un `id`. El esquema no transforma valores.
- Los cuatro thunks limpian el error anterior, normalizan mensajes mediante
  `apiErrors.ts` y rechazan con la causa original. Los fallos conservan filas y
  selección. Se mantiene `createLatestListRequest`, el callback estable y su
  señal opcional, sin cambiar la coordinación del listado.
- El submit captura el rechazo y aplica errores solo a campos conocidos. No
  resetea el formulario ante fallos: conserva texto y archivo para reintentar.
  `loading || isSubmitting` bloquea el fieldset y el cierre.
- Confirmación de borrado compuesta con MUI dentro del módulo: bloquea botones
  y cierre mientras espera; conserva diálogo, error y selección ante fallos.
  Cierra solo tras éxito o cancelación explícita. Cancelar limpia la selección.
- `DrugError` muestra errores en listado, formulario y confirmación. Los títulos
  y guardar tienen nombres accesibles; los textos se refieren a drogas.

## Documentación

Versiones resueltas en `package-lock.json`: React 19.3.1, React Hook Form 7.55.0,
resolvers 5.9.2, Zod 4.6.7, Redux Toolkit 2.6.1, Axios 1.21.0 y MUI 6.4.7.
Se leyeron las dos skills Vercel y sus reglas sobre interacciones en eventos y
composición con children, aplicadas a esta SPA sin APIs de Next.js.

Context7 respondió para React Hook Form y MUI v6: manejo del rechazo con
`handleSubmit`/`setError`, estado de envío y cierre del diálogo. No ofrece los
parches exactos RHF 7.55.0 y MUI 6.4.7. Se contrastaron las fuentes oficiales de
[handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit) y
[Dialog v6](https://v6.mui.com/material-ui/react-dialog/), además de compilar con
los tipos instalados. Esas páginas generales incluyen versiones posteriores;
no se adoptaron APIs nuevas ni se actualizó ninguna dependencia.

## Verificación

- `npm test`: 87 pruebas aprobadas. `tests/drug.test.mjs` usa reducer, thunks y
  cliente Axios reales con transporte simulado: los cuatro rechazos conservan
  causa/datos/selección, normalizan mensajes y terminan carga; comprueba creación,
  identificadores, cookies, edición con/sin archivo y borrado tras éxito.
  La suite existente `tests/list-loading.test.mjs` cubre drogas: respuestas
  obsoletas antes/después de la vigente, cancelación y aislamiento entre stores.
- Lint de todos los archivos modificados y nuevos: correcto sin advertencias.
  Lint de todo `src/modules/drug` y ambos scripts: cero errores y tres advertencias
  previas de `react-refresh/only-export-components` en `index.tsx`, sin modificar.
- `npm run lint`: sigue fallando con 110 errores y 29 advertencias. El informe de
  municiones registra 116 errores y 30 advertencias. No se corrigió deuda ajena.
  Diagnóstico global guardado en `%TEMP%/drug-global-lint.txt`.
- `npm run build`: correcto; persiste el aviso previo de `GraphLayout` grande
  (645,01 kB). Se restauró `tsconfig.app.tsbuildinfo`, limpio al inicio.
- `git diff --check -- src/modules/drug`: correcto.
- Playwright MCP activo. `chrome://version` confirmó
  `C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`.
  Esa sesión se cerró antes de abrir la del recorrido.
- Se reutilizó el preview existente en `127.0.0.1:4175`. Intentar iniciarlo con
  `--strictPort` detectó el puerto ocupado; no se reemplazó el proceso existente.
- `tests/browser/drug.js`: siete comprobaciones aprobadas sobre producción.
  Cancelar borrado limpia selección; crear con 422 conserva texto/archivo y
  marca el campo; bloquea descripción, eliminar imagen, guardar y Escape durante
  envío; reintentar crea fila y cierra. Editar con desconexión conserva campos y
  reintenta con POST multipart correcto y sin logo existente. Borrar bloquea
  ambos botones y Escape; un 500 conserva fila/diálogo y el reintento los elimina.
  Dos peticiones por operación; el archivo sigue presente en ambos intentos de
  creación.
- Cero excepciones de página y mensajes inesperados de consola. Tres fallos de
  red deliberados: 422, desconexión y 500. El recorrido libera respuestas
  retenidas y retira interceptaciones en `finally`, incluso si falla su montaje.
  Un `finally` exterior llama a `browser_close` de Playwright MCP tanto si pasa
  como si falla. El cierre respondió que no quedaban pestañas abiertas.
- Se inspeccionó `.playwright-mcp/drug-form.png`: título, alerta, campo, imagen,
  eliminar y guardar visibles, sin recortes.
- Chrome DevTools MCP respondió a `list_pages`: `about:blank`, sin herramientas
  React expuestas. No se realizó perfil de componentes ni de rendimiento.

## Repetición y límites

Con el preview en el puerto indicado, ejecutar mediante `functions.exec`:

```js
try {
  text(await tools.mcp__playwright__browser_run_code_unsafe({
    filename: 'tests/browser/drug.js',
  }));
} finally {
  text(await tools.mcp__playwright__browser_close({}));
}
```

Cada ejecución debe empezar en una sesión nueva y conservar este cierre exterior.
El script simula autenticación, HTTP e imágenes. No acredita persistencia,
permisos ni procesamiento de archivos contra el backend real. La validación de
tamaño de archivo del esquema sigue pendiente de un bloque específico, como en
los catálogos anteriores. No se midió rendimiento de renderizado.
