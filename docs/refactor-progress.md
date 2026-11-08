# Progreso de la refactorización

## Estado al 8 de noviembre de 2026

Se consolidaron los cambios anteriores en 12 commits locales y se prepararon
las instrucciones para continuar en conversaciones independientes.
**La migración a TanStack Query todavía no ha comenzado.** No se instalaron
dependencias ni se crearon services nuevos en esta preparación.

Leer [AGENTS.md](../AGENTS.md) y [el plan con sus prompts](refactor-plan.md)
antes de ejecutar un paso. Pasos **1, 2 y 3 completados**; siguiente paso pendiente:
**4, convenciones de arquitectura**, solo cuando se solicite.
Reutilizar las comprobaciones siguientes si siguen correspondiendo al código.

## Decisiones acordadas

- TanStack Query para datos remotos; Redux Toolkit se conserva para sesión y
  filtros aplicados compartidos entre mapas y gráficos.
- Services por dominio como acceso común para consultas/mutaciones y thunks
  restantes. Axios compartido mantiene URL, cookies e interceptor.
- React Hook Form para edición; estado local para diálogos y controles de vista.
- Migración por módulo, sin copiar resultados a Redux ni añadir thunks entre
  consultas y services. Conservar compatibilidad hasta migrar consumidores.
- El usuario desea un uso significativo de Redux en el proyecto; su eliminación
  completa no forma parte del objetivo.
- Playwright MCP selectivo para controlar consumo de tokens. Sin instalación
  obligatoria de Playwright Test, Vitest u otra herramienta adicional.
- No añadir formularios por pasos, lotes ni exportaciones en esta migración.

## Commits de consolidación anteriores al plan

Base previa: `f89dc60`, estabilización/cancelación de listados.

| Commit | Alcance |
| --- | --- |
| `71c25d1` | Plantilla de entorno con prefijo /api. |
| `b18ab3c` | Salida breve de Playwright, guía de uso y artefactos locales ignorados. |
| `8a5ed40` | Geocodificación inversa separada y cancelable, pruebas e informe. |
| `e7ee7e3` | Rutas protegidas diferidas e imports directos de reducers. |
| `59af2ed` | CRUD de presentaciones tipado, errores/reintentos y pruebas. |
| `260085f` | CRUD de armas tipado, errores/reintentos y pruebas. |
| `179db25` | CRUD de municiones tipado, errores/reintentos y pruebas. |
| `fcd69c3` | CRUD de drogas tipado, errores/reintentos y pruebas. |
| `3258f98` | CRUD de roles, relaciones, errores/reintentos y pruebas. |
| `16ba1f3` | CRUD de permisos, errores/reintentos y pruebas. |
| `1f68200` | CRUD de usuarios, relaciones, errores/reintentos y pruebas. |
| `abd2d36` | Auditoría tipada, errores, reintentos y pruebas. |

Se conservaron los cambios anteriores. Solo se eliminó un espacio final en el
formulario de presentaciones al preparar su commit. Capturas y logs permanecen
localmente en `.playwright-mcp/`, ahora ignorado; no se borraron ni versionaron.

## Referencia automatizada de esta preparación

Los comandos se ejecutaron sobre el código consolidado; los cambios posteriores
de esta preparación son documentos y limpieza de espacios sin cambio funcional.

| Comprobación | Resultado |
| --- | --- |
| `npm.cmd test` | 109 pruebas, 109 aprobadas, 0 fallos, 0 omitidas/canceladas. |
| `npm.cmd run lint -- --format json --output-file ...` | Falla: 91 errores y 26 advertencias de deuda previa; coincide con el último informe de actividad. |
| `npm.cmd run build` | Correcto; persiste aviso de chunks mayores de 500 kB. |
| `git diff --cached --check` | Correcto en cada commit de consolidación. |

Logs locales de esta ejecución (temporales, no versionados):
- `%TEMP%/graphdata-checkpoint-tests.txt`
- `%TEMP%/graphdata-checkpoint-lint.json`
- `%TEMP%/graphdata-checkpoint-build.txt`

Se restauró el contenido previo de `tsconfig.app.tsbuildinfo` después del build
para evitar incluir un artefacto incidental. No se modificó configuración de
TypeScript ni se corrigió deuda funcional fuera del alcance.

No se repitieron recorridos de navegador en esta preparación: no hubo cambios
de comportamiento. Existen scripts en `tests/browser/` e informes anteriores
con HTTP/autenticación simulados. No se comprobó disponibilidad de MCP en esta
ejecución ni se hicieron perfiles React, pruebas con backend real o mediciones
de ahorro de tokens. Los informes históricos no acreditan disponibilidad actual.

## Estado de los pasos

| Paso | Estado | Nota |
| --- | --- | --- |
| 1. Consolidar referencia | Completado | Código, contratos, informes y logs reconciliados el 8 de noviembre; referencia reutilizada sin cambios funcionales. |
| 2. Guardado de formularios | Completado | Formularios conservados durante envío/fallo, errores, bloqueo y reintentos verificados con HTTP simulado. |
| 3. Archivos | Completado | Siete esquemas con máximo efectivo de 5.000.000 bytes, rechazo de archivos vacíos y conservación de imágenes existentes; pruebas automatizadas. |
| 4. Convenciones | Pendiente | Guía y plan iniciales preparados; consolidar sin repetir lo vigente. |
| 5. Autenticación | Pendiente | Thunks/slice actuales; falta authService y mejora de tipos. |
| 6. TanStack Query | Pendiente | No instalado ni configurado. |
| 7. Service de permisos | Pendiente | HTTP todavía dentro de thunks. |
| 8. EntityList | Pendiente | Sigue usando callback de carga y contratos compartidos amplios. |
| 9. Piloto de permisos | Pendiente | CRUD y opciones aún usan Redux manual. |
| 10. Componentes comunes | Pendiente | Hay alertas/confirmaciones repetidas y campos con tipos amplios. |
| 11. Catálogos y actividad | Pendiente | Refactors previos conservados; migración de datos no iniciada. |
| 12. Confiscaciones | Pendiente | Mantener geocodificación y completar flujos, tipos y datos. |
| 13. Filtros Redux | Pendiente | Aún no hay slice de filtros aplicados compartidos. |
| 14. Mapas y gráficos | Pendiente | Mantienen flujos actuales y datos remotos en slices. |
| 15. Limpieza/rendimiento | Pendiente | No retirar todavía infraestructura con consumidores. |
| 16. Integración | Pendiente | Ejecutar al completar los pasos anteriores. |

## Contratos y pendientes que deben contrastarse

- Endpoints y credenciales actuales; los CRUD de permisos/roles/usuarios usan
  JSON y los catálogos con imágenes mantienen multipart y sus métodos actuales.
- `identificador` recibido se adapta a `id` en varios listados; los esquemas
  también conservan `identificador`. No eliminar ni reinterpretar campos por
  deducción. Mantener nombres públicos `rol` y `resouce`.
- Relaciones de roles/usuarios admiten identificadores y objetos heredados.
  `z.custom<T>()` sin predicado no valida esos elementos; revisar contra evidencia
  del contrato antes de endurecer o normalizar sus formatos.
- El interceptor conserva rechazos y puede entregar el cuerpo HTTP. Evitar
  asumir AxiosError/status disponibles en todos los casos.
- Conservar cancelación/protección de respuestas obsoletas. Sus pruebas actuales
  se centran en una petición vigente por listado/store; verificar la política
  deseada al introducir caché por argumentos.
- Las escrituras de permisos modifican filas locales sin reconstruir totales y
  paginación. El piloto debe resolver coherencia de lista, opciones y páginas.
- `resouce` mantiene cargas/errores anteriores y copias separadas de catálogos.
  Verificar si los endpoints usados en selectores devuelven todas las opciones.
- Guardado de confiscaciones y subdecomisos corregido en el paso 2: el cierre
  espera el éxito y `EditView` separa carga inicial de envío. Véase su registro
  y [verificación](verification-confiscation-save-2026-11-08.md).
- Validación de imágenes corregida en el paso 3: regla común para los siete
  esquemas; archivos nuevos entre 1 y 5.000.000 bytes, referencias existentes
  conservadas sin restricciones nuevas de formato.
- La carga diferida ya está implementada; el coste de código compartido y los
  renders requieren medición. No repetir la separación de rutas por rutina.

## Evidencia anterior

- [Autenticación y listados](verification-auth-lists-2026-11-07.md).
- [Geocodificación](verification-geocoding-2026-11-07.md).
- [Carga diferida](verification-lazy-routes-2026-11-07.md).
- [Presentaciones](verification-drug-presentation-2026-11-07.md),
  [armas](verification-weapon-2026-11-07.md),
  [municiones](verification-ammunition-2026-11-07.md),
  [drogas](verification-drug-2026-11-07.md).
- [Roles](verification-rol-2026-11-08.md),
  [permisos](verification-permission-2026-11-08.md),
  [usuarios](verification-user-2026-11-08.md),
  [actividad](verification-activity-2026-11-08.md).

## Registro de próximos pasos

### Paso 1 — Consolidar el punto de partida (8 de noviembre de 2026)

Alcance: revisión documental y del código, sin refactor, instalaciones ni cambios
en pruebas o configuración. HEAD al comenzar: `9cea377`; `git status --short`
estaba vacío. `git diff abd2d36 HEAD --stat` confirma que desde la última
consolidación solo cambiaron AGENTS.md, el plan y este progreso. El diff de
`src`, `tests`, `package.json` y `package-lock.json` entre ambos commits está
vacío. Los doce commits de la tabla anterior existen en el historial.

**Referencia vigente y comprobaciones reutilizadas.** Se leyeron los tres logs
temporales indicados arriba: tests registra 109 aprobadas, cero fallos,
canceladas, omitidas o pendientes; el JSON de lint suma 91 errores y 26
advertencias; build termina correctamente y conserva el aviso de chunks mayores
de 500 kB. Los conteos de Node incluyen grupos padre y subpruebas, no representan
109 recorridos de navegador. Los 12 archivos `tests/*.test.mjs` cubren errores
HTTP/auth, validación, nueve listados, geocodificación, siete CRUD y actividad.
No se ejecutaron de nuevo test, lint ni build: el código, pruebas y dependencias
son los mismos de la referencia y este paso solo modifica este documento.
Se comprobó `git diff --check` sobre el cambio documental al cerrar el paso.

Versiones resueltas contrastadas directamente con `package-lock.json`: React
19.3.1, Redux Toolkit 2.6.1, Axios 1.21.0, React Hook Form 7.55.0, resolvers
5.9.2, Zod 4.6.7 y Vite 8.3.5. TanStack Query sigue ausente del lockfile;
las pantallas conservan Redux y HTTP en thunks. No se introdujeron ni modificaron
APIs de librerías, por lo que no fue necesaria una consulta nueva a Context7.

**Implementación confirmada y referencias históricas superadas.** Se
contrastaron los informes `docs/verification*.md` con pruebas y consumidores:

- La incompatibilidad inicial resolver/Zod y la pérdida de valores de acceso
  ya están corregidas. Login/registro esperan el envío sin activar `checking`;
  ese estado queda para la comprobación inicial. No son pendientes del paso 2.
- Los siete CRUD de catálogos, roles, permisos y usuarios ya tienen tipado y
  tratamiento de fallo/reintento; actividad tiene lectura, errores y reintento.
  Las menciones antiguas a completar estos refactors no describen deuda actual.
  Su migración a services/Query sí sigue pendiente.
- La coordinación de listados ya está implementada: señal del efecto, callback
  estable y una petición vigente por dominio/store mediante
  `createLatestListRequest`. Las 36 subpruebas de concurrencia cubren cuatro
  escenarios en nueve módulos; no prueban caché por argumentos ni aislamiento
  entre sesiones. La geocodificación separada/cancelable y las doce entradas
  protegidas diferidas también están implementadas; el store importa slices
  directamente. No hay que repetir esas extracciones.
- Los conteos antiguos de tests/lint de los informes corresponden a sus bloques;
  la referencia global vigente es 109 / 91 errores / 26 advertencias. El espacio
  final mencionado en el informe de armas fue eliminado en la consolidación.

**Contratos y deuda real confirmados por lectura.** El cliente compartido
mantiene URL de entorno, cookies y rechazo con cuerpo HTTP cuando existe.
Los thunks conservan parámetros de página/orden/filtro y adaptación de
`identificador` a `id`; permisos/roles/usuarios usan JSON y los cuatro catálogos
con imagen conservan multipart y edición POST con `_method=PUT`, enviando logo
nuevo solo si es archivo. Actividad sigue siendo GET `/activity`, sin CRUD.
Estos son contratos del frontend y sus pruebas simuladas, no una validación
independiente del servidor. Se mantienen `rol`, `resouce` y relaciones heredadas;
`z.custom<T>()` sin predicado sigue sin validar su estructura.

- Paso 2: los tres formularios de subdecomisos invocan `onSaveOrUptdate(data)`
  y luego `handleOpen(false)` sin esperar; sus controles no bloquean el envío.
  `confiscation/views/EditView.tsx` monta el formulario con `!loading`, mientras
  detalle y escrituras comparten ese indicador. Los cuatro módulos de
  confiscaciones rechazan con `Promise.reject()` sin causa. El formulario
  principal sí espera el guardado: el problema no es idéntico al de los tres
  subformularios. Falta comprobar la interacción de forma acotada en el paso 2.
- Paso 3: los siete esquemas de imágenes (cuatro catálogos y tres subdecomisos)
  mantienen la condición ineficaz de tamaño. Las pruebas de validación actuales
  no acreditan un máximo efectivo ni resuelven la política de archivo vacío.
- Pasos 7–9: permisos conserva HTTP en thunks, filas locales en el slice y
  `EntityList` con protocolo de carga/diálogos; sus escrituras no recalculan
  totales ni páginas. No existe todavía el piloto de consultas.
- Pasos posteriores: `resouce` carga opciones separadas sin acreditar catálogo
  completo y deja el fin de carga solo en éxito; persisten tipos amplios en
  componentes compartidos, datos remotos en Redux y ausencia de slice de filtros
  aplicados compartidos. No se retira infraestructura con consumidores.

**Navegador y límites.** Se reutiliza la evidencia histórica descrita en los
informes y scripts de `tests/browser/`; no se repitió Playwright porque no cambia
el comportamiento ni hay un fallo nuevo que investigar en este paso. No se
comprobó disponibilidad actual de MCP, backend real, persistencia, permisos,
cookies del servidor ni rendimiento React. Los recorridos previos usan HTTP y
autenticación simulados; no se presentan como ejecuciones nuevas. No se corrige
la deuda global de lint ni el aviso de bundle. Paso 1 cerrado; paso 2 pendiente,
sin iniciarlo y sin marcar completado ningún otro paso.

### Paso 2 — Guardado y conservación de formularios (8 de noviembre de 2026)

Se conservó el cambio documental del paso 1 que ya estaba en el workspace.
Se ejecutó únicamente el paso 2 del plan; sin instalaciones, services nuevos,
TanStack Query ni cambios en los esquemas de archivos del paso 3.

- Los tres subformularios esperan el guardado del hook, que ya cierra solo
  tras éxito. Ante rechazo conservan campos, archivo, relaciones y padre;
  muestran un error y permiten reintentar. Sus callbacks de guardado se tiparon
  como promesas. El formulario principal conserva también errores de campo.
- React Hook Form administra `isSubmitting`; fieldset deshabilitado e `inert`
  bloquean campos nativos y controles MUI, además de cancelar/borrar/mapa durante
  el envío. El evento de envío se bloquea antes de volver a llamar a RHF y hay
  protección con ref durante la escritura. Se verificó un segundo submit
  programático: no duplica HTTP ni libera prematuramente el estado de envío.
- `EditView` monta tras completar el detalle, conserva el montaje durante la
  escritura y permite reintentar la carga inicial fallida. Los cuatro módulos
  propagan la causa original del rechazo. Se conservan endpoints, cookies,
  relaciones, JSON, multipart y POST con `_method=PUT`.
- Se distinguieron `z.input`/`z.output` en el formulario principal y su control
  del mapa; no cambia el comportamiento de geocodificación.

**Comprobaciones nuevas:** `npm.cmd test`, 114 aprobadas y cero fallos,
canceladas u omitidas (109 previas más cinco conteos del nuevo archivo).
`npm.cmd run build` correcto, con el aviso previo de chunks mayores de 500 kB.
Lint sigue fallando por deuda previa: **87 errores y 24 advertencias**, frente
a 91/26; sin nuevas reglas infringidas. `git diff --check` correcto al cierre.
Se restauró el artefacto incidental `tsconfig.app.tsbuildinfo` a su contenido
inicial. No se alteraron dependencias ni configuración.

**Navegador:** Playwright MCP operativo, siete grupos aprobados con autenticación
y HTTP simulados; 12 escrituras interceptadas, tres solicitudes de detalle,
cero errores JavaScript sin manejar y cero mensajes inesperados de consola.
Cubre carga inicial fallida/reintento, alta/edición principal, edición de los tres
subdecomisos con archivo y alta de droga con peso/opciones/archivo. Se corrigió
el bloqueo de submit duplicado detectado durante el recorrido; el script final
se ejecutó después de esa corrección. Detalles, rutas de scripts y límites en
[el informe del paso 2](verification-confiscation-save-2026-11-08.md).

Se reutiliza la evidencia previa para catálogos, auth, listados, carga diferida
y geocodificación sin repetir recorridos no afectados. Context7 consultado para
RHF 7.55.0: sin versión exacta en su catálogo, se usó documentación oficial
general de `handleSubmit` y `isSubmitting`; no se actualizaron APIs/dependencias.
No se verificó backend real ni persistencia. Paso 3 pendiente, sin iniciarlo.

### Paso 3 — Validación de archivos (8 de noviembre de 2026)

Al comenzar, HEAD `1f1539e` y workspace limpio; los pasos 1 y 2 ya estaban
incorporados. Se ejecutó únicamente el prompt del paso 3, sin cambios en
componentes, thunks, dependencias, configuración ni arquitectura del paso 4.

**Cambios y decisiones.** Los cuatro catálogos (presentaciones, armas,
municiones y drogas) y los tres subdecomisos tenían exactamente la misma regla
para `logo`/`foto`. Ahora consumen
[`imageSchema`](../src/shared/validators/imageValidation.ts): se distingue un
`File` nuevo de una referencia de texto existente. Se conserva el umbral de
**5.000.000 bytes inclusive**, corrigiendo la condición con OR que aceptaba
cualquier tamaño. Se rechaza cero bytes con error de campo: los siete esquemas
exigen imagen y la condición anterior ya intentaba comprobar `size !== 0`;
no existe un uso de archivo vacío como marcador de imagen previa (se usa texto).
Se conserva `File | string`, sin convertir valores ni añadir restricciones de
MIME, extensión o URL. Se elimina la comprobación redundante del tipo posterior
a la unión. No se modifican payloads, endpoints, cookies ni `_method=PUT`.

**Comprobaciones nuevas.**

- [`tests/image-validation.test.mjs`](../tests/image-validation.test.mjs):
  11 conteos aprobados (grupo padre y diez subpruebas). Los siete esquemas se
  prueban mediante el resolver de RHF con 0, 1, 4.999.999, 5.000.000 y 5.000.001
  bytes; comprueban error en el campo, identidad del archivo válido, referencias
  existentes intactas, ausencia/valor falso y ausencia de restricciones nuevas
  de formato. Tres pruebas adicionales conectan validación y edición multipart
  de subdecomisos: omisión de `foto` al conservar la referencia y reemplazo con
  archivo en el máximo, campos y relaciones conservados.
- `npm.cmd test`: **125 aprobadas**, cero fallos, canceladas u omitidas (114
  anteriores más 11 nuevos conteos). Incluye las pruebas vigentes de multipart
  y conservación de imágenes de los cuatro catálogos, sin duplicar esas pruebas.
- `npm.cmd run build`: correcto; persiste el aviso anterior de chunks mayores
  de 500 kB. Se restauró `tsconfig.app.tsbuildinfo` a su contenido inicial.
- `npm.cmd run lint -- --format json --output-file ...`: falla por deuda previa,
  **87 errores y 24 advertencias**, como en el paso 2; cero incidencias en los
  siete esquemas modificados, la regla común y el nuevo archivo de pruebas.
- `git diff --check`: correcto al cierre. Logs locales no versionados:
  `%TEMP%/graphdata-step3-tests.txt`, `%TEMP%/graphdata-step3-lint.json` y
  `%TEMP%/graphdata-step3-build.txt`.

**Documentación y reutilización.** Zod **4.6.7**, contrastado con el lockfile;
Context7 consultado en `/colinhacks/zod/v4.6.7` para `instanceof`, `refine` y
uniones, con [documentación de esa versión](https://github.com/colinhacks/zod/blob/v4.6.7/packages/docs/content/api.mdx).
No se necesitó cambiar APIs de React ni responsabilidades de componentes.
Se reutiliza la evidencia de navegador anterior para guardado/reintentos,
previsualización y conservación de imágenes con archivos válidos: esos
escenarios y controles no cambian. No se repitió Playwright ni se comprobó su
disponibilidad actual; el prompt de este paso permite pruebas automatizadas
sin navegador cuando no cambia la interacción. La nueva política de tamaños
y vacío queda cubierta por pruebas nuevas, no por los recorridos históricos.
No se comprobó backend real, persistencia ni validación del servidor.

Paso 3 cerrado. Paso 4 pendiente, sin iniciarlo; continúan la deuda global de
lint y el aviso de bundle documentados. El plan conserva su alcance original.

Al terminar cada paso, actualizar su fila y añadir una entrada con:
fecha, alcance, archivos/commits si existen, contratos conservados, decisiones,
pruebas y resultados reales, navegador utilizado y motivo (o por qué no fue
necesario), límites, pendientes y siguiente paso. No copiar logs completos ni
considerar una verificación histórica equivalente a una ejecución nueva.
