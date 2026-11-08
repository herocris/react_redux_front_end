# Guardado de confiscaciones — 8 de noviembre de 2026

Alcance exclusivo: paso 2 de [refactor-plan.md](refactor-plan.md).
Se conservó el cambio previo en el progreso. No se migraron datos ni se cambió
validación de archivos, contratos HTTP o dependencias.

## Cambios

Los subformularios esperan las promesas de sus hooks; estos mantienen el cierre
tras éxito. RHF conserva los valores y archivos al fallar y muestra el rechazo
mediante `getApiErrorText`. La edición principal mantiene errores de campo y
añade un mensaje general, sin depender de errores antiguos del slice.

`isSubmitting` controla el envío local; fieldset/`inert` bloquean también los
selectores MUI. Cancelar y borrar quedan bloqueados durante el envío, y el mapa
no puede abrirse. Se bloquea el segundo evento submit antes de llamar a RHF:
rechazarlo solo dentro del callback permitía finalizar prematuramente
`isSubmitting`, aunque la primera escritura siguiera pendiente.

`EditView` separa la carga inicial del indicador Redux usado por escrituras:
mantiene montado el formulario durante el guardado y permite reintentar detalle.
Los cuatro archivos de thunks rechazan con la causa original. Sus cuerpos HTTP
y adaptación de respuestas no cambian. Se tiparon callbacks async y entrada/
salida del formulario principal y su control del mapa.

## Verificación automatizada

- `tests/confiscation-save.test.mjs`: cinco conteos aprobados (grupo padre y
  cuatro subpruebas). Para cada dominio y alta/edición, verifica rechazo de
  validación/red/null, selección y datos conservados, fin de loading y reintento
  con JSON/multipart, archivo, padre, cookies, URL y método existentes.
- `npm.cmd test`: 114 aprobadas, cero fallos/canceladas/omitidas. Se reutiliza
  este resultado para los thunks: los ajustes posteriores fueron tratamiento
  de errores/tipos del formulario y se cubrieron con navegador y build.
- `npm.cmd run build`: correcto; aviso previo de chunks mayores de 500 kB.
- Lint: 87 errores y 24 advertencias de deuda previa (referencia 91/26).
  Se eliminan tres errores por `Function` de callbacks, un `prefer-const` y
  dos advertencias de dependencias de efectos modificados; no se amplía alcance
  para resolver el resto.

Logs locales ignorados: `.playwright-mcp/step2-all-tests.txt`,
`step2-tests.txt`, `step2-lint.json`, `step2-build.txt` y
`step2-browser-result.json`. No se versionan logs ni capturas.

## Playwright MCP

Script conservado: `tests/browser/confiscation-save.js`, contra Vite local en
`http://127.0.0.1:5175`. Autenticación y HTTP interceptados; imágenes de prueba
locales. El script libera la respuesta pendiente en `finally` y retira rutas.
La última ejecución aprobó siete grupos:

1. Detalle falla: error visible, sin formulario prematuro y reintento correcto.
2. Edición principal: mismo nodo de formulario durante envío y fallo, segundo
   submit bloqueado, valores conservados y éxito sin recargar el detalle.
3. Edición de drogas: cantidad y archivo sobreviven a 422; reintento multipart.
4. Edición de armas: mismo comportamiento y cierre solo tras éxito.
5. Edición de municiones: mismo comportamiento y cierre solo tras éxito.
6. Alta de droga: padre, opciones, cantidad, peso y archivo conservados; reintento
   sin `_method`, cierre tras éxito.
7. Alta principal: fallo conserva valores y ruta; éxito navega a edición.

Resultado final: 12 escrituras interceptadas y tres solicitudes de detalle,
cero `pageerror` y cero avisos/errores inesperados de consola. Los errores de
recurso 500/422 corresponden a fallos simulados deliberadamente. Sin capturas:
se verificó interacción y permanencia del DOM, sin rediseño visual.

## Documentación y límites

Versiones resueltas conservadas: React 19.3.1, RHF 7.55.0, resolvers 5.9.2,
Zod 4.6.7. Se aplicó `vercel-react-best-practices` en los criterios compatibles
con esta SPA, sin APIs de Next.js. Context7 no ofrece la versión exacta 7.55.0;
se consultó la [documentación oficial de handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit)
para promesas, captura del rechazo e `isSubmitting`.

Se reutilizan informes históricos de auth, catálogos, geocodificación y carga
diferida porque no cambian esos escenarios. No se probó backend real,
persistencia, autorización del servidor ni rendimiento. No se añaden garantías
de caché/sesión de la futura migración. El límite de archivos sigue pendiente
del paso 3. No se ejecutó ningún paso posterior.
