# Progreso de la refactorización

## Estado al 9 de noviembre de 2026

Se consolidaron los cambios anteriores en 12 commits locales y se prepararon
las instrucciones para continuar en conversaciones independientes.
La preparación inicial no instaló dependencias ni creó services. **El paso 6
incorpora la infraestructura de TanStack Query, el paso 9 migra permisos y el
paso 11 extiende la migración a los demás catálogos, sus opciones y actividad;
el paso 12 migra confiscaciones y subdecomisos; el paso 13 añade los filtros
aplicados compartidos en Redux, el paso 14 conecta mapas/gráficos con Query y el
paso 15 retira la infraestructura sustituida y difiere el CSS de Leaflet; el
paso 16 cierra la integración con suite completa y límites explícitos.**

Leer [AGENTS.md](../AGENTS.md) y [el plan con sus prompts](refactor-plan.md)
antes de ejecutar un paso. Pasos **1 a 16 completados**. Migración cerrada dentro
del alcance del plan; la deuda y la validación con backend real se detallan en
el cierre del paso 16. No hay otro paso iniciado.
El mantenimiento posterior solicitado el 9 de noviembre elimina la deuda de
lint y el aviso de chunks grandes. La verificación real del 10 de noviembre
comprueba sesión, lecturas, CRUD representativo y análisis; quedan abiertos
imágenes y metadatos de sublistas vacías, según
[el informe de backend real](verification-backend-real-2026-11-10.md). P02 corrige
después los tipos de ID y verifica la frontera URL, según
[su informe](verification-identifiers-p02-2026-11-11.md).
La comprobación posterior de roles/permisos creó el catálogo y detectó ausencia
de restricciones. Después, el usuario informó de su implementación en los
controladores Laravel y del cambio de nombres sin prefijo de aplicación.
P01 repitió después la matriz: 186/186 según las asignaciones actuales, con una
diferencia de política del operador respecto a la propuesta. Sigue pendiente
la integración de controles en el frontend;
ver [el informe de autorización](verification-access-control-2026-11-10.md).
Reutilizar las comprobaciones siguientes si siguen correspondiendo al código.

La preparación posterior para presentar el proyecto tiene
[prompts por tarea](portfolio-plan.md) y [progreso propio](portfolio-progress.md).
P01 y P02 están ejecutados; los demás prompts siguen pendientes. Su preparación no
ejecuta por sí misma los cambios.

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
| 4. Convenciones | Completado | Guía contrastada con código/plan; convivencia, propietarios, retirada y límites de cancelación documentados. |
| 5. Autenticación | Completado | authService, contratos de sesión separados, selectores tipados y thunks Redux; contratos y transiciones probados, acceso/registro verificados en navegador. |
| 6. TanStack Query | Completado | Cliente/proveedor estables, política explícita y aislamiento de sesión con convivencia Redux; pruebas y navegador con HTTP simulado. |
| 7. Service de permisos | Completado | Service tipado, contratos HTTP probados y thunks compatibles; pantalla y opciones siguen en Redux. |
| 8. EntityList | Completado | Tabla genérica controlada, callbacks de fila y adaptador temporal para los diez consumidores antiguos; CRUD, solo lectura y control externo verificados. |
| 9. Piloto de permisos | Completado | CRUD y opciones en Query; invalidación, catálogo paginado, página vacía, fallos/reintentos y sesión probados. |
| 10. Componentes comunes | Completado | Alertas, confirmaciones y marco modal compuestos; controles RHF tipados, selección sin copia local y errores con campos explícitos; consumidores representativos verificados. |
| 11. Catálogos y actividad | Completado | Services y Query en seis CRUD y actividad; opciones completas migradas en todos sus consumidores, invalidación y convivencia verificadas. |
| 12. Confiscaciones | Completado | Services y Query para listas, detalle y subdecomisos; borradores, archivos, paginación, errores, concurrencia y sesión verificados. |
| 13. Filtros Redux | Completado | Slice serializable, aplicación explícita desde RHF, selector tipado y reset de sesión; transiciones y navegador verificados. |
| 14. Mapas y gráficos | Completado | Services/Query con contexto Redux, RHF aislado, estados remotos y capas verificados. |
| 15. Limpieza/rendimiento | Completado | Retirados slices/thunks y adaptador antiguos sin consumidores; CSS Leaflet diferido, bundle y perfil local medidos; regresión selectiva aprobada. |
| 16. Integración | Completado | Propietarios y retirada contrastados; 208 pruebas aprobadas, build correcto, lint sin diagnósticos nuevos y regresión selectiva de opciones integrada. Límites y deuda registrados. |

## Contratos y pendientes que deben contrastarse

- Endpoints y credenciales actuales; los CRUD de permisos/roles/usuarios usan
  JSON y los catálogos con imágenes mantienen multipart y sus métodos actuales.
- `identificador` recibido se adapta a `id` en varios listados; los esquemas
  también conservan `identificador`. No eliminar ni reinterpretar campos por
  deducción. Mantener nombres públicos `rol` y `resouce`.
- Relaciones de roles/usuarios conservan IDs de texto/número y objetos heredados.
  El paso 11 añade predicados contrastados con tipos/fixtures disponibles, sin
  normalizar valores ni eliminar campos extra; falta contrastarlos con backend real.
- El interceptor conserva rechazos y puede entregar el cuerpo HTTP. Evitar
  asumir AxiosError/status disponibles en todos los casos.
- Confiscaciones, subdecomisos, catálogos y actividad usan caché por argumentos
  y señal de Query; los sublistados incluyen el padre en sus claves, con
  cancelación al retirar el último consumidor; se conserva el aislamiento de sesión.
- Las escrituras migradas invalidan su dominio tras éxito y recargan totales;
  el consumidor ajusta páginas vacías confirmadas conservando filtros y orden.
- Las opciones de permisos, roles, presentaciones, drogas, armas y municiones
  usan Query y recorren la paginación; no quedan colecciones remotas en `resouce`
  ni consumidores de sus thunks/slice. Conserva helpers de estado visual.
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

### Paso 4 — Convenciones de arquitectura (8 de noviembre de 2026)

Al comenzar, HEAD `e26aad4` y workspace limpio. Se leyó el prompt del paso 4
y se contrastaron guía, plan y progreso con store, auth, CRUD de permisos,
`resouce`, cliente HTTP, utilidad de cancelación y pruebas de listados.
Los pasos 1–3 están incorporados; TanStack Query sigue ausente del lockfile y
no hay piloto ni services de backend implementados. El paso 4 consolida las
convenciones para ese piloto futuro, no registra decisiones como ya probadas.

**Cambios y decisiones.** Se completó únicamente [AGENTS.md](../AGENTS.md),
manteniendo las reglas comunes allí y el alcance/secuencia en el plan:

- Ubicación por módulo de services y futuras consultas, contratos públicos y
  mapeadores; claves por dominio/argumentos, lista/detalle/opciones e invalidación
  tras éxito. El piloto deberá resolver totales, páginas vacías y catálogo de
  opciones completo; vigencia/reintentos/recargas se definen en el paso 6.
- Propietarios del estado en módulos migrados: Query para datos/estados remotos,
  Redux para sesión/filtros aplicados, RHF para edición y pantalla para selección,
  diálogos y navegación. Tabla controlada por el consumidor y conservación del
  formulario durante envío/recarga. No se trasladó estado en este paso.
- Convivencia explícita: HTTP/thunks/slices antiguos hasta su paso; permisos
  extraerá primero el service con thunks compatibles (7), adaptará EntityList (8)
  y migrará consultas y opciones (9). Retirada condicionada a ausencia de
  consumidores, integración y cobertura de garantías, sin duplicar datos remotos
  en Redux ni extender adaptadores temporales a otros dominios.
- Cancelación actual por dominio/store frente a futura caché por argumentos.
  Las pruebas existentes cubren respuesta tardía, fin de carga, aborto externo
  y stores independientes en nueve listados; no prueban aislamiento de sesión.
  Auth solo se reinicia a sí mismo al salir: no hay limpieza global acreditada.
  Queda para el paso 6 verificar limpieza/cancelación al cambiar sesión y
  respuestas tardías de lecturas/escrituras, también en módulos aún antiguos.

Se leyeron las skills locales de React y composición, aplicando solo derivación
de estado y composición sin variantes por banderas. No se introdujeron APIs ni
configuración de librerías: no fue necesaria nueva consulta a Context7. Se
reconfirmaron en el lockfile React 19.3.1, Redux Toolkit 2.6.1, Axios 1.21.0 y
RHF 7.55.0. No se modificaron código, pruebas, configuración ni dependencias.

**Verificación reutilizada.** Se leyeron los tres logs temporales del paso 3:
125 pruebas aprobadas, cero fallos/canceladas/omitidas; build correcto con aviso
de chunks mayores de 500 kB; lint falla por deuda previa de 87 errores y 24
advertencias. HEAD contiene el cierre del paso 3 y el diff contra HEAD de `src`,
`tests`, `package.json` y `package-lock.json` estaba vacío; los resultados siguen
vigentes. No se repitieron esos comandos para cambios exclusivamente
documentales. Se comprobó `git diff --check` al cerrar este paso.

Se mantiene la política selectiva de Playwright y la evidencia histórica con
HTTP/auth simulados. Sin cambios de comportamiento, no se repitió navegador ni
se comprobó disponibilidad actual de MCP. No se verificaron backend real,
persistencia ni rendimiento; no se atribuye cobertura de Query/sesión a las
pruebas antiguas. Paso 4 cerrado, plan sin cambios y paso 5 sin iniciar.

### Paso 5 — Autenticación (8 de noviembre de 2026)

Al comenzar, HEAD `d3d53c3` y workspace limpio. Se contrastaron instrucciones,
plan y progreso con auth, router, layout, usuario administrativo, cliente HTTP,
store y pruebas. Se ejecutó únicamente el prompt del paso 5; sin instalaciones,
TanStack Query, migración de CRUD ni cambios en formularios o endpoints.

**Cambios y decisiones.**

- [`authService`](../src/modules/auth/services/authService.ts) concentra POST
  `/login`, `/register`, `/refresh` y `/logout`, usando el cliente compartido con
  cookies. Conserva los payloads: email/password y name/email/password; no envía
  confirmación. Devuelve usuario de sesión o propaga la causa del rechazo sin
  efectos Redux/visuales. La comprobación admite `AbortSignal` opcional; todavía
  no se coordina cancelación global desde auth.
- Se tiparon las respuestas y su adaptación en la frontera. Login/refresh
  convierten name/email y roles/permissions a nombre/correo y roles/permisos.
  Registro conserva la forma anterior `{ user: SessionUser }` y adapta también
  la forma name/email presente en las pruebas previas. No se reinterpretan
  identificadores ni relaciones: conservan números, texto y objetos heredados.
  Son contratos del frontend, no validación runtime ni confirmación del servidor.
- `SessionUser`, roles y permisos de sesión son independientes de `User` y su
  formulario administrativo. Redux sigue siendo el único propietario de sesión;
  se conserva su estructura pública y el usuario vacío al salir. `AuthStatus`
  restringe los tres estados existentes y el error visual es string/undefined.
  Selectores tipados de estado, usuario y error se usan en router, layout y hook,
  con suscripciones precisas y sin importar el store desde la frontera de datos.
- Los thunks consumen directamente el service y conservan la coordinación Redux.
  `checking` sigue reservado al arranque; envío/campos permanecen en RHF. Se
  retiraron logs de errores potencialmente sensibles y temporizadores de cuatro
  segundos: el error persiste hasta el siguiente intento, limpieza explícita o
  transición de sesión; un temporizador antiguo ya no puede borrar otro error.
  Login/registro manejan el rechazo y permiten reintentar sin desmontar la vista.
  Logout conserva su contrato: espera éxito para salir, y ante fallo conserva
  sesión y propaga la causa; no se añadió una nueva UI de error de logout.

**Comprobaciones nuevas.**

- [`tests/auth.test.mjs`](../tests/auth.test.mjs): ocho conteos (grupo y siete
  subpruebas) cubren métodos, rutas, payloads, cookies, adaptación de ambas formas
  de registro, relaciones, rechazos HTTP/red/desconocidos, señal de refresh,
  reducers/selectores, refresh exitoso/fallido, fallo/reintento de acceso/registro
  sin checking y logout pendiente/exitoso/fallido. Se conserva cobertura previa
  de errores en `api-errors.test.mjs`, ajustando la expectativa de persistencia.
- `npm.cmd test`: **133 aprobadas**, cero fallos, canceladas u omitidas.
- `npm.cmd run build`: correcto; continúa el aviso previo de chunks mayores de
  500 kB. Se restauró `tsconfig.app.tsbuildinfo` al contenido inicial.
- `npm.cmd run lint -- --format json --output-file ...`: falla por deuda previa,
  **85 errores y 24 advertencias**, frente a 87/24. Sin nuevas infracciones;
  `Function` en `PasswordFieldProps` sigue siendo deuda previa del archivo de
  tipos, ajena al contrato de sesión. No se hizo limpieza general de lint.
- `git diff --check`: correcto al cierre. Logs temporales no versionados:
  `%TEMP%/graphdata-step5-tests.txt`, `%TEMP%/graphdata-step5-lint.json` y
  `%TEMP%/graphdata-step5-build.txt`.

**Navegador y reutilización.** Playwright MCP operativo; recorrido guardado en
[`tests/browser/auth-service.js`](../tests/browser/auth-service.js). Dos grupos
(login/registro) verifican petición pendiente, formulario montado, controles
bloqueados, conservación de campos/contraseñas tras rechazo, reintento y usuario
de sesión visible en dashboard. Cuatro escrituras POST simuladas con sus campos
correctos; cero excepciones JS y cero mensajes inesperados. El primer recorrido
solo falló al tratar dos avisos Canvas2D de lectura frecuente como inesperados;
se clasificaron explícitamente en el script y se repitió correctamente. No hubo
cambios de producto derivados de esos avisos. Los errores HTTP simulados de
refresh/acceso se filtran por endpoint. No se tomaron capturas: no cambió el
aspecto visual. Se reutiliza la evidencia previa de listados, CRUD, archivos,
geocodificación y carga diferida; no se repitieron sus recorridos no afectados.

**Documentación y límites.** Lockfile reconfirmado: React 19.3.1, Redux Toolkit
2.6.1, Axios 1.21.0 y React Redux 9.2.0; dependencias sin cambios. Se leyó la
skill React y su regla de suscripciones derivadas; no se rediseñó la composición
de componentes. Context7 consultado para RTK: sin 2.6.1 en su catálogo, se usó
documentación general de `createSlice`/`PayloadAction` y
[tipado oficial](https://redux-toolkit.js.org/usage/usage-with-typescript),
contrastado mediante compilación con los tipos instalados. Las URLs del tag
2.6.1 no se pudieron recuperar con el navegador; no se atribuye a esa versión
exacta la documentación general. No se verificaron backend real, cookies del
servidor ni persistencia.

**Pendiente explícito para el paso 6.** No hay caché Query instalada ni limpieza
global implementada. Logout solo reinicia auth; siguen los datos remotos de
módulos antiguos en Redux. Falta coordinar cancelación/limpieza al salir o
cambiar usuario y bloquear publicaciones tardías de lecturas y escrituras,
incluidos refresh/login pendientes y módulos antiguos. El soporte de señal del
service y su prueba no acreditan aislamiento de sesión ni reversión de una
escritura del servidor. Paso 5 cerrado; paso 6 sin iniciar, plan sin cambios.

### Paso 6 — Infraestructura Query y aislamiento de sesión (8 de noviembre de 2026)

Al comenzar, HEAD `8d3f6b8` y workspace limpio. Se leyeron guía, plan y progreso;
se contrastaron auth, store, cliente HTTP, cancelación de listados y consumidores.
Se ejecutó únicamente el prompt del paso 6. No se creó permissionService, no se
adaptó EntityList ni se migró ningún CRUD, opciones, mapas o gráficos a Query.

**Dependencias y política.** Se instaló la versión estable consultada en npm,
`@tanstack/react-query` **5.107.1**, fijada exactamente; `query-core` resuelve
también 5.107.1. Sus peers admiten React y sus tipos 18/19. Se reconfirmaron en
el lockfile React/React DOM 19.3.1, RTK 2.6.1, Axios 1.21.0 y TypeScript 5.8.2;
ninguna dependencia previa cambia de versión. npm recalculó una marca de
dependencia de desarrollo en el lockfile. La red del sandbox rechazó npm con
EACCES; consulta e instalación se completaron con la aprobación de escalación.

- [`queryClient`](../src/queries/queryClient.ts) se crea una vez fuera de React
  y se conecta mediante QueryClientProvider en bootstrap, después del registro
  de DevTools de desarrollo. No hay consultas de dominio ni copia de sesión.
- Consultas vigentes **30 segundos**, retención inactiva **cinco minutos**;
  recarga al montar, enfocar y reconectar solo si los datos están vencidos.
  Sin polling, persistencia ni reintentos automáticos en lecturas/escrituras.
  Mutaciones con retención explícita de cinco minutos. Cada dominio podrá
  ajustar esta base cuando se migre y lo justifique su contrato.
- `retry: false` evita clasificar errores por un supuesto AxiosError o perder
  su causa: el interceptor sigue rechazando con el cuerpo HTTP cuando existe,
  y se conserva el reintento explícito del usuario.

**Sesión y convivencia.**

- [`sessionScope`](../src/api/sessionScope.ts) solo mantiene la vida de una señal,
  sin usuario, credenciales ni estado React/Redux. El cliente HTTP combina esa
  señal con las señales nativas de consultas/listados usando `AbortSignal.any`.
  Su interceptor síncrono captura la sesión al iniciar la petición. Se mantienen
  URL, cookies, métodos, payloads y separación de la geocodificación externa.
- [`sessionMiddleware`](../src/store/sessionMiddleware.ts) retira la señal,
  cancela consultas y limpia ambas cachés al recibir onLogin/onLogout/onChecking.
  La política es conservadora: toda publicación de sesión, también un refresh
  del mismo usuario, inicia una vida nueva. Logout conserva la sesión y sus
  datos hasta éxito; un fallo no limpia datos ni publica una salida falsa.
- El reducer raíz reinicia todos los dominios antiguos (filas, detalle/selección,
  opciones, paginación, errores, carga, mapas y gráficos); auth aplica su propia
  transición. Redux sigue siendo el único propietario de sesión. Aún no existe
  el slice de filtros aplicados del paso 13; su futura conservación deberá ser
  explícita en este reducer, sin preservar resultados remotos por accidente.
- El middleware precede al thunk de RTK y proporciona un dispatch estable por
  sesión/store a los thunks existentes. Tras retirarlo, bloquea sus acciones y
  thunks anidados tardíos, incluso si el trabajo ignora la cancelación. Conserva
  la identidad necesaria para createLatestListRequest, que no se retira.
  Es infraestructura de la aplicación con su store/cliente únicos; no una copia
  adicional de identidad ni un service de dominio temporal.
- Auth coordina la última operación por dispatch, abortando la anterior. Refresh,
  acceso y registro tardíos no vuelven a autenticar ni expulsan al usuario nuevo;
  una salida antigua tampoco lo expulsa. authService admite señal opcional en
  sus cuatro operaciones sin cambiar payloads. El layout maneja el rechazo de
  logout para evitar promesas sin manejar, conservando la sesión y el reintento.
- [`sessionMutationOptions`](../src/queries/sessionMutationOptions.ts) prepara
  las futuras mutaciones: rechaza resultados obsoletos y evita iniciar sus
  callbacks de éxito/error/finalización tras un cambio de sesión. Query no
  cancela mutaciones automáticamente al limpiar su caché. Las futuras pantallas
  usarán este helper y sus callbacks protegidos, sin efectos por llamada a
  mutate; cualquier efecto posterior a un await adicional debe volver a comprobar
  la señal. Esa convención se añadió a AGENTS.md; no se implementó el piloto.

**Comprobaciones nuevas.**

- [`tests/query-session.test.mjs`](../tests/query-session.test.mjs): 11 conteos
  (grupo y diez subpruebas). Cubre caché por argumentos y vigencia; rechazo HTTP
  original sin reintentos; claves concurrentes; desmontaje y transporte; limpieza
  de todos los slices/cachés en tres transiciones; consultas tardías aun sin
  consumir signal; mutaciones tardías exitosas/fallidas y callbacks actuales;
  listado/opciones/escritura antiguos pendientes; dispatch tardío y anidado;
  exclusividad del listado dentro de sesión; carreras de refresh/acceso/salida;
  fallo de logout con caché conservada. Las pruebas desactivan solo sus timers
  de GC con Infinity para no esperar cinco minutos en Node; la app conserva su
  política. El primer intento esperaba resolución del listado retirado: se
  corrigió la prueba para comprobar su rechazo de cancelación, sin cambiar CRUD.
- `npm.cmd test`: **144 aprobadas**, cero fallos, canceladas u omitidas. Se
  conservan las 133 previas; auth prueba ahora propagación de la señal combinada
  en lugar de exigir identidad de objeto con la señal original.
- `npm.cmd run build`: correcto; sigue el aviso previo de chunks >500 kB.
- `npm.cmd run lint -- --format json --output-file ...`: deuda previa de
  **85 errores y 24 advertencias**, igual que el paso 5, sin incidencias nuevas.
- Logs finales locales: `%TEMP%/graphdata-step6-tests-final.txt`,
  `%TEMP%/graphdata-step6-build-final.txt` y
  `%TEMP%/graphdata-step6-lint-final.json`. `tsconfig.app.tsbuildinfo` restaurado
  al contenido inicial; `git diff --check` comprobado al cierre.

**Navegador.** Playwright MCP operativo. Se repitió
[`auth-service.js`](../tests/browser/auth-service.js) porque ahora cambian
transporte y coordinación: dos grupos aprobados, cuatro escrituras simuladas,
cero excepciones y cero mensajes inesperados. El recorrido nuevo
[`query-session.js`](../tests/browser/query-session.js) aprueba cuatro grupos:
listado antiguo con proveedor, logout fallido sin rechazo sin manejar, salida
con lectura pendiente y limpieza de filas/opciones/ambas cachés, acceso B sin
reaparición de datos A. Ocho solicitudes simuladas; cero excepciones JS y cero
mensajes inesperados, con el 503 de logout esperado y avisos Canvas conocidos.
Se corrigieron dos problemas del script: selector duplicado del menú y uso de
URLs sin timestamp de HMR que importaba otro store/cliente en vez de los usados
por la aplicación. La ejecución final usa las URLs ya cargadas y pasó después
de las correcciones. Interceptaciones liberadas en finally; sin capturas porque
no cambia el aspecto visual.

**Documentación y reutilización.** Se aplicó la skill React y su regla de
inicialización única, sin rediseñar APIs de componentes. Context7 no ofrece las
versiones exactas 5.107.1 de Query ni 1.21.0 de Axios: se consultaron sus guías
generales de Query v5 y Axios v1, contrastando tipos/código instalados y pruebas.
Referencias oficiales: [política de Query](https://tanstack.com/query/v5/docs/framework/react/guides/important-defaults),
[QueryClient](https://tanstack.com/query/v5/docs/reference/QueryClient),
[mutaciones](https://tanstack.com/query/v5/docs/framework/react/guides/mutations)
y [interceptores Axios](https://github.com/axios/axios/blob/v1.x/README.md).
No se atribuye esa documentación general a un tag exacto.
Se reutiliza la evidencia histórica de formularios, archivos, multipart,
geocodificación y carga diferida sin repetir sus baterías de navegador; sus
pruebas automatizadas sí forman parte de la suite completa ejecutada.

**Límites y pendientes.** HTTP/autenticación simulados: sin backend real,
persistencia ni cookies del servidor verificadas. Abortar/ignorar una respuesta
no demuestra que el servidor deshaga una escritura o un cambio de cookie; no se
promete reversión remota. La cobertura de infraestructura no acredita todavía
invalidación, catálogos completos o formularios de un CRUD migrado. Continúan
la deuda de lint y el aviso de bundle. Paso 6 cerrado; plan sin cambios y paso 7
pendiente, sin iniciarlo.

### Paso 7 — Service de permisos (8 de noviembre de 2026)

Al comenzar, HEAD `68f3ce1` y workspace limpio. Se leyeron AGENTS.md, plan y
progreso y se contrastaron con permisos, sus consumidores en `resouce`, cliente
HTTP, infraestructura de sesión y pruebas. Se ejecutó únicamente el prompt del
paso 7; sin cambios de dependencias, pantalla, EntityList ni consultas Query.

**Cambios y decisiones.**

- [`permissionService`](../src/modules/permission/services/permissionService.ts)
  concentra listado, creación, actualización y borrado con el cliente HTTP
  compartido. Centraliza los seis parámetros del listado, el orden `id` →
  `identificador` y la adaptación de respuestas `identificador` → `id`. Devuelve
  entidades y metadatos separados sin alterar los identificadores, los campos
  adicionales recibidos ni el objeto de entrada. No añade efectos visuales,
  dependencias Redux/React/Query ni caché propia; propaga los rechazos originales.
- [`types.ts`](../src/modules/permission/types.ts) distingue respuesta HTTP,
  entidad con id obligatorio, valores de formulario, parámetros y resultado de
  lista. Conserva `Permission` y los exports públicos anteriores compatibles
  con selección, formularios y opciones de `resouce`. Los tipos describen el
  contrato existente; no son validación runtime ni evidencia del backend real.
- Se preservan rutas, métodos, cookies y payloads JSON, incluidos `id` e
  `identificador` cuando los aporta el consumidor. Se conserva también la
  serialización literal del listado antiguo, incluido el filtro vacío `&=`;
  no se introduce un cambio de codificación de parámetros en esta extracción.
  Las cuatro operaciones admiten señal opcional y mantienen su combinación
  con la señal de sesión en el interceptor compartido.
- Los thunks consumen el service y siguen coordinando carga, errores, selección
  y publicación Redux. Se conserva `createLatestListRequest`, su señal y los
  controles de petición vigente y fin de carga. No se migra el HTTP de opciones
  en `resouce`; catálogo completo e invalidación corresponden al paso 9.

**Comprobaciones nuevas.**

- [`permission-service.test.mjs`](../tests/permission-service.test.mjs): seis
  conteos (grupo y cinco subpruebas) sin Redux verifican parámetros y orden,
  listado vacío, metadatos, adaptación sin coerción (`007`), campos adicionales,
  JSON/cookies, ambos identificadores del payload, borrado sin cuerpo, causas
  HTTP/red/desconocidas y aborto en las cuatro operaciones.
- Se trasladaron las aserciones HTTP de
  [`permission.test.mjs`](../tests/permission.test.mjs) al service. Se mantienen
  las pruebas Redux de errores, datos/selección conservados, limpieza de error,
  reintento y publicación solo tras éxito, y la prueba del esquema existente.
- `node --test tests/permission-service.test.mjs tests/permission.test.mjs
  tests/list-loading.test.mjs tests/query-session.test.mjs`: **69 aprobadas**,
  cero fallos/canceladas/omitidas. Incluye cancelación por argumentos/desmontaje,
  respuestas tardías y stores independientes de los nueve listados, además de
  aislamiento de sesión con listado/opciones/escritura antiguos pendientes.
- `npm.cmd run build`: correcto; persiste el aviso previo de chunks >500 kB.
  Se restauró `tsconfig.app.tsbuildinfo` a sus bytes iniciales.
- `npm.cmd run lint -- --format json --output-file ...`: deuda previa de
  **85 errores y 24 advertencias**. Sin diagnósticos nuevos al comparar
  archivo/regla/severidad/mensaje con el JSON final del paso 6; ningún
  diagnóstico en los archivos de permisos ni sus pruebas.
- `git diff --check`: correcto. Logs locales no versionados:
  `%TEMP%/graphdata-step7-tests.txt`, `%TEMP%/graphdata-step7-build.txt`,
  `%TEMP%/graphdata-step7-lint.json` y `%TEMP%/graphdata-step7-lint.txt`.

**Reutilización y documentación.** No se repitió la suite completa de 144
pruebas del paso 6: se ejecutaron los cuatro archivos afectados y se reutiliza
la evidencia de los restantes, cuyo código/escenarios no cambia. Se reutiliza
el [recorrido de permisos](verification-permission-2026-11-08.md) y la evidencia
de navegador de sesión del paso 6: no cambian interacción, formularios ni
proveedores, y la extracción se comprueba con transporte simulado. No se abrió
navegador ni se comprobó disponibilidad actual de Playwright MCP.

Se leyó la skill React y su regla de imports directos, sin rediseño de APIs de
componentes ni optimización adicional. Lockfile reconfirmado: Axios 1.21.0,
React 19.3.1, RTK 2.6.1 y Query 5.107.1. Context7 consultado para señales y
configuración Axios; no ofrece 1.21.0 exacta. Se usó documentación general v1
de [cancelación](https://github.com/axios/axios/blob/v1.x/docs/pages/advanced/cancellation.md)
y [configuración](https://github.com/axios/axios/blob/v1.x/docs/pages/advanced/request-config.md),
contrastada con tipos instalados, build y pruebas; no se atribuye a un tag exacto.

**Límites y pendientes.** Sin backend real, persistencia ni cookies del servidor
verificados. Abortar una petición no demuestra reversión de una escritura del
servidor. No se acredita catálogo completo, caché ni invalidación del CRUD de
permisos: aún no está migrado a Query. Continúan deuda de lint y aviso de bundle.
Paso 7 cerrado, plan sin cambios y paso 8 sin iniciar.

### Paso 8 — EntityList controlado (8 de noviembre de 2026)

Al comenzar, HEAD `4398dcb` y workspace limpio. Se leyeron AGENTS.md, plan y
progreso y se contrastaron todos los consumidores, tipos y protocolo de carga.
Se ejecutó únicamente el prompt del paso 8, sin cambiar dependencias, services,
thunks, store ni migrar pantallas/opciones a Query. El plan conserva su alcance.

**Cambios y decisiones.**

- [`EntityList`](../src/components/EntityList.tsx) recibe filas y columnas
  genéricas, total, carga y los tres modelos controlados de MUI (paginación,
  orden y filtros), con eventos tipados mediante `DataGridProps<Row>`. No
  mantiene estado propio ni efectos de carga, Redux, Query o diálogos.
  `onEdit` y `onDelete` reciben la fila original; omitirlos conserva solo lectura.
  No incorpora una bandera para alternar protocolos de carga.
- [`LegacyEntityList`](../src/components/LegacyEntityList.tsx) conserva el
  contrato anterior de los diez consumidores: columnas por nombre, avatares,
  selección y apertura de edición/borrado, incluido el flujo de confiscaciones.
  Las vistas solo cambian el import al adaptador. Su bandera `editable` previa
  permanece exclusivamente en esta compatibilidad, sin ampliarla al nuevo API.
- [`useEntityList`](../src/hooks/useEntityList.tsx) queda limitado al protocolo
  antiguo: es el único propietario de los modelos del adaptador y los entrega
  controlados a la tabla. Conserva carga por argumentos primitivos, numeración
  HTTP desde uno, filtro inicial vacío, orden de respaldo, señal de efecto y
  aborto al cambiar argumentos/desmontar. Los metadatos Redux aportan valores
  iniciales y total; no sobrescriben modelos en cada respuesta. Se mantienen
  `createLatestListRequest` y las protecciones de los thunks existentes.
- Se sustituyen `Function` y `Object[]` del contrato antiguo por callbacks y
  la forma mínima de fila que usa el adaptador. Se elimina `useEntityListProps`
  tras buscar sus consumidores; solo lo usaba el hook sustituido. Los tipos
  nuevos pertenecen al componente y no dependen de metadatos del backend.

**Comprobaciones nuevas.**

- `node --test tests/permission.test.mjs tests/permission-service.test.mjs
  tests/list-loading.test.mjs tests/query-session.test.mjs`: **69 aprobadas**,
  cero fallos/canceladas/omitidas. Contratos y transiciones de permisos,
  cancelación/desmontaje/respuestas tardías de los nueve dominios y aislamiento
  de sesión durante la convivencia. No se repitió la suite completa.
- `npm.cmd run build`: correcto; persiste el aviso previo de chunks >500 kB.
  Se restauró `tsconfig.app.tsbuildinfo` a sus bytes iniciales.
- `npm.cmd run lint -- --format json --output-file ...`: **78 errores y
  24 advertencias** de deuda restante, frente a 85/24 del paso 7. Comparación
  por archivo/regla/severidad/mensaje: cero diagnósticos nuevos; sin incidencias
  en EntityList, adaptador ni hook. No se hizo limpieza general de lint.
- `git diff --check`: correcto al cierre. Logs locales no versionados:
  `%TEMP%/graphdata-step8-tests.txt`, `%TEMP%/graphdata-step8-build.txt`,
  `%TEMP%/graphdata-step8-lint.json` y `%TEMP%/graphdata-step8-lint.txt`.

**Navegador.** Playwright MCP operativo, reutilizando la página y el servidor de
desarrollo existente en 4175. El intento de iniciar otro servidor eligió 4176;
se detuvo ese proceso auxiliar. Se ejecutaron los recorridos existentes
[`permission.js`](../tests/browser/permission.js) (siete grupos: selección,
crear/editar/borrar, fallo y reintento; seis escrituras simuladas) y
[`activity.js`](../tests/browser/activity.js) (cinco grupos: solo lectura,
campos, error, reintento y vacío; seis GET y ninguna escritura). Cero
excepciones JS y cero mensajes inesperados; errores de red simulados esperados.
El script de permisos conserva sus capturas existentes en `.playwright-mcp/`.

El nuevo [`entity-list.js`](../tests/browser/entity-list.js) monta un consumidor
controlado temporal y aprueba tres grupos: callbacks reciben la fila original
con ID numérico; eventos de página/orden actualizan el consumidor; cambios
externos de página/orden/filtro se reflejan en la tabla, el filtro emite cambios
y omitir callbacks elimina acciones. Cero solicitudes HTTP, excepciones o
mensajes de consola. Desmonta la prueba y retira sus listeners en `finally`.
Los primeros dos intentos fallaron por la forma del export CommonJS de React
y React DOM en Vite; se corrigió el script para usar sus exports por defecto,
sin cambios de producto, y la ejecución final pasó.

**Documentación y reutilización.** Se aplicaron las skills React y composición,
en concreto derivación sin estado duplicado y ausencia de nuevas variantes
por banderas. Lockfile reconfirmado: React 19.3.1, MUI Material 6.4.7 y DataGrid
7.27.3, sin modificaciones. Context7 no ofrece DataGrid 7.27.3 exacta; se
consultó su documentación oficial de la rama 7.29.1 sobre modelos controlados,
[paginación](https://github.com/mui/mui-x/blob/v7.29.1/docs/data/data-grid/pagination/pagination.md),
[orden](https://github.com/mui/mui-x/blob/v7.29.1/docs/data/data-grid/sorting/sorting.md)
y [filtros](https://github.com/mui/mui-x/blob/v7.29.1/docs/data/data-grid/filtering/index.md),
contrastada con tipos instalados, build y navegador. No se atribuye a la versión
exacta instalada. Se reutiliza la evidencia histórica de archivos, multipart,
geocodificación, autenticación y carga diferida, cuyos escenarios no cambian;
no se repitieron sus baterías ni los CRUD equivalentes de otros catálogos.

**Límites y pendientes.** Backend y autenticación simulados: no se verificaron
persistencia ni cookies reales. El adaptador conserva las limitaciones del
protocolo antiguo (primer filtro/orden y metadatos iniciales); la nueva tabla
entrega los modelos completos al consumidor. No se acredita todavía caché,
invalidación, catálogo completo ni corrección de página vacía de permisos:
corresponden al paso 9. Continúan deuda de lint y aviso de bundle. Paso 8
cerrado; paso 9 pendiente, sin iniciarlo.

### Paso 9 — Piloto de permisos (8 de noviembre de 2026)

Al comenzar, HEAD `2e2fa77` y workspace limpio. Se leyeron AGENTS.md, plan y
progreso, contrastando consumidores de permisos, opciones, store y pruebas.
Se ejecutó únicamente el prompt del paso 9, sin instalar dependencias ni
migrar el CRUD de roles/usuarios u otros dominios. Plan sin cambios.

**Cambios y decisiones.**

- [`permissionQueries`](../src/modules/permission/queries/permissionQueries.ts)
  centraliza claves de listas y opciones. Cada lista incluye página, tamaño,
  orden, campo y valor de filtro del contrato HTTP; consume directamente el
  service con la señal de Query. Mantiene la política del cliente del paso 6.
  Las claves independientes pueden coexistir, sin exclusividad global antigua.
- Las tres escrituras consumen el service mediante `sessionMutationOptions`.
  Solo tras éxito invalidan el dominio (todas las listas y opciones), esperan
  sus recargas activas y comprueban otra vez la señal de sesión antes de cerrar
  diálogos. Fallar la escritura no invalida ni altera filas/selección. Si falla
  una recarga tras una escritura correcta, se muestra el error de consulta con
  reintento, sin presentar la escritura como fallida ni repetirla automáticamente.
- [`usePermissionView`](../src/modules/permission/hooks/usePermissionView.ts)
  posee los modelos controlados y selección/diálogos locales; la tabla consume
  EntityList directamente, sin adaptador Redux. Query posee filas, metadatos,
  carga y errores. Los datos anteriores durante cambios de argumentos son
  placeholder de Query; no permiten seleccionar otra fila ni corregir página
  hasta recibir el resultado actual. Una página vacía confirmada se ajusta al
  último índice válido usando el total del servidor, sin borrar orden/filtros.
  RHF conserva la edición, separada de la carga del listado y de la mutación.
- [`permissionService.catalog`](../src/modules/permission/services/permissionService.ts)
  recorre `/permission` con página explícita y orden estable. No asume que un
  GET sin parámetros ni `per_page=100` entregue todo: sigue `last_page` incluso
  si el servidor limita el tamaño. Comprueba página, metadatos enteros, total
  estable, identificadores repetidos, páginas intermedias vacías y recuento
  final. Rechaza recorridos incompletos/inconsistentes sin publicar opciones
  parciales; propaga errores y cancelación. Se conserva la serialización HTTP,
  JSON, métodos, cookies e identificadores sin coerción del paso 7.
- Roles y usuarios comparten la consulta de opciones y las derivan de entidades
  consultadas, sin copiarlas a `resouce`. El estado de carga/error permite
  reintentar, conserva el borrador y bloquea selector/envío mientras no se puede
  disponer del catálogo. No bloquea la edición de texto por una recarga normal.
  El pequeño estado visual de opciones pertenece a permisos; no se consolidaron
  formularios, alertas generales ni confirmaciones del paso 10.
- Tras buscar consumidores en aplicación/store/pruebas, se retiraron slice,
  thunks, exports y `PermissionState` antiguos de permisos, además del thunk,
  acción y colección de sus opciones en `resouce`. Los tipos de entidad/formulario
  y sus consumidores de relaciones se conservan. `createLatestListRequest`,
  LegacyEntityList, los demás catálogos y Redux de sesión siguen vigentes.

**Comprobaciones nuevas.**

- [`permission.test.mjs`](../tests/permission.test.mjs): nueve conteos (grupo y
  ocho subpruebas), trasladando errores/reintentos a Query. Cubre claves por
  argumentos, caché/deduplificación, cambios rápidos y desmontaje con aborto,
  respuestas tardías, claves concurrentes, causas originales, las tres
  escrituras con invalidación solo tras éxito, listas/opciones activas,
  metadatos recargados, sesión retirada y cambio de sesión durante el await de
  invalidación. Conserva la prueba del esquema del formulario.
- [`permission-service.test.mjs`](../tests/permission-service.test.mjs) conserva
  las cinco subpruebas de contratos y añade tres de catálogo: servidor limita
  tamaño, vacío, metadatos ausentes/incoherentes, total cambiante, duplicados,
  fallo de segunda página y cancelación. No acredita el contrato de un backend
  real: verifica el contrato paginado disponible mediante transporte simulado.
- La prueba de listados antiguos conserva los ocho dominios restantes. La
  cobertura Redux de convivencia/sesión usa ahora roles y sus opciones, aún
  antiguos, manteniendo las mismas garantías tras retirar permisos.
- `node --test tests/permission.test.mjs tests/permission-service.test.mjs
  tests/list-loading.test.mjs tests/query-session.test.mjs tests/rol.test.mjs
  tests/user.test.mjs`: **82 aprobadas**, cero fallos/canceladas/omitidas.
  Log final: `%TEMP%/graphdata-step9-tests-final.txt`.
- `npm.cmd run build`: correcto, salida 0 en la ejecución final; persiste el
  aviso de chunks >500 kB. El primer comando redirigido en PowerShell devolvió
  1 pese a generar el build, al capturar el aviso por stderr; se confirmó sin
  redirección. Se restauró `tsconfig.app.tsbuildinfo` a sus bytes iniciales.
- `npm.cmd run lint -- --format json --output-file ...`: **77 errores y
  24 advertencias** de deuda restante, frente a 78/24 del paso 8; cero nuevos
  diagnósticos por archivo/regla/severidad/mensaje. Sin incidencias en archivos
  nuevos. Logs finales: `%TEMP%/graphdata-step9-lint-final.json` y `.txt`.
- `git diff --check`: correcto al cierre. No se repitió la suite completa;
  se reutilizan resultados históricos de contratos de módulos no modificados,
  imágenes, multipart, geocodificación y carga diferida. Roles/usuarios conservan
  sus CRUD Redux y se incluyeron sus pruebas de comportamiento en la selección.

**Navegador.** Playwright MCP operativo, reutilizando página y servidor existente
en 4175; el intento con `--strictPort` confirmó el puerto ocupado sin iniciar
otro servidor. Se ejecutó [`permission.js`](../tests/browser/permission.js):
siete grupos aprobados y seis escrituras simuladas. Su fixture ahora mantiene
estado para que las recargas posteriores a escrituras devuelvan el resultado
del servidor. Se conserva la captura del formulario del recorrido existente.
[`query-session.js`](../tests/browser/query-session.js), adaptado a la retirada
del slice, aprueba cuatro grupos con salida fallida, limpieza y lectura tardía
de A tras acceso B; ocho peticiones simuladas. Cero excepciones JS y mensajes
inesperados en ambos recorridos; errores HTTP simulados y aviso Canvas conocido.

El nuevo [`permission-query.js`](../tests/browser/permission-query.js) aprueba
cinco grupos: última fila de página 2 borrada con vuelta a página 1/total 10 y
filtro/orden conservados; fallo/reintento de recarga; catálogo completo en roles
con servidor limitado a dos filas; creación que actualiza opciones cacheadas
al volver a roles; opciones compartidas en usuarios y fallo/reintento sin perder
borrador ni permitir envío incompleto. Ejecución final: 30 GET de permisos,
18 de ellos páginas de opciones, dos 503 esperados, cero excepciones y cero
mensajes inesperados. Se repitió tras el último ajuste del selector de roles.
Los intentos iniciales corrigieron solo el script: codificación de guiones,
nombre accesible del menú y espera a la carga diferida de usuarios para evitar
interactuar con la vista anterior. Interceptaciones retiradas en finally.
Los fixtures de los recorridos históricos de roles/usuarios incluyen ahora los
metadatos de permisos; no se ejecutaron sus baterías completas, ya cubiertas por
la evidencia histórica para CRUD y por el recorrido nuevo para opciones.

**Documentación y límites.** Se aplicaron las skills React y composición,
manteniendo un propietario por estado y derivando opciones sin sincronizarlas
con Redux. Lockfile reconfirmado: Query 5.107.1, React 19.3.1, Axios 1.21.0,
DataGrid 7.27.3 y RHF 7.55.0; sin cambios de versiones. Context7 consultado para
Query; no ofrece 5.107.1 exacta. Se contrastó su guía v5 de
[invalidación](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations)
y [cancelación](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation)
con los tipos instalados, build y pruebas; no se atribuye a un tag exacto.
Backend/autenticación simulados: quedan sin verificar persistencia, cookies y
metadatos reales del endpoint. Un catálogo cambiante/incompleto requiere
reintento; no se presume una instantánea transaccional del servidor. Cancelar
no demuestra reversión de escrituras remotas. Continúan deuda de lint y aviso
de bundle. Paso 9 cerrado; paso 10 pendiente y sin iniciar.

### Paso 10 — Componentes compartidos (8 de noviembre de 2026)

Al comenzar, HEAD `fed81d8` y workspace limpio. Se leyeron AGENTS.md, plan y
progreso, contrastando consumidores y contratos antes de extraer piezas.
Se ejecutó únicamente el prompt del paso 10. No se modificaron dependencias,
services, consultas, thunks, store ni contratos HTTP. Plan sin cambios.

**Cambios y decisiones.**

- [ApiErrorAlert](../src/components/ApiErrorAlert.tsx) reúne las ocho alertas
  equivalentes (siete CRUD y actividad). Los exports de dominio son alias
  compatibles, sin otra implementación ni estado.
- [ConfirmDialog](../src/components/ConfirmDialog.tsx) reúne las siete
  confirmaciones CRUD: título/descripción accesibles con IDs únicos, bloqueo
  durante envío y errores compuestos como children. El consumidor conserva
  selección, carga, ejecución, error y cierre tras éxito. AlertDialog utiliza
  el mismo componente con su contrato antiguo tipado para confiscaciones;
  conserva el texto Ok y retira su transición Grow propia.
- [FormModal](../src/components/FormModal.tsx) compone título, estado visual,
  formulario, fieldset y transición en los siete modales. Cada dominio conserva
  RHF, esquemas, campos y acción de guardado, incluidos bloqueos de opciones.
  No hay formulario universal, contexto nuevo ni banderas de dominio. El marco
  impide cerrar/reenviar durante envío, conservando controles deshabilitados
  visibles para las herramientas de accesibilidad.
- [setServerFormErrors](../src/helpers/setServerFormErrors.ts) usa listas
  explícitas y tipadas de campos en esos siete formularios y el principal de
  confiscaciones. Todos los mensajes, incluidas claves desconocidas y rutas
  anidadas ajenas, quedan en el aviso general; solo campos admitidos llegan a
  setError. Se retira el cast dinámico de claves del servidor. El modal muestra
  un único aviso general, priorizando el error RHF sobre la prop remota.
- OptionSelector, MultipleSelectButton, DatePickerField y PhotoInput enlazan
  Control y nombres de campo mediante genéricos RHF, incluyendo entrada/salida
  transformadas. Fechas/fotos restringen el tipo de campo; el select conserva
  FieldPath porque las relaciones coercionadas admiten entradas unknown.
  No se cambian esquemas, formatos ni validación permisiva de relaciones.
- OptionSelector deriva la selección de RHF, sin índice local ni memoización
  superflua. Gráficos usa useWatch para typeConfiscation y retira su copia visual.
  Mapas/gráficos distinguen entrada/salida en useForm; no se migran sus datos
  ni se añaden filtros compartidos. Roles/usuarios reutilizan el select y
  conservan el bloqueo de permisos. El select preserva cero, texto y arrays,
  incluidos objetos de relación antiguos. Fechas conservan Dayjs al editar,
  texto inicial y vacío como null; fotos conectan nombre/blur/ref, manteniendo
  creación/revocación de object URLs. Se retiraron cuatro contratos de controles
  sin consumidores en sharedInterfaces.

**Comprobaciones nuevas.**

- [server-form-errors.test.mjs](../tests/server-form-errors.test.mjs): cuatro
  conteos (grupo y tres casos) de campos admitidos/desconocidos/anidados,
  mensajes generales, red, causa desconocida y reintento sin registrar rutas ajenas.
- `node --test tests/server-form-errors.test.mjs tests/api-errors.test.mjs
  tests/form-validation.test.mjs tests/image-validation.test.mjs
  tests/confiscation-save.test.mjs tests/permission.test.mjs tests/rol.test.mjs
  tests/user.test.mjs tests/drug.test.mjs tests/drug-presentation.test.mjs
  tests/ammunition.test.mjs tests/weapon.test.mjs`: **75 aprobadas**, cero
  fallos/canceladas/omitidas. Log: `%TEMP%/graphdata-step10-tests.txt`.
- `npm.cmd run build`: correcto en la ejecución final; persiste el aviso
  de chunks >500 kB. Se restauró tsconfig.app.tsbuildinfo a sus bytes iniciales.
  El primer chequeo señaló children de Zoom y entradas unknown de relaciones;
  se corrigieron sin casts ni cambios de esquemas. TypeScript final sin errores.
- `npm.cmd run lint -- --format json --output-file ...`: **60 errores y
  24 advertencias**, frente a 77/24 del paso 9; cero diagnósticos nuevos al
  comparar archivo/regla/severidad/mensaje. Logs: `%TEMP%/graphdata-step10-lint.json`
  y `%TEMP%/graphdata-step10-lint-final.json`.
- `git diff --check`: correcto. Un intento con autocrlf desactivado interpretó
  CRLF como espacios finales; el chequeo final usa la configuración del repo.

**Navegador.** Playwright MCP operativo, página y servidor existente en 4175.
[permission.js](../tests/browser/permission.js) y [drug.js](../tests/browser/drug.js):
siete grupos aprobados cada uno y seis escrituras simuladas por recorrido.
Cero excepciones JS/mensajes inesperados; tres errores HTTP/red esperados por
recorrido. Cubren cancelación, crear/editar/borrar, bloqueo pendiente, errores
de campo/general y reintento; drogas incluye archivo y multipart. Se inspeccionaron
las capturas finales `.playwright-mcp/permission-form.png` y `drug-form.png`:
títulos, mensajes, campos y acciones sin recortes en los casos representativos.

[permission-query.js](../tests/browser/permission-query.js): cinco grupos
aprobados, incluidos roles/usuarios con selectores compartidos, catálogo paginado,
invalidación y fallo/reintento sin perder borrador; 30 GET, 18 páginas de opciones,
dos errores esperados y cero excepciones/mensajes inesperados.

[shared-form-controls.js](../tests/browser/shared-form-controls.js): cuatro
grupos aprobados en consumidor temporal: selección inicial/eventos/reset;
select único con cero y múltiple con IDs numéricos/texto; fecha de texto tras
reset y cambio a Dayjs; archivo/reset/revocación de URL y eliminación de foto.
Cero excepciones/avisos de consola. Desmonta, restaura las APIs de URL y retira
listeners/ruta simulada en finally. El primer intento necesitó una imagen
simulada válida; se corrigió el fixture, sin cambios de producto.

Los intentos iniciales de permisos/drogas no se consideran aprobados: permisos
agotó una espera inicial y drogas detectó que inert ocultaba controles pendientes
al árbol accesible. Se retiró inert del marco, conservando fieldset disabled,
y ambos recorridos completos pasaron después. Sin interceptaciones pendientes.
No se repitieron los CRUD equivalentes de todos los catálogos.

**Documentación, reutilización y límites.** Se aplicaron las skills React y
composición: selección derivada y composición con children, sin nuevo contexto.
Lockfile reconfirmado sin cambios: React 19.3.1, RHF 7.55.0, Material 6.4.7,
Date Pickers 8.14.0 y Day.js 1.11.18. Context7 no ofrece RHF/Date Pickers exactos;
se consultaron guías oficiales generales de
[Control](https://github.com/react-hook-form/documentation/blob/master/src/content/docs/useform/control.mdx),
[setError](https://github.com/react-hook-form/documentation/blob/master/src/content/docs/useform/seterror.mdx)
y [slots de Pickers 8.11.0](https://github.com/mui/mui-x/blob/v8.11.0/docs/data/date-pickers/custom-field/custom-field.md),
contrastadas con tipos instalados, build y navegador, sin atribuirlas a tags exactos.

Se reutilizan las pruebas históricas de services, cancelación de listados,
aislamiento de sesión, geocodificación y carga diferida: no cambian sus
implementaciones/escenarios. No se repitió la suite completa. Guardado, imágenes
y validación sí se incluyeron por compartir formularios/controles. Backend y
autenticación simulados: no se acreditan cookies, persistencia ni servidor real.
No se hicieron perfiles ni se atribuyen mejoras medidas de rendimiento.
Continúan deuda de lint y aviso de bundle. Paso 10 cerrado; paso 11 pendiente,
sin iniciarlo.

### Paso 11 — Catálogos, opciones y actividad (9 de noviembre de 2026)

Al comenzar, HEAD `2544e32` y workspace limpio. Se leyeron AGENTS.md, plan y
progreso y se contrastaron consumidores, store y pruebas. Se ejecutó únicamente
el prompt del paso 11, en el orden solicitado. Plan y dependencias sin cambios.
Código y pruebas consolidados en el commit `fab58bd`; este registro se guarda
en un commit documental separado. Al preparar los commits solo se retiró una
línea vacía final; se reutilizan las verificaciones siguientes y se comprobó
`git diff --cached --check` antes de cada commit.

**Cambios y decisiones.**

- Services por módulo en presentaciones, armas, municiones, drogas, roles,
  usuarios y actividad. Conservan cliente Axios/cookies, endpoints, parámetros,
  adaptación de `identificador` a `id` sin coerción y causas de los rechazos.
  Los cuatro catálogos con imágenes mantienen creación multipart y actualización
  POST/FormData con `_method=PUT`, enviando logo al actualizar solo si es File.
  Roles/usuarios mantienen JSON y PUT; actividad solo expone lectura, con la
  serialización de cambios y formato local de fecha anteriores en su service.
- Consultas por dominio incluyen página, tamaño, orden, campo y valor de filtro
  en las claves; pasan su señal al service. Las mutaciones consumen services
  directamente y usan `sessionMutationOptions`. Solo tras éxito invalidan el
  dominio, esperan recargas activas y vuelven a comprobar la señal de sesión
  antes de cerrar. No hay inserción/borrado local que suplante totales remotos.
- Los hooks de pantalla poseen modelos controlados, selección y diálogos;
  RHF conserva los borradores. Se separan recarga y envío. La tabla usa EntityList
  directamente; el dashboard también migra su consumidor de drogas de solo lectura.
  Se comparte la columna de logo conservando su presentación anterior. Páginas
  vacías se corrigen solo con resultados actuales confirmados, sin perder orden
  ni filtro. Las filas placeholder no permiten editar/borrar.
- El recorrido de actividad detectó que keepPreviousData deja de exponer las
  filas anteriores al fallar una clave nueva. Los siete hooks conservan únicamente
  la clave de la última consulta correcta y leen su resultado de la caché de Query
  como respaldo; no duplican datos remotos en estado local ni Redux. Tampoco se
  permiten acciones de fila sobre ese respaldo de una clave fallida. Se mantiene
  la política del cliente del paso 6, incluida su retención temporal de caché.
- Las opciones se derivan de entidades Query. El helper de datos
  [readCatalog](../src/api/catalog.ts) recorre todas las páginas incluso con límite
  del servidor, exige metadatos estables, páginas correctas, IDs únicos y recuento
  completo; rechaza fallos, cancelación o respuestas parciales sin publicar un
  catálogo incompleto. Permisos conserva su implementación ya verificada.
- Migrados todos los consumidores de opciones: roles/usuarios, tres subdecomisos,
  mapas y gráficos. Carga/error/reintento pertenecen a las consultas, con estado
  visual explícito, selectores/envío bloqueados ante opciones no disponibles y
  edición conservada. Mapas/gráficos y subdecomisos conservan resultados/escrituras
  Redux: aquí solo cambió su fuente de catálogos. El efecto de carga de cada
  sublistado queda ligado a dispatch/padre mediante callback estable al retirar
  los dispatch de opciones; no se migraron sus peticiones.
- Relaciones: los predicados de Zod comprueban IDs string/number o los objetos
  heredados del contrato tipado (nombre y campos opcionales id/identificador;
  permisos opcionales en roles). Conservan valores, objetos y campos extra, sin
  normalizar a IDs ni inventar restricciones de positividad. Rechazan booleanos,
  null, arrays u objetos sin la forma admitida. La revisión usa contratos/tipos y
  fixtures existentes; no acredita todas las variantes de un backend real.
- Tras buscar consumidores en aplicación, store y pruebas se retiraron los siete
  slices/thunks remotos y exports/estados antiguos, además del estado/thunks/tipos
  de colecciones de resouce. Se mantiene el nombre resouce para sus helpers visuales.
  Redux de sesión y dominios de pasos futuros sigue vigente. LegacyEntityList y
  createLatestListRequest conservan su consumidor de confiscaciones y no se retiran.

**Comprobaciones automatizadas.**

- [catalog-contract.mjs](../tests/helpers/catalog-contract.mjs) y
  [catalog-query.mjs](../tests/helpers/catalog-query.mjs) reúnen escenarios de
  comportamiento ejecutados por separado en los seis módulos. Sustituyen las
  pruebas de thunks retirados: contratos HTTP/JSON/multipart, imagen nueva/existente,
  relaciones, causas y reintento, catálogo limitado/incompleto/duplicado/cancelado,
  claves/caché/deduplicación, cambios rápidos/desmontaje, claves coexistentes,
  invalidación solo tras éxito y señales de sesión, incluso durante su await.
  Actividad tiene pruebas propias de contratos, fechas/JSON, caché, error/reintento
  y lecturas tardías. API-errors conserva interceptor/auth y traslada garantías de
  usuarios a su service/Query. List-loading y convivencia/sesión usan ahora
  confiscaciones como dominio Redux restante, conservando sus garantías.
- `node --test tests/drug-presentation.test.mjs tests/weapon.test.mjs
  tests/ammunition.test.mjs tests/drug.test.mjs tests/rol.test.mjs
  tests/user.test.mjs tests/activity.test.mjs tests/query-session.test.mjs
  tests/list-loading.test.mjs tests/api-errors.test.mjs
  tests/form-validation.test.mjs tests/image-validation.test.mjs
  tests/confiscation-save.test.mjs tests/permission.test.mjs`: **144 aprobadas**,
  cero fallos/canceladas/omitidas. Log final:
  `%TEMP%/graphdata-step11-tests-final.txt`. Los primeros intentos ajustaron el
  harness para cargar el dominio correcto y comprobar propagación de aborto,
  sin exigir identidad de señal (el interceptor compone la señal de sesión).
- `npm.cmd run build`: correcto en el código final, salida 0; persiste aviso
  de chunks >500 kB. Se restauró tsconfig.app.tsbuildinfo a sus bytes iniciales.
- `npm.cmd run lint -- --format json --output-file ...`: **56 errores y
  18 advertencias** frente a 60/24 del paso 10, cero diagnósticos nuevos por
  archivo/regla/severidad/mensaje. Log: `%TEMP%/graphdata-step11-lint-final.json`.
- `git diff --check`: correcto al cierre. Sin cambios en package.json/lockfile.

**Navegador.** Playwright MCP operativo. No había servidor en 4175; se inició Vite
con host local y strictPort. Se reutilizó una página, con HTTP/auth simulados:

- [drug.js](../tests/browser/drug.js), [rol.js](../tests/browser/rol.js) y
  [user.js](../tests/browser/user.js): siete grupos y seis escrituras por recorrido;
  fallos de campo/red/borrado, conservación, bloqueo, reintento y cierre tras éxito.
  Cero excepciones/mensajes inesperados; tres errores simulados por recorrido.
  Fixtures de los seis CRUD ahora devuelven estado actualizado tras escrituras,
  porque las consultas recargan desde servidor. No se ejecutaron las baterías
  equivalentes de presentaciones/armas/municiones. Capturas de drogas y usuarios
  inspeccionadas: marcos, errores y acciones sin recortes; usuarios enmascara
  correo/contraseña en la captura como ya hacía su script.
- [activity.js](../tests/browser/activity.js): cinco grupos, seis GET y ninguna
  escritura; filas/selección conservadas ante fallos, reintento, parámetros,
  fecha/cambios y vacío. Dos errores esperados, cero excepciones/mensajes
  inesperados. Primer intento detectó la regresión de filas corregida arriba;
  otro encontró la caché vigente al volver al orden inicial: el fixture invalida
  esa clave explícitamente para comprobar una respuesta nueva vacía. El error
  de consulta se mantiene visible durante reintento hasta recuperarse.
- [catalog-query.js](../tests/browser/catalog-query.js): cinco grupos, 30 GET
  de roles (18 páginas de opciones), dos errores esperados. Última fila de página 2
  borrada con vuelta a página 1/total 10 y filtro/orden conservados; recarga fallida
  y reintento; catálogo limitado a dos filas; alta que invalida opciones cacheadas
  en usuarios; fallo/reintento de opciones sin perder borrador ni permitir envío.
  Cero excepciones/mensajes inesperados.
- [catalog-options-consumers.js](../tests/browser/catalog-options-consumers.js):
  cuatro grupos, 22 lecturas y dos errores simulados. Gráficos recupera catálogo
  completo; mapas comparte su caché sin GET adicionales; subdecomiso conserva
  cantidad durante fallo/reintento de presentaciones; selectores de los tres
  subdecomisos reciben las tres opciones, recorriendo límite de dos por página.
  Cero excepciones/mensajes inesperados. Se clasificaron aparte 34 avisos MUI
  conocidos de valores iniciales 0 sin opción correspondiente en subformularios.
  El primer intento usó «Munición», pero la etiqueta previa es «Arma»; se corrigió
  solo el localizador. Esa etiqueta y los defaults siguen pendientes del paso 12.
- [query-session.js](../tests/browser/query-session.js): cuatro grupos aprobados,
  ocho peticiones, logout fallido y limpieza con lectura pendiente A/acceso B.
  Cero excepciones/mensajes inesperados; un HTTP esperado y aviso Canvas conocido.
  Su inspección de Redux se adaptó a la retirada de resource.

Todos los scripts retiran rutas/listeners en finally; las respuestas diferidas
se liberan. No quedan interceptaciones pendientes. No se hicieron perfiles ni
se atribuyen mejoras medidas de rendimiento.

**Documentación, reutilización y límites.** Skills React/composición aplicadas:
opciones derivadas, estado remoto con un propietario y tablas controladas, sin
contextos ni formularios universales. Versiones resueltas reconfirmadas: React
19.3.1, Query 5.107.1, Axios 1.21.0, Zod 4.6.7, RHF 7.55.0 y DataGrid 7.27.3.
Context7 consultado para Query (no ofrece tag 5.107.1 exacto; documentación general
contrastada con tipos/pruebas) y Zod **4.6.7 exacta** sobre custom con predicado,
safeParse y conservación de claves. Referencias oficiales:
[invalidación Query](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations),
[cancelación Query](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation)
y [API Zod 4.6.7](https://github.com/colinhacks/zod/blob/v4.6.7/packages/docs/content/api.mdx).

Se reutilizan las comprobaciones históricas de geocodificación, autenticación,
carga diferida y controles compartidos, cuyas implementaciones y escenarios no
cambian; no se repitió la suite completa ni todos los CRUD equivalentes. Guardado,
imágenes y validación sí entraron en la selección por la integración de opciones.
No se verificaron persistencia, cookies, catálogos ni relaciones con backend real.
Un catálogo que cambia durante el recorrido requiere reintento; no se presume
instantánea transaccional. Abortar transporte no revierte escrituras del servidor.
Continúan deuda de lint, aviso de bundle y deuda previa de subformularios indicada.
**Paso 11 cerrado; paso 12 pendiente y sin iniciar.**

### Paso 12 — Confiscaciones y subdecomisos (9 de noviembre de 2026)

Al comenzar, HEAD `1165556` y workspace limpio. Se leyeron AGENTS.md, plan y
progreso y se contrastaron consumidores, contratos y pruebas. Ejecutado únicamente
el prompt del paso 12. Plan, dependencias, mapas/gráficos y filtros compartidos
sin migraciones adicionales. Código y pruebas consolidados en el commit `c836313`;
este registro se guarda en un commit documental separado. Al consolidar se
reutilizan las comprobaciones anteriores, sin cambios funcionales, y se comprueba
`git diff --cached --check` antes de cada commit.

**Cambios y decisiones.**

- Services tipados por módulo en confiscaciones y drogas/armas/municiones
  decomisadas. Conservan cliente Axios/cookies, endpoints, parámetros y rechazos.
  Confiscaciones mantiene JSON con POST/PUT; los hijos mantienen alta multipart
  y edición POST/FormData con `_method=PUT`, enviando foto al editar solo si es
  File. Se conservan fecha, coordenadas, cantidad, peso, archivo y relaciones.
  Los mapeadores adaptan identificadores/nombres como antes, sin reinterpretar IDs.
- Query posee listas, detalle, carga y errores. Las claves incluyen todos los
  parámetros; los hijos incluyen el padre. Sus señales llegan a los services.
  Las mutaciones consumen services directamente mediante `sessionMutationOptions`.
  Tras éxito esperan invalidación/recarga y comprueban otra vez la sesión antes
  de navegar o cerrar. Un fallo conserva selección y formulario, sin invalidar
  como si hubiera éxito. Las escrituras hijas invalidan su padre, sus listas y
  el detalle/listados principales; no invalidan los hijos de otro padre.
  Borrar un padre cancela/retira sus consultas hijas y su detalle cacheado.
- El listado principal usa EntityList controlado, con error/reintento y respaldo
  de filas desde la caché de Query; solo conserva la clave de respaldo en un ref.
  No permite acciones sobre resultados de otra clave. Los sublistados incorporan
  paginación visible, carga/error/reintento y bloquean selección ante fallo.
  Ambos corrigen páginas vacías con totales confirmados del servidor.
- EditView consulta el detalle y separa carga inicial de recarga. RHF toma una
  instantánea al montar el formulario; una recarga no ejecuta reset ni sobrescribe
  campos. La clave por padre reinicia explícitamente edición y subformularios al
  cambiar de decomiso. La selección hija se toma al abrir; las recargas no la
  reemplazan. Se mantiene el mismo formulario durante envío/fallo y los archivos
  permanecen en RHF. La geocodificación y sus controles conservan implementación.
- Los tres subformularios reciben el bloqueo de mutación, incluido borrado;
  se retira inert de sus fieldsets conservando disabled y controles accesibles.
  Relaciones nuevas comienzan visualmente vacías en RHF en vez de mostrar un 0
  ajeno al catálogo; no se cambia la validación numérica positiva ni el payload.
  Municiones muestra «Munición» y los botones de borrar tienen nombre accesible.
  Props de apertura/cierre tipadas; no se crea formulario universal ni contexto.
- Tras buscar consumidores en aplicación, store y pruebas se retiran los cuatro
  slices/thunks y sus exports. Redux conserva sesión, mapas y gráficos antiguos.
  LegacyEntityList y createLatestListRequest ya no tienen consumidores de
  aplicación; su retirada global queda para el paso 15, sin adelantarlo.
  list-loading conserva pruebas directas del helper mientras exista.

**Comprobaciones automatizadas.**

- [confiscation-save.test.mjs](../tests/confiscation-save.test.mjs) traslada
  cobertura a services/Query en los cuatro dominios: HTTP/JSON/multipart,
  relaciones, fecha/coordenadas, archivos nuevos/existentes, causas y reintento,
  claves/deduplicación, cambios rápidos/desmontaje, invalidación tras éxito,
  totales remotos, padres independientes y sesión retirada, también durante
  la recarga esperada por una mutación. Borrar padre retira sus hijos cacheados.
- image-validation prueba ahora los services; query-session usa mapas como
  dominio Redux restante y una escritura de prueba ligada al dispatch para
  comprobar convivencia. Se retira su escenario de exclusividad del listado de
  confiscaciones: las garantías vigentes se prueban por claves de Query.
- `node --test tests/confiscation-save.test.mjs tests/query-session.test.mjs
  tests/list-loading.test.mjs tests/form-validation.test.mjs
  tests/image-validation.test.mjs tests/server-form-errors.test.mjs`:
  **71 aprobadas**, cero fallos/canceladas/omitidas.
  Log: `%TEMP%/graphdata-step12-tests-final.txt`.
- `npm.cmd run build`: correcto, salida 0; persiste aviso de chunks >500 kB.
  Log: `%TEMP%/graphdata-step12-build-final.txt`. Se restaura
  tsconfig.app.tsbuildinfo a sus bytes iniciales.
- Lint final: **28 errores y 11 advertencias**, frente a 56/18 del paso 11;
  **cero diagnósticos nuevos** por archivo/regla/severidad/mensaje.
  Log: `%TEMP%/graphdata-step12-lint-final.json`.
- `git diff --check`: correcto tras retirar espacios finales generados.
  La limpieza final solo normaliza espacios/finales de línea de archivos
  cambiados; se reutilizan los resultados funcionales anteriores a esa limpieza.
  Sin cambios en package.json/lockfile.

**Navegador.** Playwright MCP operativo, página reutilizada y servidor Vite
existente en 4175 (el intento de arrancar otro confirmó el puerto ocupado).
HTTP/autenticación simulados:

- [confiscation-save.js](../tests/browser/confiscation-save.js): siete grupos,
  doce escrituras y ocho lecturas del detalle; carga fallida/reintento,
  bloqueo y mismo formulario ante 422, archivos/relaciones conservados en los
  tres hijos, alta y navegación solo tras éxito. Se verifica ahora invalidación
  del detalle sin sobrescribir la edición. Cero excepciones/mensajes inesperados.
- [confiscation-query.js](../tests/browser/confiscation-query.js): seis grupos,
  ocho lecturas de sublistado y siete de listado principal; borrado fallido y
  reintento, última fila/página vacía y total remoto, orden conservado en el
  principal, recargas fallidas con filas y reintento, borradores de padre/hijo
  conservados y cambio de padre con respuesta tardía. Cuatro HTTP esperados;
  cero excepciones/mensajes inesperados. Captura
  `.playwright-mcp/confiscation-query.png` inspeccionada: campos, selectores
  vacíos, archivos, acciones y acordeones sin recortes.
- [catalog-options-consumers.js](../tests/browser/catalog-options-consumers.js):
  cuatro grupos, 22 lecturas y dos fallos simulados; opciones completas,
  fallo/reintento conservando borrador y compatibilidad con mapas/gráficos.
  Cero excepciones/mensajes inesperados; seis avisos MUI conocidos de
  `period=0` en gráficos, fuera de este paso (ya no de los subformularios).
- [query-session.js](../tests/browser/query-session.js): cuatro grupos y ocho
  peticiones; salida fallida conserva sesión, salida correcta limpia Redux/Query
  y respuesta tardía A no contamina B. Un HTTP esperado y aviso Canvas conocido;
  cero excepciones/mensajes inesperados.

Los intentos iniciales no se cuentan como aprobados: se ajustaron fixtures y
localizadores (fieldset disabled y dos iconos Delete distintos), y pruebas
antiguas que aún importaban slices retirados. Se corrigió la inferencia de la
unión de resultados de mutación antes del build final. Los scripts completos
pasaron después y liberan respuestas/rutas/listeners en finally.

**Documentación, reutilización y límites.** Skills React/composición aplicadas:
datos con un propietario, estado derivado y reinicio por clave del padre.
Versiones resueltas reconfirmadas: React 19.3.1, Query 5.107.1, Axios 1.21.0,
RHF 7.55.0 y MUI 6.4.7. Context7 consultado sobre claves, cancelación e invalidación;
no ofrece Query 5.107.1 exacta. Documentación oficial general contrastada con
tipos instalados, build y pruebas:
[cancelación](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation)
e [invalidación](https://tanstack.com/query/v5/docs/framework/react/guides/invalidations-from-mutations).

Se reutilizan resultados históricos de geocodificación, controles compartidos,
carga diferida, autenticación y contratos de los catálogos, cuyas implementaciones
y escenarios no cambian. Se vuelve a verificar sesión/opciones por la retirada
de reducers y la integración con subformularios. No se repite toda la suite
ni los CRUD de catálogos. No se acreditan cookies, persistencia ni respuestas
del backend real; abortar transporte no revierte escrituras del servidor.
Sin perfiles ni mejoras medidas de rendimiento. Continúan deuda de lint,
aviso de bundle y defaults de gráficos para su paso correspondiente.
**Paso 12 cerrado; paso 13 pendiente y sin iniciar.**

### Paso 13 — Filtros compartidos en Redux (9 de noviembre de 2026)

Inicio en HEAD `b0f2bfd`, workspace limpio. Leídos AGENTS.md, plan y progreso;
ejecutado únicamente el prompt del paso 13. Sin cambios de dependencias ni del
plan. No se migran los datos remotos de mapas/gráficos ni se extraen sus services.
Código y pruebas consolidados en `0532222`; este registro se consolida en un
commit documental separado. Se reutilizan las verificaciones anteriores porque
no hay cambios funcionales posteriores; `git diff --cached --check` se ejecuta
antes de cada commit.

**Cambios y decisiones.**

- Contrastados formularios, esquemas, tipos y thunks: ambos endpoints aceptan
  `start_date`, `end_date`, `drugs`, `weapons` y `ammunitions`. Son los únicos
  campos de [AppliedAnalysisFilters](../src/modules/analysisFilters/types.ts).
  Fechas validadas como strings `YYYY-MM-DD`; IDs string/number conservados sin
  conversiones, ordenación ni normalización. Defaults: fechas vacías y arrays
  vacíos, sin inventar una selección o intervalo temporal.
- [analysisFiltersSlice](../src/modules/analysisFilters/slices/analysisFiltersSlice.ts)
  se registra como `analysisFilters` en el store. Acciones tipadas
  `applyAnalysisFilters` (reemplazo completo con copia de arrays) y
  `resetAnalysisFilters`; selector estable `selectAppliedAnalysisFilters`.
  El reducer selecciona los cinco campos explícitamente: no almacena propiedades
  extra de formularios, opciones, archivos, carga, errores ni resultados remotos.
- FormMap y FormGraph publican el snapshot solo en su submit válido, tras el
  bloqueo existente por catálogos no disponibles. RHF sigue siendo propietario
  del borrador; editar no despacha ni consulta. Ambos botones reciben el nombre
  accesible «Aplicar filtros». Se conservan sus llamadas actuales a los thunks,
  endpoints, serialización de arrays entre corchetes y parámetros particulares.
- Período, tipo de decomiso y tipo de gráfico son exclusivos de gráficos; tipo
  de mapa es exclusivo de mapas. Permanecen en sus propietarios actuales RHF/local,
  fuera del slice común. La aplicación conserva también las selecciones de las
  categorías no visibles, sin deducir que deban borrarse por cambiar de categoría.
- El reducer raíz ya restablecía dominios en `onLogin`, `onLogout` y `onChecking`;
  incluye ahora los filtros, sin duplicar esa política en otro efecto/reducer.
  No hay persistencia en almacenamiento ni nueva identidad de sesión.

**Comprobaciones realizadas.**

- [analysis-filters.test.mjs](../tests/analysis-filters.test.mjs): defaults,
  selector, reemplazo atómico, aislamiento del borrador/arrays, IDs y fechas,
  exclusión de campos ajenos, serialización, reset explícito y las tres fronteras
  de sesión. Se ejecuta junto a query-session por la integración con el store:
  `node --test tests/analysis-filters.test.mjs tests/query-session.test.mjs`,
  **15 aprobadas**, cero fallos/canceladas/omitidas.
  Log: `%TEMP%/graphdata-step13-tests.txt`.
- Build correcto, salida 0; persiste aviso de chunks >500 kB.
  Log: `%TEMP%/graphdata-step13-build.txt`. Se restauran los bytes iniciales de
  `tsconfig.app.tsbuildinfo` después del build.
- Lint final: **28 errores y 11 advertencias** de deuda previa, igual al paso 12.
  Cero diagnósticos nuevos por archivo/regla/severidad/mensaje y ninguno en los
  archivos modificados/nuevos. Log: `%TEMP%/graphdata-step13-lint-final.json`.
- Playwright MCP operativo; reutilizados servidor Vite de 4175 y página.
  [analysis-filters.js](../tests/browser/analysis-filters.js), HTTP/auth simulados:
  **cuatro grupos aprobados**, dos peticiones de análisis. Formulario inválido
  y edición no publican filtros ni piden resultados; submit gráfico conserva
  fechas/IDs y `period=month`; edición posterior no cambia el snapshot, que
  persiste al navegar a mapas; submit mapa reemplaza selecciones y conserva el
  contrato; logout vacía filtros. Cero excepciones y mensajes inesperados.
  Ocho avisos MUI conocidos de `period=0`. Intentos iniciales ajustaron solo
  localizadores de secciones de fecha y de selección con valor; no se cuentan
  como aprobados. El script final retira rutas/listeners en `finally`.
  Sin capturas: no se cambia la presentación visual, solo el nombre accesible.
- `git diff --check`: correcto al cierre. Sin cambios en package.json/lockfile.

**Documentación y reutilización.** Skills React/composición aplicadas al submit
explícito y a la separación de propietarios, sin efectos de sincronización ni
contextos nuevos. Lockfile reconfirmado: RTK **2.6.1**, React Redux **9.2.0**,
RHF **7.55.0**, React **19.3.1**. Context7 consultado sobre createSlice,
PayloadAction, selectors y reset: no ofrece RTK 2.6.1 exacta; documentación
[oficial general de createSlice](https://redux-toolkit.js.org/api/createSlice)
contrastada con tipos instalados, build y pruebas. Se reutilizan las verificaciones
de catálogos/opciones, autenticación, geocodificación, subdecomisos y carga diferida
de los pasos anteriores, cuyas implementaciones y escenarios no cambian. No se
repite la suite completa ni se acredita backend real o rendimiento medido.

**Conexión pendiente del paso 14.** Consumir `selectAppliedAnalysisFilters` en
mapas/gráficos, inicializar la edición RHF desde ese snapshot al entrar sin
sobrescribir borradores en recargas, extraer services y usar filtros aplicados en
las claves/argumentos de Query. Por ahora Redux conserva el snapshot al navegar,
pero los formularios mantienen sus defaults actuales y los resultados siguen
en los slices remotos antiguos. Los controles exclusivos necesitan sus propios
argumentos de consulta cuando afecten al endpoint, sin agregarlos al slice común.
Las fechas vacías indican contexto sin aplicar: no lanzar consultas de análisis
con esos defaults. Estas conexiones no se consideran implementadas aquí.
Continúan deuda de lint, aviso de bundle y default `period=0` de gráficos.
**Paso 13 cerrado; paso 14 pendiente y sin iniciar.**

### Paso 14 — Conectar mapas y gráficos (9 de noviembre de 2026)

Inicio en HEAD `3255bdf`, workspace limpio. Leídos AGENTS.md, plan y progreso;
ejecutado únicamente el prompt del paso 14. Sin cambios de dependencias ni del
plan. No se ejecuta la retirada global ni la revisión de rendimiento del paso 15.
Código y pruebas consolidados en `7cc1f79`; este registro se consolida en un
commit documental separado. Se reutilizan las comprobaciones anteriores, sin
cambios funcionales posteriores; `git diff --cached --check` se verifica antes
de cada commit.

**Cambios y decisiones.**

- Services por dominio en `map/services/mapService.ts` y
  `graph/services/graphService.ts`. Conservan Axios compartido/cookies, endpoints
  `confiscation/map`, `drugGraphIndex`, `weaponGraphIndex` y
  `ammunitionGraphIndex`, fechas, IDs sin conversión y arrays entre corchetes.
  Graph mantiene `period=month/year` y `typeGraph`. Devuelven datos tipados,
  propagan la causa y reciben la señal de Query. No se atribuye validación de
  respuestas a los genéricos de Axios.
- Consultas y claves centralizadas en `queries/` de cada módulo. Query es el
  propietario de resultados, carga y error; los hooks ya no leen ni escriben
  resultados Redux ni consumen thunks. Las claves incluyen el snapshot aplicado
  completo y, para gráficos, período, categoría y tipo enviado al endpoint.
  Reutilizan la política global del paso 6 (30 s de vigencia, 5 min de retención,
  sin reintento automático). Las señales llegan al transporte; cambiar argumentos
  o desmontar retira la lectura anterior, sin exclusividad global entre claves.
- Ambos hooks consumen `selectAppliedAnalysisFilters`. RHF toma esos defaults
  al montar; no hay reset por resultados, recarga u opciones. Solo Aplicar publica
  el snapshot validado. Navegar restaura fechas y selecciones aplicadas, sin
  conservar borradores descartados al desmontar. Fechas vacías no consultan;
  gráficos también espera selección en su categoría.
- Los controles exclusivos siguen locales. Mapa alterna ubicación/calor sin GET.
  El tipo visual de gráfico cambia inmediatamente sin GET; como `typeGraph`
  también pertenece al contrato HTTP, su valor enviado se captura con período y
  categoría solo al Aplicar. Defaults locales: mes, Drogas y barra; no inventan
  fechas ni IDs. El formulario y la consulta comparten esos defaults. Se retira
  el `period=0` ajeno a las opciones, eliminando su aviso MUI. Al volver a gráficos
  se reinician los controles exclusivos; el contexto común permanece en Redux.
- Estado accesible común de contexto sin aplicar, carga/recarga, error/reintento
  y vacío. Una recarga de la misma clave puede conservar sus datos; otra clave no
  muestra los resultados anteriores. Reintentar usa el snapshot, no el borrador.
  Se completan callbacks y tipos de datos de gráficos/tarjetas, retirando Function
  y any de esos consumidores, sin crear formularios universales ni contextos.
- MapComponent conserva React Leaflet como propietario de marcadores/mapa,
  usa claves de identificador e ignora coordenadas no finitas como la capa de
  calor. Icono estable y puntos derivados estables para evitar recrear la capa
  durante recargas sin cambio de datos. Se conserva el cleanup de HeatmapLayer:
  `removeLayer` invoca `onRemove` de leaflet.heat 0.2.0, que retira canvas y
  listeners `moveend`/`zoomanim`; contrastado con el código instalado. El recorrido
  verifica alternancia repetida y desmontaje/remontaje, sin acumulación de canvas
  ni excepciones. No se añaden listeners nuevos.
- Las mutaciones existentes del padre y los tres hijos invalidan también las
  dos familias de análisis tras éxito. Mantienen callbacks protegidos por sesión
  y comprobación después del await; un fallo no invalida. Esta conexión evita
  reutilizar análisis vigentes anteriores a una escritura.
- Slices, thunks, exports y registro Redux antiguos quedan conservados para su
  retirada coordinada en el paso 15, junto con sus pruebas de convivencia.
  Ningún consumidor de pantalla de mapas/gráficos los usa ni duplica resultados
  de Query allí. No se retira `createLatestListRequest` ni LegacyEntityList.

**Comprobaciones realizadas.**

- [analysis-query.test.mjs](../tests/analysis-query.test.mjs): contratos de los
  cuatro endpoints, señales y causas, claves completas, defaults deshabilitados,
  deduplicación/caché, argumentos rápidos/desmontaje y respuestas tardías en ambos
  dominios, error/reintento, invalidación tras éxito/fallo en las cuatro mutaciones
  y limpieza real del cliente de aplicación ante logout/acceso B con lecturas A.
- `node --test tests/analysis-query.test.mjs tests/analysis-filters.test.mjs
  tests/query-session.test.mjs tests/confiscation-save.test.mjs`:
  **59 aprobadas**, cero fallos/canceladas/omitidas.
  Log: `%TEMP%/graphdata-step14-tests-final.txt`. Dos primeros intentos terminaron
  los casos pero conservaron timers de GC del runner; se interrumpieron y se
  fijó retención infinita solo en los clientes de pruebas, como en las suites
  existentes. La ejecución final termina correctamente sin cambiar política app.
- Build final correcto, salida 0. Log:
  `%TEMP%/graphdata-step14-build-final.txt`. Persiste aviso de chunks >500 kB;
  restaurados los bytes iniciales de `tsconfig.app.tsbuildinfo`. Un intento previo
  detectó el índice requerido por Recharts: PieGraph pasa a alias de objeto
  compatible, sin any ni casts de datos, antes del build aprobado.
- Lint: **16 errores y 9 advertencias**, frente a 28/11 del paso 13. Comparación
  por archivo/regla/severidad/mensaje: cero diagnósticos nuevos; ninguno en archivos
  modificados. Log: `%TEMP%/graphdata-step14-lint-final.json`.
- Playwright MCP operativo, reutilizado servidor Vite 4175 (otro arranque confirmó
  puerto ocupado). [analysis-query.js](../tests/browser/analysis-query.js),
  HTTP/auth simulados: **cinco grupos aprobados**, seis lecturas de análisis y
  un 503 esperado. Defaults/borradores sin GET; Aplicar y parámetros exclusivos;
  vacío; recarga con controles aplicados sin sobrescribir RHF; fechas/IDs al
  navegar; fallo/reintento conservando selección pendiente; tres alternancias de
  calor/ubicación sin GET ni canvas acumulados; vuelta entre vistas y logout.
  Cero excepciones/mensajes inesperados y cero avisos MUI de período. Se excluye
  el aviso Canvas conocido. Los intentos iniciales ajustaron localizadores de
  selects con valor y codificación del script, sin contarlos como aprobados.
  Rutas/listeners retirados en finally. Sin capturas ni perfiles: recorrido de
  comportamiento sobre componentes existentes y estados MUI, sin rediseño visual.
- `git diff --check`: correcto. Sin cambios en package.json/lockfile.

**Documentación, reutilización y límites.** Skills React/composición aplicadas:
un propietario remoto, estado derivado y edición independiente. Lockfile:
React 19.3.1, Query 5.107.1, Axios 1.21.0, RHF 7.55.0, Recharts 3.3.0,
React Leaflet 5.0.0, Leaflet 1.9.4 y leaflet.heat 0.2.0.
Context7 consultado para claves, enabled y cancelación de Query; no ofrece
5.107.1 exacta, se contrasta documentación general con tipos instalados y pruebas.
Context7 sí cubre Leaflet **1.9.4 exacta**, consultado sobre removeLayer/onRemove.
Referencias oficiales:
[cancelación Query](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation),
[consultas deshabilitadas](https://tanstack.com/query/v5/docs/framework/react/guides/disabling-queries)
y [ciclo de capas Leaflet](https://leafletjs.com/reference-1.9.4.html#layer-onremove).

Se reutilizan comprobaciones históricas de autenticación, geocodificación,
catálogos/opciones, archivos/formularios compartidos y carga diferida, sin cambios
en sus implementaciones. Se repiten las pruebas de confiscaciones y sesión por
la nueva invalidación; no se repite toda la suite ni CRUD equivalentes. No se
acreditan backend real, persistencia, cookies ni rendimiento medido. Cancelar
transporte no revierte escrituras del servidor. Continúan deuda de lint y aviso
de bundle. La retirada de las implementaciones remotas antiguas y la adaptación
de sus pruebas quedan para el siguiente paso.
**Paso 14 cerrado; paso 15 pendiente y sin iniciar.**

### Paso 15 — Retirada y revisión de rendimiento (9 de noviembre de 2026)

Inicio en HEAD `01e1c97`, workspace limpio. Leídos AGENTS.md, plan y progreso;
ejecutado únicamente el prompt del paso 15. Sin cambios de dependencias ni del
plan. El paso 16 permanece pendiente: no se ejecuta el cierre general ni la
suite completa de ese paso. Código y pruebas consolidados en `fa24f3e`; este
registro y la guía se consolidan en un commit documental separado. Se reutilizan
las verificaciones anteriores, sin cambios funcionales posteriores;
`git diff --cached --check` se verifica antes de cada commit.

**Retirada y propietarios.** Búsqueda en aplicación, store y pruebas antes y
después de retirar las piezas; no quedan referencias ejecutables a las retiradas.

- Eliminados slices, acciones, thunks y barrels de mapas/gráficos antiguos y sus
  registros en el store. Los consumidores de pantalla ya estaban migrados en el
  paso 14; solo las pruebas de convivencia conservaban dependencias antiguas.
  Redux contiene exclusivamente `auth` y `analysisFilters`. Query conserva los
  resultados remotos, sin copias ni cambios en services, claves o invalidación.
- Retirados `LegacyEntityList`, `useEntityList`, su export y sus tipos de protocolo
  sin consumidores. `EntityList` controlado se conserva. Retirados los tipos de
  estado remoto antiguos de confiscaciones/subdecomisos y mapas/gráficos, tipos
  de los thunks retirados y tipos compartidos sin usos. Se mantienen entidades,
  formularios vigentes y `TableOptions`, utilizado por los services.
- Retirados `createLatestListRequest` y su prueba exclusiva de implementación,
  sin listados antiguos que los necesiten. La cobertura vigente de cancelación,
  argumentos rápidos, desmontaje, errores e invalidación reside en las pruebas
  Query por dominio; se ejecuta nuevamente la de análisis por la retirada.
- Adaptadas las pruebas de sesión y filtros a los propietarios vigentes. Se
  elimina el caso exclusivo de transporte de thunks remotos retirados y se
  conservan lecturas/escrituras Query tardías, limpieza de ambas cachés, señales,
  logout fallido, login/refresh concurrentes y bloqueo de dispatch tardío/anidado.
  Las fronteras prueban también las dos claves exactas de Redux y filtros no
  vacíos antes de su limpieza. El middleware conserva su comportamiento: auth
  necesita dispatch estable por sesión y protección de respuestas tardías.
- AGENTS.md registra la situación actual y distingue las reglas históricas de
  convivencia. No se cambian endpoints, cookies, parámetros, JSON/multipart,
  relaciones ni los contratos de los services.

**Medición y cambio acotado.** Build de producción antes y después con
`npm.cmd run build -- --manifest`. El manifiesto permite recorrer dependencias
estáticas del entry y su bootstrap, excluyendo las rutas dinámicas. Medición
de bytes reales y suma de gzip por archivo con Node; no son bytes transferidos
por un servidor ni un benchmark de tiempos.

| Recursos del arranque/login | Antes (bytes / gzip) | Después (bytes / gzip) |
| --- | --- | --- |
| JavaScript | 698.444 / 221.387 | 697.656 / 221.212 |
| CSS | 15.134 / 6.378 | 40 / 48 |

El CSS de Leaflet se importaba en bootstrap para todas las rutas. Ahora se
importa en MapComponent y ConfiscationMap, bajo sus rutas diferidas; Vite lo
extrae una sola vez como CSS compartido del chunk TileLayer y espera sus estilos
antes de evaluar el chunk. Se difieren 15.094 bytes de CSS del arranque. No se
añade memoización, configuración manual de chunks ni cambio de dependencias.

[audit-bundle.mjs](../scripts/audit-bundle.mjs), ejecutado después del build con
manifiesto, conserva la medición y falla si Recharts, Leaflet, DataGrid o el CSS
Leaflet entran en las dependencias iniciales. Localiza las librerías mediante
marcadores de su salida: si cambian, exige revisar los marcadores. Sus chunks
actuales (bytes / gzip) son: gráficos `components` 310.274 / 87.888, Leaflet
`TileLayer` 153.561 / 44.812 y compartido `GraphLayout` con DataGrid
655.949 / 190.758; todos diferidos respecto al login. Estos tamaños incluyen
otros módulos del chunk y no equivalen al tamaño individual de cada librería.
El compartido grande sigue siendo deuda, y DataGrid comparte chunk con layout;
no se atribuye una mejora de ejecución a retirar código ni al reparto de chunks.

Chrome DevTools MCP operativo: perfil de navegación al login de producción en
preview 4176, CPU 1x, sin limitación de red ni forzar caché fría, refresh simulado como fallo de
transporte mediante initScript (no se consulta el backend). Muestra local única:
**LCP 2.271 ms**, TTFB 20 ms, retraso de render 2.251 ms y **CLS 0,00**.
Sin datos de campo ni INP, sin comparación temporal antes/después ni perfil React
de las vistas autenticadas. No sustenta optimizaciones de renders. La producción
no carga React DevTools. Se pudo analizar la traza en memoria; guardar el archivo
fue rechazado por los workspace roots configurados del MCP. No se acredita un
archivo de traza exportado.

**Comprobaciones realizadas.**

- `node --test tests/query-session.test.mjs tests/analysis-filters.test.mjs
  tests/analysis-query.test.mjs tests/auth.test.mjs`: **28 aprobadas**, cero
  fallos/canceladas/omitidas. Contratos HTTP de análisis/auth, caché, cancelación,
  mutaciones e invalidación, filtros y sesión. Log:
  `%TEMP%/graphdata-step15-tests.txt`.
- Build inicial y final correctos, salida 0; persiste aviso de chunks >500 kB.
  Logs `%TEMP%/graphdata-step15-build-before.txt` y
  `%TEMP%/graphdata-step15-build-final.txt`. Restaurados los bytes iniciales de
  `tsconfig.app.tsbuildinfo` después de los builds.
- Lint: **10 errores y 9 advertencias** previos, frente a 16/9 del paso 14.
  Comparación por archivo/regla/severidad/mensaje: cero diagnósticos nuevos.
  Persisten diagnósticos anteriores en `confiscation/types.ts` fuera de los tipos
  retirados. Log `%TEMP%/graphdata-step15-lint.json`.
- `node scripts/audit-bundle.mjs`: correcto, sin librerías pesadas ni CSS Leaflet
  en el arranque. Informes locales `%TEMP%/graphdata-step15-bundle-before.json`,
  `%TEMP%/graphdata-step15-bundle-final.json` y manifiesto inicial
  `%TEMP%/graphdata-step15-manifest-before.json`.
- Playwright MCP operativo. Preview de producción 4176 creado y detenido en este paso;
  servidor de desarrollo existente en 4175 reutilizado para los otros recorridos.
  HTTP y autenticación simulados en los tres scripts:
  [lazy-routes.js](../tests/browser/lazy-routes.js), **seis grupos**: login sin
  chunks protegidos ni CSS Leaflet, indicador accesible, usuarios sin mapas,
  navegación a gráficos/mapas, atrás y entrada directa en confiscaciones. CSS
  disponible y panes posicionados al abrir el mapa del formulario. Cero
  excepciones/mensajes inesperados; 401 de refresh esperado. Captura
  `.playwright-mcp/step15-map-css.png` inspeccionada: mapa de 500×400, controles,
  atribución y regreso al formulario visibles, sin recortes. Dos intentos previos
  ajustaron esperas del recorrido (cambio de ruta y animación Zoom), sin cambios
  funcionales y sin contarlos como aprobados.
- [analysis-query.js](../tests/browser/analysis-query.js): **cinco grupos**, siete
  lecturas de análisis y 503 esperado; filtros, recarga/error/reintento, borradores,
  navegación, alternancia y desmontaje de capas. Cero excepciones/mensajes
  inesperados y cero avisos MUI de período; excluido aviso Canvas conocido.
- [query-session.js](../tests/browser/query-session.js): **cuatro grupos**, ocho
  peticiones y un fallo HTTP esperado; logout fallido conserva sesión, salida
  limpia filtros y cachés sin dominios remotos en Redux, acceso B protegido frente
  a respuesta tardía A. Cero excepciones/mensajes inesperados. Adaptadas sus
  aserciones de limpieza al estado actual. Scripts liberan rutas/listeners y
  respuestas pendientes en finally.
- `git diff --check`: correcto al cierre. Sin cambios en package.json/lockfile.
  La normalización final de saltos de línea no cambia los escenarios verificados.

**Documentación, reutilización y límites.** Skills React/composición aplicadas:
propietario único y retirada de compatibilidad, imports pesados bajo rutas
diferidas, sin memoización generalizada. Versiones del lockfile reconfirmadas:
React 19.3.1, Vite 8.3.5, RTK 2.6.1, Query 5.107.1 y Leaflet 1.9.4.
Context7 cubre React 19.3.1 (fixtures) y Vite 8.3.5 exactos; contrastadas además
las reglas públicas de lazy con documentación React oficial general. Referencias:
[React lazy](https://react.dev/reference/react/lazy),
[CSS diferido en Vite 8.3.5](https://github.com/vitejs/vite/blob/v8.3.5/docs/guide/features.md#css-code-splitting)
y [manifiesto](https://github.com/vitejs/vite/blob/v8.3.5/docs/guide/backend-integration.md).

Se reutilizan los contratos y escenarios vigentes de catálogos/opciones,
geocodificación, archivos, componentes compartidos y CRUD padre/hijos; no cambian
sus implementaciones HTTP ni de formularios. La reubicación de CSS se verifica
en producción y las fronteras globales se vuelven a probar por la retirada del
store. No se repite toda la suite ni cada CRUD equivalente. No se acreditan
persistencia, cookies ni escrituras contra el backend real; abortar transporte
no revierte escrituras del servidor. Pendientes: deuda de lint, chunk compartido
grande, perfil representativo de vistas autenticadas si se desea optimizarlas y
cierre de integración del paso 16. **Paso 15 cerrado; paso 16 sin iniciar.**

### Paso 16 — Cierre de integración (9 de noviembre de 2026)

Inicio en HEAD `4a3d274`, workspace limpio. Leídos AGENTS.md, plan y progreso;
ejecutado únicamente el prompt del paso 16. No se requieren cambios de aplicación,
pruebas, dependencias ni alcance del plan: la adaptación de pruebas retiradas
quedó completada en los pasos anteriores y la suite actual conserva sus garantías.
Solo se actualiza este documento. No se crea un commit ni se inicia otro trabajo.

**Contraste de arquitectura y contratos.**

- Store/reducer raíz con exactamente `auth` y `analysisFilters`; sin resultados
  remotos ni archivos en Redux. El filtro aplicado contiene fechas y arrays de
  IDs serializables; RHF conserva el borrador hasta Aplicar. La sesión no se copia
  en Query ni en `sessionScope`, que solo conserva su ciclo de vida.
- Consultas por dominio llaman directamente a services, pasando `signal`;
  claves de listas con sus argumentos, sublistas con padre, opciones separadas
  y análisis con snapshot aplicado/controles que afectan la respuesta. Las
  opciones se derivan de Query y sus services recorren el catálogo paginado.
  El cliente único/proveedor y su política explícita del paso 6 se conservan.
- Acceso HTTP del backend en services, mediante Axios compartido con cookies y
  rechazo del cuerpo HTTP; geocodificación externa separada. Solo auth conserva
  thunks. Los services no importan React/Redux/Query ni administran efectos de UI.
- Mutaciones con `sessionMutationOptions`, invalidación tras éxito y comprobación
  de sesión después de esperar recargas antes de cerrar/navegar. Se conserva la
  invalidación de análisis por escrituras de confiscaciones/hijos y la retirada
  de consultas hijas al borrar un padre. Las fronteras cancelan/limpian Query y
  filtros, con dispatch de auth ligado a sesión. Limpiar caché no revierte una
  escritura que el servidor haya aceptado.
- Listas controladas con página/orden/filtros en el consumidor; formularios en
  RHF, selección y diálogos locales. Las instantáneas de edición y claves por
  padre evitan sobrescribir borradores durante recargas. Las referencias a claves
  de respaldo de listas no almacenan otra copia de resultados remotos.
- Búsqueda en `src` y `tests`: sin consumidores de `LegacyEntityList`,
  `useEntityList`, `createLatestListRequest` ni slices remotos retirados. Los
  únicos slices/thunks presentes corresponden a los propietarios vigentes.
  No se reintroduce compatibilidad ni se cambian endpoints, relaciones o payloads.

**Comprobaciones nuevas.**

- `npm.cmd test`: **208 aprobadas**, cero fallos/canceladas/omitidas/todo; salida 0.
  Incluye contratos HTTP, JSON/multipart, errores, imágenes, validación y
  geocodificación; claves/caché/concurrencia/invalidación y aislamiento de sesión;
  transiciones de autenticación/filtros. Log `%TEMP%/graphdata-step16-tests.txt`.
- `npm.cmd run lint -- --format json --output-file ...`: salida 1 por **10 errores
  y 9 advertencias** previos. Comparación por archivo/regla/severidad/mensaje con
  `%TEMP%/graphdata-step15-lint.json`: **cero diagnósticos nuevos**. Informe actual:
  `%TEMP%/graphdata-step16-lint.json`. No se presenta lint como aprobado.
- `npm.cmd run build -- --manifest`: correcto, salida 0; persiste aviso de chunks
  >500 kB. Log `%TEMP%/graphdata-step16-build.txt`. Restaurados los bytes iniciales
  de `tsconfig.app.tsbuildinfo` tras el build, sin cambios incidentales.
- `node scripts/audit-bundle.mjs`: correcto. Recharts, Leaflet, DataGrid y CSS de
  Leaflet permanecen fuera del arranque. JS inicial 697.656 bytes / gzip 221.212;
  CSS inicial 40 / gzip 48, iguales al paso 15. Es comprobación del bundle, no
  nueva medición temporal ni perfil de renders.
- Playwright MCP comprobado operativo; página existente y Vite 4175 reutilizados.
  [catalog-options-consumers.js](../tests/browser/catalog-options-consumers.js):
  **cuatro grupos aprobados**, 22 lecturas y dos errores HTTP simulados esperados;
  cero excepciones, mensajes inesperados o avisos MUI de selección. Verifica
  recuperación de catálogo paginado en gráficos, caché compartida al ir al mapa
  sin GET adicionales, cantidad preservada ante fallo/reintento de presentaciones
  y opciones completas en los tres subformularios. Su última ejecución documentada
  era del paso 11, anterior a los cambios de consumidores de los pasos 12/14;
  esta ejecución cubre esa integración con el código final. Rutas y listeners
  retirados en `finally`; sin respuestas retenidas. Sin capturas: no hay cambios
  visuales y el recorrido comprueba comportamiento con aserciones.
- `git diff --check`: correcto. Aplicación, pruebas y package.json/lockfile sin
  cambios durante el cierre.

**Reutilización y documentación.** Se reutilizan como evidencia histórica, sin
contarlos como ejecuciones nuevas, los recorridos del paso 15 de carga diferida
en producción/CSS de mapas, análisis/navegación y logout/acceso B; los del paso
12 de detalle/sublistas, borradores, archivos y guardado; y los de autenticación,
CRUD representativos, controles comunes y geocodificación. Contrastados los
cambios posteriores: las invalidaciones añadidas en el paso 14 tienen cobertura
automatizada ejecutada de nuevo; el CSS y la retirada del paso 15 ya cuentan con
regresión de navegador final. No se repiten baterías equivalentes sin cambios.

Skills React/composición aplicadas a la revisión de propietarios, estado derivado
y edición independiente, sin añadir contextos o memoización. Versiones del
lockfile reconfirmadas: React 19.3.1, Query 5.107.1, RTK 2.6.1, Vite 8.3.5,
Axios 1.21.0 y RHF 7.55.0. Context7 operativo, consultado sobre claves, cancelación
y limpieza de Query; no ofrece 5.107.1 exacta. Documentación general contrastada
con código instalado y suite completa; se conserva esa limitación. Referencias:
[claves](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys),
[cancelación](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation)
y [QueryClient](https://tanstack.com/query/v5/docs/reference/QueryClient).

**Límites y pendientes fuera del cierre.** Las pruebas HTTP y autenticación del
recorrido son simuladas; no se acreditan persistencia, cookies, permisos efectivos,
relaciones ni escrituras contra un backend real. Queda validarlos con ese entorno.
Persisten los 10 errores/9 advertencias de lint inventariados y el chunk compartido
grande (GraphLayout/DataGrid); cualquier optimización posterior requiere medición
representativa de vistas autenticadas. No se amplían aquí formularios por pasos,
lotes o exportaciones. **Paso 16 cerrado; los 16 pasos del plan están completados
dentro de su alcance, con la deuda y las limitaciones anteriores explícitas.**

### Mantenimiento posterior — lint y rendimiento (9 de noviembre de 2026)

Solicitud posterior al cierre de los 16 pasos. Se guarda primero el cierre del
paso 16 en **`97a1d0a`** y se corrigen lint/rendimiento, sin iniciar otro paso ni
ampliar el alcance de la migración. La validación con backend real se aplaza por
la prioridad indicada por el usuario, aunque informa que su servidor está activo.

- Lint pasa de 10 errores/9 advertencias a **cero**, con reglas intactas: callbacks
  y props RHF tipados, índices sin JSX en `.ts`, contexto del tema separado del
  proveedor, expresión inútil/condicional constante retiradas y fixture tipado.
- Perfil React operativo sobre usuarios con diez filas simuladas: tres cambios
  de tema reemplazaban tres veces DrawerHeader; al mover styled fuera del render
  se conservan sus nodos. No se demuestra una mejora de duración de render.
- Imports directos de controles en FormMap/FormGraph separan DataGrid de ambas
  rutas. JS adicional: gráficos **976.485 → 597.025 bytes** (gzip 284.103 → 175.156),
  mapas **831.897 → 447.780** (gzip 245.301 → 134.399). Arranque prácticamente igual;
  CSS inicial sin cambios. Build final sin aviso de chunks >500 kB.
- Auditoría del bundle ampliada para impedir DataGrid en las dos vistas; nuevo
  recorrido de producción comprueba descargas y conservación de nodos/formulario.
- Suite final **208 aprobadas**, lint con `--max-warnings 0` y build correctos;
  diff sin errores. Playwright: auth **2 grupos**, guardado padre/hijos **7**,
  rutas/CSS diferidos **6** y análisis/bundle **4**; sin excepciones ni mensajes
  inesperados. HTTP/auth simulados, sin acreditar persistencia/cookies reales.
- Sin cambios de dependencias, servicios, endpoints o payloads. Comprobaciones
  anteriores no afectadas conservadas; sin nueva optimización especulativa.

Método, mediciones antes/después, archivos, logs, incidencias, documentación
consultada y límites en [el informe de lint y rendimiento](verification-lint-performance-2026-11-09.md).
Queda la validación contra backend real y, si se requieren más mejoras, mediciones
representativas de datos/dispositivos. La deuda de lint y el chunk de 655 kB ya
no son pendientes actuales; se conservan en los registros históricos de cada paso.

### Verificación posterior — backend real (10 de noviembre de 2026)

Solicitud de comprobar el backend activo, con frontend en **5174** porque
5173 pertenece a un servicio del backend. Vite queda levantado en
`http://localhost:5174`, contra `http://localhost/api`; CORS permite ese origen.
No se cambian aplicación, dependencias ni configuración del backend.

- Playwright MCP con HTTP real, sin interceptaciones: login, cookie HttpOnly,
  recarga de sesión, logout y rechazo 401 posterior; login incorrecto conserva
  campos. Contexto independiente sin cookies rechaza lecturas/escrituras.
- Nueve listados y siete catálogos completos; página/orden/filtro de drogas;
  CRUD JSON de padre y multipart de los tres hijos, relaciones, imágenes
  conservadas al editar, mapa/gráficos con fixtures persistidos. Recorrido de
  services espaciado: 24 grupos aprobados. UI de drogas: cuatro grupos aprobados,
  fallo confirmado de visualización de imagen. Registro inválido rechazado 422.
- Hallazgos: falta `VITE_LOCAL_PHOTOS_URL`; las tres sublistas vacías omiten
  metadatos paginados; IDs reales numéricos frente a varios tipos `string`.
  No se consideran corregidos. Autorización por roles y entrega pública de
  archivos siguen pendientes de comprobación completa.
- Límite real 60 solicitudes/minuto: un intento recibió 429, repetido con
  peticiones espaciadas y sin reintento de escrituras. Los fixtures se eliminaron;
  consultas finales sin temporales y totales originales conservados. Auditoría
  real no eliminada; no se verifica limpieza física de archivos del servidor.
- Suite automatizada al inicio: **208 aprobadas**. Lint con cero advertencias,
  build y diff correctos. Solo se incorporan dos recorridos manuales reales y
  documentación. Sin avance de otro paso ni certificación global del backend.

Resultados, límites, incidencias y recorridos reproducibles en
[verificación con backend real](verification-backend-real-2026-11-10.md).
Las menciones anteriores a backend pendiente se conservan como registro
histórico; este informe concreta lo comprobado y lo todavía abierto.

### Aprovisionamiento y comprobación de roles/permisos (10 de noviembre de 2026)

Solicitud explícita de verificar autorización y crear los roles/permisos para
el frontend en el backend activo. Se conservan todos los cambios de la tarea
anterior y el frontend en 5174. Sin modificación del código de aplicación.

- Creados por API **48 permisos** (IDs 26–73) y **tres roles**:
  `administrador` (5, 48 permisos), `operador` (6, 23) y
  `analista` (7, 11). Relaciones confirmadas con nueva consulta.
  Los 25 permisos/cuatro roles previos se conservan; no se asignan roles nuevos
  a usuarios existentes. Lista y matriz en
  [roles y permisos del frontend](frontend-roles-permissions.md), con
  [manifest por nombre/ID](frontend-access-control.json).
- Usuario temporal y cinco contextos independientes: sin rol, analista, operador,
  administrador y permiso directo. Login/refresh reflejan las asignaciones
  en los cinco casos. **Autorización no aprobada:** 22 de 35 comprobaciones
  esperaban 403 y recibieron 200. Incluso sin roles/permisos se consultan
  usuarios/permisos/actividad y se crean permisos y decomisos.
- Frontend sin rol abre `/user`, muestra datos y botón de creación. No hay
  guards por permiso en las piezas revisadas. Crear el catálogo no activa
  autorización: quedan pendientes middleware/policies backend y su consumo
  en rutas/menú/acciones frontend. Backend no disponible como código en este
  workspace. No se declara implementada la política.
- Eliminados usuario temporal, cinco permisos y cinco decomisos de prueba;
  consultas finales con cero temporales. Quedan 73 permisos y siete roles.
  Auditoría real conservada. Peticiones espaciadas, sin 429 en la matriz.
- Lint, sintaxis de recorridos y diff correctos. Se reutilizan suite 208/build
  anteriores por aplicación/dependencias sin cambios; no son ejecuciones nuevas.

Método, respuestas observadas, límites y siguientes comprobaciones en el
[informe de autorización](verification-access-control-2026-11-10.md). Se completa
la creación y la auditoría solicitadas, sin avanzar otro paso del plan ni
confundir registros de permisos con restricciones efectivas.

### Convención de nombres de acceso y actualización de backend (10 de noviembre de 2026)

Por solicitud del usuario, roles `administrador`, `operador` y `analista`, y
permisos `<dominio>.<acción>`, sin prefijo de aplicación. Se actualizan catálogo
Markdown/JSON, asociaciones, informes, nombres de perfiles del resultado
histórico y los dos recorridos de aprovisionamiento/verificación. Nombres de
archivo, IDs y relaciones se conservan. El manifest deja de declarar un namespace.

El usuario informa de la misma renominación en el backend y de la autorización
por acción implementada en controladores Laravel. Se registra como cambio
reportado, pendiente de nueva ejecución de la matriz. Los resultados HTTP
anteriores mantienen sus valores y se marcan como históricos; sus nombres se
normalizan a la convención actual. Sigue pendiente la integración de permisos
en rutas/menú/acciones del frontend.

El recorrido manual deja de esperar una fila visible sin permisos: espera la
respuesta del listado y registra su estado, permitiendo continuar la matriz
cuando el backend devuelve 403. No se ejecutan escrituras ni nuevos recorridos
contra el backend en esta tarea de renominación.

Comprobaciones: JSON válido, 48 permisos únicos, tres roles y asociaciones por
nombre/ID coherentes, 35 comprobaciones históricas conservadas; búsqueda sin
nombres de acceso con el prefijo anterior; sintaxis Node de ambos recorridos,
lint con cero advertencias, build y diff correctos. Restaurado el artefacto
generado de TypeScript. Se conserva la suite previa de 208 pruebas, sin contarla
como ejecución nueva. No hay cambios en aplicación ni dependencias.

Documentación actualizada en [roles y permisos](frontend-roles-permissions.md)
y [el informe de autorización](verification-access-control-2026-11-10.md).

### Preparación de prompts de portafolio (10 de noviembre de 2026)

Solicitud de ejecutar los pendientes en chats separados y mantener continuidad
documental. Se crea [portfolio-plan.md](portfolio-plan.md) con 15 tareas
principales y dos ampliaciones opcionales, cada una con prompt autocontenido,
alcance y validación. [portfolio-progress.md](portfolio-progress.md) conserva el
estado inicial, dependencias, contexto y reglas de actualización.

Cada ejecución actualizará ese progreso, el informe del tema y una entrada
breve aquí. Se conserva la migración de 16 pasos cerrada; no se ejecutó ninguno
de los nuevos prompts, ni se hicieron cambios de aplicación/backend, llamadas
de prueba o despliegues. Comprobados códigos, bloques, enlaces locales y diff.

### Prioridades y acceso de demo intencional (10 de noviembre de 2026)

Se explicitan las prioridades en portfolio-progress.md y se añaden los seis
pendientes medios al informe de autorización, enlazados a sus prompts.
El usuario confirma que el acceso precargado del login es intencional para
la demo en producción: se excluye su retirada/sustitución de los pendientes.
P12 pasa a datos y recorrido de demo, conservando cuenta, credenciales y
asignaciones existentes. Se mantiene la numeración de los 17 prompts.
Comprobación documental de códigos, enlaces y diff; sin cambios de aplicación
ni ejecución de tareas funcionales.

### P01 — Revalidación de autorización Laravel (10 de noviembre de 2026)

Ejecutado únicamente P01 del plan de portafolio, conservando el workspace.
Recorrido adaptado con preflight de permisos, IDs actuales resueltos por nombre,
contextos aislados, objetivos propios de edición/borrado y limpieza en `finally`.
No se modifican usuarios existentes, sus asignaciones, catálogo ni aplicación.

- Matriz real en dos lotes: **92/92 + 94/94 = 186/186**, con respuestas
  200/401/403 esperadas según los permisos actuales. Incluye seis perfiles,
  login/refresh, lecturas/análisis y escrituras representativas JSON/multipart,
  `_method=PUT` y relaciones. **39 fixtures eliminados**; seis comprobaciones
  independientes finales aprobadas, con cero registros por prefijo en cinco
  dominios y refresh anónimo 401.
- Hallazgo: operador tiene 27 permisos frente a la propuesta de 23, con
  altas/ediciones de catálogos y sin borrados de decomisos/hijos. Administrador
  conserva 73 permisos y analista 11. Se documentan diferencias sin cambiar
  asociaciones. Confirmar intención de operador antes de P04.
- Un intento sin dividir excedió 300 s de MCP y no aporta aserciones contadas;
  se verificó limpieza y se repitió por lotes con informe recuperable. Sin 429
  en los lotes informados, sin reintentos de escrituras. Auditoría preservada;
  eliminación física de medios no verificada.
- Sintaxis Node, lint con cero advertencias y build correctos; artefacto generado
  de TypeScript restaurado. Se reutilizan las 208 pruebas previas, sin contarlas
  como nueva ejecución. Sin cambios React/dependencias, guards ni otra tarea.

Resultados separados de la historia en el
[informe de autorización](verification-access-control-2026-11-10.md) y su
[JSON P01](verification-access-control-p01-results-2026-11-10.json).
Estado central en [portfolio-progress.md](portfolio-progress.md). P02 disponible,
sin ejecutar; las demás tareas mantienen su alcance y estado.

Al terminar cada paso, actualizar su fila y añadir una entrada con:
fecha, alcance, archivos/commits si existen, contratos conservados, decisiones,
pruebas y resultados reales, navegador utilizado y motivo (o por qué no fue
necesario), límites, pendientes y siguiente paso. No copiar logs completos ni
considerar una verificación histórica equivalente a una ejecución nueva.

### P02 — Contratos de identificadores (11 de noviembre de 2026)

Solo P02 del portafolio: IDs numéricos confirmados en respuestas reales/OpenAPI,
DTO/entidades/relaciones/formularios/opciones alineados, sesión por nombres y
actividad con usuario nullable. Validación de IDs en services; conversión URL
explícita con parseRouteId en consumidores de useParams, antes de Query/HTTP.
Claves de detalle/padre, filtros e invalidaciones usan números; sin casts ni
uniones especulativas. Exportaciones types.ts y transporte HTTP conservados.

213/213 pruebas Node, lint sin advertencias, build y diff correctos. Playwright
MCP real: seis grupos aprobados (selecciones, navegación detalle/edición, alias
con una clave y ruta inválida sin HTTP); cero excepciones de página. Recorrido
solo de lectura, sin fixtures ni cambios de asignación. Scripts históricos
adaptados sin declarar una batería completa nueva. Artefacto TypeScript restaurado.

Contratos, archivos, Context7/fallback oficial y límites en
[el informe P02](verification-identifiers-p02-2026-11-11.md); estado central en
[portfolio-progress.md](portfolio-progress.md). No se reabren los 16 pasos ni se
avanza P03; imágenes, paginación y permisos visuales conservan sus pendientes.

Consolidación posterior solicitada: `f0ff9f8` registra auditorías reales previas;
`cd226a0` implementa P02 con sus pruebas. Documentación consolidada por separado,
sin cambios adicionales de código ni repetición de las comprobaciones vigentes.
Sin push ni despliegue.

### P03 — Presentación de acceso denegado (11 de noviembre de 2026)

Solo P03 del portafolio. Presentación accesible reutilizable y manejo de errores
en listados/detalle/análisis/opciones, con reintento manual y logout siempre
disponible sin elegir otra vista que pueda estar prohibida. Clasificación de
401/403/transporte/5xx con cuerpos reales contrastados. Interceptor conserva
identidad/body, validación y causa mediante metadatos privados. Un 403 de
operación o refresh inicial no cierra sesión ni genera renovación/redirección;
el router permite recuperar el arranque. Campos, archivo y diálogos se conservan
ante escrituras rechazadas. Sin matriz de guards/menú/acciones de P04.

217/217 pruebas Node, lint sin advertencias, build, sintaxis de recorridos y diff
correctos; artefacto TypeScript restaurado. Playwright MCP: tres grupos reales
(401/403, usuario sin permisos, teclado/logout) y cinco simulados (errores,
rechazo/recuperación de lectura/alta/borrado y refresh inicial). Un usuario
temporal creado/eliminado, sin cambios de asignaciones existentes; captura
inspeccionada, contextos cerrados y cero excepciones de página. No se repite
la matriz P01 ni se acredita una auditoría completa de accesibilidad.

Contratos, decisiones, fuentes y límites en el
[informe de autorización](verification-access-control-2026-11-10.md#p03--presentación-de-rechazos-11-de-noviembre-de-2026);
estado central en [portfolio-progress.md](portfolio-progress.md#p03--acceso-denegado-y-errores-11-de-noviembre-de-2026).
Siguiente P04 sin ejecutar; política del operador y P05 pendientes. Sin nuevas
dependencias, backend, commits o despliegues. Los 16 pasos siguen cerrados.

Consolidación solicitada (12 de noviembre de 2026): `e45e8c7` contiene código y
pruebas de P03. Informe y progresos consolidados por separado. Se reutilizan las
217 pruebas, lint, build y recorridos aprobados sin cambios de código; diff
revisado. Sin push ni despliegue, sin avanzar P04/P05.
