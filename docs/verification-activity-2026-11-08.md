# Tipado y composición: activity — 2026-11-08

Se revisaron git status, AGENTS.md, los informes verification del 2026-11-07 y
los informes de rol, permission y user del 2026-11-08. Se conservaron los cambios
pendientes. Este bloque modifica únicamente activity, sus pruebas y este informe;
no añade dependencias ni componentes CRUD compartidos.

## Contratos y cambios

Se contrastaron los contratos de drugPresentation, weapon, ammunition, drug,
rol, permission y user con el código de activity y sus consumidores. Activity
es un listado de auditoría de solo lectura: GET /activity y editable=false.
No existen altas, edición, borrado, formularios, confirmaciones ni proveedores
de opciones en este módulo. No se inventan operaciones de escritura, selectores
ni esquemas Zod. Los requisitos de bloqueo de envío y cierre no son aplicables.

Se mantienen endpoint, parámetros de página/orden/filtro, cookies del cliente
compartido y mapeo de identificador a id. El nombre histórico setPermissions del
slice se conserva. La ruta sigue siendo /actividad. No se modifican rol ni resouce.

- Activity describe las filas con id; ActivityResponse distingue identificador
  recibido y cambios desconocidos antes de serializarlos. descripcion es opcional,
  pues ya se mostraba como columna sin estar declarada en el tipo anterior.
  id_usuario sigue siendo number y usuario string: no hay selector ni evidencia
  para convertirlos en objetos de User o normalizarlos. Se preservan otros campos
  recibidos mediante el spread existente.
- cambios conserva JSON.stringify, incluso para cadenas ya serializadas, null y
  valores ausentes. La fila admite string | undefined para representar su salida
  real. No se introducen validaciones o conversiones nuevas.
- fecha conserva dayjs(fecha).format('DD-MM-YYYY HH:mm:ss'), en la zona local del
  entorno, sin plugins UTC, conversión adicional ni rechazo de fechas inválidas.
- Errores Redux y props de ActivityError usan ApiErrorMessage. El thunk limpia
  errores al iniciar, normaliza mediante apiErrors.ts y rechaza con la causa
  original. El callback de carga captura ese rechazo para evitar excepciones
  sin manejar. Se elimina el log de registros de auditoría.
- ActivityError presenta el error y un botón permite reintentar sin desmontar la
  tabla ni perder selección, filas o parámetros. El hook conserva los argumentos
  de la última carga, incluida la señal del efecto del listado: un cambio de
  parámetros o desmontaje cancela también el reintento. No se reintenta con una
  señal ya cancelada ni mientras loading está activo.
- Se conserva createLatestListRequest, callback estable y AbortSignal opcional,
  con publicación de datos y fin de carga únicamente para la petición vigente.

## Documentación

Versiones resueltas del lockfile: React 19.3.1, Redux Toolkit 2.6.1, Axios 1.21.0,
Day.js 1.11.18, MUI 6.4.7 y Data Grid 7.27.3. También se comprobaron RHF 7.55.0,
resolvers 5.9.2 y Zod 4.6.7 al contrastar los formularios de referencia.
Se leyeron ambas skills Vercel y las reglas de acciones en eventos y composición
con children, adaptadas a esta SPA sin introducir APIs Next.js.

Context7 respondió sobre get<T>, AbortSignal y format. No ofrece los parches
Axios 1.21.0 ni Day.js 1.11.18; se contrastaron la documentación oficial de
[cancelación Axios](https://axios-http.com/docs/cancellation) y
[formato Day.js](https://day.js.org/docs/en/display/format), y los tipos instalados
mediante build. Son fuentes generales, sin fijar esos parches. No se incorporan
APIs nuevas de las versiones posteriores que aparecen en la documentación.

## Verificación

- npm test: 109 pruebas aprobadas, cero fallos. tests/activity.test.mjs añade
  cuatro contando el grupo Node. Ejecuta reducer, thunks y Axios reales con
  transporte simulado: errores HTTP generales/de campos, desconexión y error
  desconocido; causa original; filas y paginación conservadas; reintento en el
  mismo store; limpieza de errores; GET, parámetros, identificadores y cookies;
  cambios objeto/array/string/null/ausentes; fechas locales/con Z/inválidas;
  listado vacío y ausencia de logs del thunk.
- La suite list-loading existente cubre activity: respuesta antigua antes y
  después de la vigente, cancelación al desmontar e independencia entre stores.
  Los cuatro escenarios pasan.
- Lint específico de src/modules/activity, tests/activity.test.mjs y
  tests/browser/activity.js: correcto, sin advertencias. Lint global inicial:
  93 errores y 26 advertencias; final: 91 errores y 26 advertencias, fuera del
  módulo. Sigue fallando por deuda previa. Diagnósticos en
  %TEMP%/activity-lint-before.txt y activity-lint-after.txt.
- npm run build: correcto; persiste el aviso previo de GraphLayout grande
  (645,01 kB). Se restaura tsconfig.app.tsbuildinfo, limpio al inicio.
- git diff --check del alcance: correcto.
- Playwright MCP activo: chrome://version confirmó Brave en
  C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe. Esa sesión
  se cerró antes del recorrido. Se reutilizó preview en 127.0.0.1:4175 con el build
  recién generado.
- tests/browser/activity.js: cinco grupos aprobados, seis GET y ninguna
  escritura. Comprueba carga inicial única, campos, fechas y cambios; ausencia
  de controles CRUD; error HTTP de campos visible con fila y selección conservadas;
  reintento retenido con parámetros idénticos y limpieza del error; fin de carga;
  desconexión normalizada y recuperación; resultado vacío sin error anterior.
  Cero excepciones y mensajes inesperados de consola; dos fallos de red deliberados.
- El primer intento E2E falló por un selector exacto del encabezado fecha:
  su nombre accesible cambia al ordenar. Se corrigió usando role y data-field.
  El siguiente recorrido pasó. En ambos intentos el finally liberó respuestas
  retenidas y retiró interceptaciones; el finally exterior cerró el navegador
  mediante Playwright MCP, confirmando que no quedaban pestañas. Cada intento
  empezó en sesión nueva.
- Se inspeccionó .playwright-mcp/activity-error.png: alerta, reintento, tabla y
  selección visibles, sin recortes. Solo contiene fixtures sintéticos. No se
  registran cuerpos HTTP, datos personales reales ni secretos.
- Chrome DevTools MCP respondió list_pages: about:blank, sin herramientas React
  de terceros disponibles. No se realizó perfil React ni de rendimiento.

## Repetición y límites

Con el build servido en 127.0.0.1:4175, ejecutar mediante functions.exec:

```js
try {
  text(await tools.mcp__playwright__browser_run_code_unsafe({
    filename: 'tests/browser/activity.js',
  }));
} finally {
  text(await tools.mcp__playwright__browser_close({}));
}
```

Conservar el cierre exterior incluso ante fallos y abrir una sesión nueva para
cada prueba. El script libera su respuesta retenida y retira las interceptaciones
en finally, sin esperar indefinidamente a rutas pendientes.

Autenticación, HTTP e imágenes son simulados: no se acredita persistencia,
autorización ni formato real de auditoría contra el backend. Los tipos se basan
en el contrato del frontend existente; cambios permanece unknown al recibirlo
porque no hay evidencia de una estructura más estrecha. No se modifica el
formato histórico de fechas inválidas o cadenas de cambios ya serializadas.
