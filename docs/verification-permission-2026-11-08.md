# Tipado y composición CRUD: permission — 2026-11-08

Se revisaron primero `git status`, AGENTS.md, todos los informes
`verification-*-2026-11-07.md` y el informe de rol del 8 de noviembre.
Se conservaron los cambios pendientes. Este bloque se limita a
`src/modules/permission`, `tests/permission.test.mjs`,
`tests/browser/permission.js` y este informe. No añade dependencias ni extrae
componentes CRUD compartidos.

## Contratos y cambios

Se contrastaron los contratos de drugPresentation, weapon, ammunition, drug y
rol con permission y sus consumidores. Permisos usa JSON: `POST /permission`,
`PUT /permission/{id}`, `DELETE /permission/{id}` y `GET /permission` con los
parámetros existentes. Se mantienen `nombre`, `identificador`, su conversión a
`id` en filas, las cookies del cliente compartido y la ruta SPA `/permiso`.

`resouce` lee `/permission` y obtiene opciones con `value: identificador` y
`description: nombre`. Rol admite identificadores y objetos heredados en sus
relaciones; usuarios declara relaciones `Permission[]` y usa opciones del mismo
proveedor. Autenticación copia `data.permissions` a `permisos` sin convertirlo.
Se conserva el tipo público Permission y esos formatos; no se modifican los
consumidores ni los nombres `rol` y `resouce`.

- Props, callbacks, formulario, errores Redux y respuestas HTTP tipados.
  Actualizar y borrar requieren `id`. El esquema conserva sus campos,
  validaciones y valores sin transformaciones.
- Los cuatro thunks limpian errores anteriores, normalizan con `apiErrors.ts`
  y rechazan con la causa original. Los fallos conservan datos y selección.
- Se mantienen `createLatestListRequest`, el callback estable y su AbortSignal
  opcional, sin cambiar cancelaciones ni publicación de respuestas vigentes.
- El submit captura rechazos y aplica errores únicamente a nombre e
  identificador. Las claves ajenas se presentan como mensaje general.
  No resetea los campos al fallar. `loading || isSubmitting` bloquea controles,
  guardar y cierre durante el envío.
- Confirmación de borrado compuesta con MUI dentro del módulo: conserva fila,
  error, selección y diálogo ante fallos; bloquea botones y cierre mientras
  espera. Solo cierra tras éxito o cancelación explícita. Cancelar limpia la
  selección. Se corrige el texto anterior que se refería a rol.
- PermissionError presenta mensajes en listado, formulario y confirmación;
  títulos y guardar tienen nombres accesibles. Se elimina el log del submit.

## Documentación

Versiones resueltas en package-lock.json: React 19.3.1, React Hook Form 7.55.0,
resolvers 5.9.2, Zod 4.6.7, Redux Toolkit 2.6.1, Axios 1.21.0 y MUI 6.4.7.
Se consultaron ambas skills Vercel y las reglas sobre acciones en eventos y
composición con children, aplicadas a esta SPA sin APIs Next.js.

Context7 respondió para React Hook Form y MUI v6 sobre rechazos, setError,
isSubmitting y composición/cierre de diálogos. No ofrece los parches exactos
RHF 7.55.0 y MUI 6.4.7; se contrastaron también las fuentes oficiales de
[handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit) y
[Dialog v6](https://v6.mui.com/material-ui/react-dialog/), además de compilar
contra los tipos instalados. Esas páginas incluyen versiones posteriores;
no se adoptaron sus APIs nuevas.

## Verificación

- `npm test`: 99 pruebas aprobadas. La suite nueva aporta seis pruebas contando
  el grupo Node. Ejecuta reducer, thunks y Axios reales con transporte simulado:
  cuatro rechazos con causa original, errores de campo/generales/red, datos y
  selección conservados, fin de carga, limpieza de errores y reintento en el
  mismo store. Comprueba JSON, métodos, endpoints, cookies, identificadores,
  esquema y borrado únicamente tras respuesta satisfactoria.
- La suite existente `tests/list-loading.test.mjs` pasa los cuatro escenarios
  de permission: respuestas antiguas antes/después de la vigente, cancelación
  al desmontar y aislamiento entre stores.
- Lint específico del módulo y ambos scripts: correcto, sin advertencias.
- Lint global inicial: 104 errores y 27 advertencias. Final: 98 errores y
  26 advertencias. Sigue fallando por deuda previa fuera del módulo.
  Diagnósticos: `%TEMP%/permission-lint-before.txt` y
  `%TEMP%/permission-lint-after.txt`; pruebas: `%TEMP%/permission-tests.txt`.
- Build final correcto. Persiste el aviso previo de GraphLayout de 645,01 kB.
  El primer build detectó un atributo `permission` accidental al adaptar el
  formulario; se corrigió a `role="dialog"` antes del build y del E2E finales.
  Se restauró tsconfig.app.tsbuildinfo, que estaba limpio al inicio.
- `git diff --check` del alcance: correcto.
- Playwright MCP activo; chrome://version confirmó el ejecutable
  `C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`.
  Esa sesión se cerró antes de abrir la del recorrido.
- Se reutilizó el preview existente en 127.0.0.1:4175. Intentar iniciarlo con
  strictPort detectó el puerto ocupado; no se reemplazó el proceso existente.
- `tests/browser/permission.js`: siete comprobaciones aprobadas sobre el build
  de producción. Cancelar borrado limpia selección; crear con 422 conserva
  nombre y marca el campo, mostrando además el error de clave ajena. Durante
  envío se bloquean nombre, guardar y Escape; Enter no duplica la petición.
  El reintento crea y cierra tras éxito. Editar con desconexión conserva campos
  y reintenta con PUT JSON e id. Borrar bloquea botones y Escape, mantiene fila
  y diálogo ante 500 y permite reintentar. Dos peticiones por operación.
- Cero excepciones de página y mensajes inesperados de consola; tres errores
  de red deliberados: 422, desconexión y 500. El script libera respuestas
  retenidas y retira interceptaciones en finally. El finally exterior cerró
  el navegador mediante Playwright MCP; confirmó que no quedaban pestañas.
- Se inspeccionó `.playwright-mcp/permission-form.png`: título, error, nombre y
  guardar visibles sin recortes.
- Chrome DevTools MCP respondió a list_pages: about:blank, sin herramientas
  React de terceros disponibles. No se hizo perfil React ni de rendimiento.

## Repetición y límites

Con el build servido en 127.0.0.1:4175, ejecutar mediante functions.exec:

```js
try {
  text(await tools.mcp__playwright__browser_run_code_unsafe({
    filename: 'tests/browser/permission.js',
  }));
} finally {
  text(await tools.mcp__playwright__browser_close({}));
}
```

Mantener el cierre exterior tanto si pasa como si falla y abrir una sesión nueva
para cada prueba. El recorrido simula autenticación, HTTP e imágenes: no acredita
persistencia ni autorización contra backend real. No se amplía la validación
de relaciones de usuarios, autenticación o rol ni se cambia el manejo de errores
del proveedor resouce. No se midió rendimiento de renderizado.
