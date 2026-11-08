# Tipado y composición CRUD: user — 2026-11-08

Se revisaron primero git status, AGENTS.md, los informes verification del
2026-11-07 y los informes de rol y permission del 2026-11-08. Se conservaron
todos los cambios pendientes. Este bloque modifica únicamente user, sus pruebas
y este informe; no extrae componentes compartidos ni actualiza dependencias.

## Contratos y cambios

Se contrastaron drugPresentation, weapon, ammunition, drug, rol y permission.
Usuarios mantiene GET /user y sus parámetros, POST /user, PUT /user/{id} y
DELETE /user/{id}, JSON, cookies del cliente compartido y el mapeo de
identificador a id. Editar y borrar requieren id en sus tipos.

Se conservan nombre, correo, password, permisos y roles. El esquema exige
contraseña de ocho caracteres también al editar: no hay evidencia para hacerla
opcional, omitirla al enviar o inventar una contraseña inicial. No hay
transformaciones de Zod; input y output coinciden. Las relaciones se tipan como
identificadores string/number emitidos por los selectores u objetos Permission
y Role recibidos. z.custom sin predicado mantiene la validación permisiva previa
sin convertir valores ni añadir restricciones.

resouce obtiene las opciones desde /role y /permission mediante identificador y
nombre. Autenticación conserva nombre/correo desde name/email y copia roles y
permissions a roles/permisos sin conversiones. No se modifican esos módulos ni
sus nombres públicos. Sin muestras reales del servidor no se acredita la forma
exacta de sus relaciones; se preserva su comportamiento anterior.

Props, callbacks, formularios y respuestas HTTP quedan tipados. Los thunks
conservan apiErrors y el rechazo con la causa original. El submit captura el
rechazo, asigna errores solo a campos conocidos y conserva campos y selección.
Se eliminan los logs de usuarios y del submit. Los selectores locales MUI usan
Controller tipado y disabled explícito: el selector compartido no admite ese
bloqueo y registra valores en consola. No se altera ese componente compartido.

loading || isSubmitting bloquea controles y cierre. El formulario y la
confirmación solo cierran tras éxito o cancelación explícita. Borrar conserva
selección, error y fila ante fallos; cancelar limpia la selección. UserError
presenta mensajes generales y de campos. Se mantiene createLatestListRequest,
el callback estable y AbortSignal, sin cambiar cancelaciones ni respuestas
obsoletas del listado.

## Documentación

Versiones resueltas: React 19.3.1, RHF 7.55.0, resolvers 5.9.2, Zod 4.6.7,
Redux Toolkit 2.6.1, Axios 1.21.0 y MUI 6.4.7. Se leyeron ambas skills Vercel
y las reglas de acciones en eventos y composición con children para esta SPA.

Context7 respondió con documentación de resolvers 5.9.2 sobre inferencia y
genéricos input/output. No ofrece RHF 7.55.0; la búsqueda de MUI devolvió MUI X,
no Material UI. Se contrastaron las fuentes oficiales de
[handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit),
[Select v6](https://v6.mui.com/material-ui/api/select/) y
[Dialog v6](https://v6.mui.com/material-ui/api/dialog/), además de compilar contra
los tipos instalados. Esas páginas no fijan los parches instalados; no se
adoptaron APIs posteriores ni APIs Next.js.

## Verificación

- npm test: 105 pruebas aprobadas. tests/user.test.mjs aporta seis contando el
  grupo Node: cuatro rechazos con causa original, datos/selección conservados,
  errores normalizados, fin de carga, reintento y limpieza del error; contratos
  JSON, endpoints, cookies, identificadores, relaciones vacías/mixtas/objetos,
  esquema y requisito de contraseña en creación y edición. Usa Axios, reducer
  y thunks reales con transporte simulado. La primera adaptación de la prueba
  conservaba activeRole: se corrigió a activeUser antes de la ejecución final.
- La suite existente list-loading cubre user: respuestas antiguas antes y
  después de la vigente, cancelación e independencia entre stores; pasa.
- Lint específico del módulo y ambos scripts: correcto. Lint global inicial:
  98 errores y 26 advertencias; final: 93 errores y 26 advertencias, fuera del
  módulo. Diagnósticos en %TEMP%/user-lint-before.txt y user-lint-after.txt.
- Build correcto; persiste el aviso previo del chunk GraphLayout grande.
  Se restaura tsconfig.app.tsbuildinfo, limpio al inicio.
- Playwright MCP activo: chrome://version confirmó Brave en
  C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe.
  Se cerró esa sesión antes del recorrido. Se reutilizó preview 127.0.0.1:4175.
- tests/browser/user.js: siete comprobaciones aprobadas. Cancelar borrado limpia
  selección; crear con 422 conserva campos y relaciones, muestra errores y
  bloquea nombre, correo, contraseña, roles, permisos, guardar y Escape;
  Enter no duplica petición. El reintento crea y cierra. Editar sin contraseña
  no envía; tras introducirla, una desconexión conserva campos y selección y el
  reintento conserva PUT JSON, id y relaciones. Borrar bloquea ambos botones y
  Escape; 500 conserva fila/diálogo y el reintento elimina y cierra.
- Dos peticiones por operación, cero excepciones y mensajes inesperados de
  consola; tres fallos de red deliberados. El primer E2E falló por un selector
  exacto de Roles cuyo nombre accesible incluye la selección; se corrigió.
  Ambos intentos liberaron respuestas y retiraron rutas en finally, y cerraron
  el navegador mediante browser_close en un finally exterior.
- Captura user-form.png inspeccionada: formulario, alerta, campos, selectores y
  guardar visibles. Correo y contraseña se enmascaran. Solo se usan fixtures
  sintéticos; los diagnósticos de escrituras excluyen correo y contraseña.
- Chrome DevTools MCP respondió list_pages: about:blank, sin herramientas React
  de terceros disponibles. No se realizó perfil React ni de rendimiento.

## Repetición y límites

Con el build servido en 127.0.0.1:4175, ejecutar mediante functions.exec:

```js
try {
  text(await tools.mcp__playwright__browser_run_code_unsafe({
    filename: 'tests/browser/user.js',
  }));
} finally {
  text(await tools.mcp__playwright__browser_close({}));
}
```

Cada ejecución empieza en sesión nueva. El script libera respuestas retenidas
y retira interceptaciones en finally incluso ante fallo; conservar también el
cierre exterior. HTTP y autenticación son simulados: no acreditan persistencia,
autorización ni tratamiento real de contraseñas contra backend. El manejo de
fallos al cargar opciones de resouce permanece fuera del alcance.
