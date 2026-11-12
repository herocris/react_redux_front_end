# Progreso de preparación para portafolio

## Estado al 12 de noviembre de 2026

**P01–P10 ejecutados. P06 conserva un contrato backend pendiente; P07 verifica medios locales con límites de servidor y limpieza física. P05 aporta integración selectiva a P04; quedan sus perfiles/dependencias reales no recorridos y el ajuste Laravel anónimo sin Accept JSON. P08 verifica recuperación de render/lazy con simulación sobre build local. P09 verifica navegación desconocida y P10 identidad/panel con simulación local; P11 y posteriores siguen sin ejecutar.** La preparación del
plan no ejecutó por sí misma ninguna tarea.
Fuente: [portfolio-plan.md](portfolio-plan.md). Se conserva la refactorización
cerrada en [refactor-progress.md](refactor-progress.md).

| Código | Prioridad | Tarea | Estado | Dependencias o referencia |
| --- | --- | --- | --- | --- |
| P01 | Alta | Revalidar autorización backend | Completado con hallazgo de política | 186/186 según permisos actuales; operador difiere de la propuesta |
| P02 | Alta | Tipos de identificador | Completado | Respuestas/OpenAPI, IDs numéricos y frontera URL verificados; informe P02 |
| P03 | Media | Acceso denegado y tipos de error | Completado | Cuerpos reales 401/403, presentación reutilizable y recuperación verificados |
| P04 | Alta | Permisos en rutas, menú y acciones | Implementado y verificado con simulación; integración real selectiva nueva en P05 | Drogas/permisos con sesión temporal; resto de perfiles/dependencias reales sin repetir |
| P05 | Alta | Revocación durante sesión abierta | Completado | Política viva, 231 pruebas, 11 grupos simulados, 6 reales y regresión P03; ajuste Laravel anónimo documentado |
| P06 | Alta | Paginación de sublistas vacías | Implementado con adaptación limitada; contrato backend pendiente | Vacío inicial acreditado; fuera de rango conserva total; informe P06 |
| P07 | Alta | Configuración y renderizado de imágenes | Completado en local con límites documentados | Base confirmada y 200; conservación/reemplazo/fallback verificados; limpieza física no acreditada |
| P08 | Media | Recuperación de errores de render/lazy | Completado con escenarios controlados | Frontera de vistas, recuperación explícita y carga diferida verificadas; informe P08 |
| P09 | Media | Página no encontrada | Completado con comprobaciones locales | Comodines, permisos, recuperación e HTTP SPA documentados; hosting público pendiente de P14 |
| P10 | Alta | Identidad y dashboard de producto | Completado con comprobaciones locales | Decomisos, panel autorizado sin métricas ficticias, español y capturas; informe P10 |
| P11 | Media | Móvil, aspecto y accesibilidad | Pendiente | Preferible después de P03–P10 |
| P12 | Alta | Datos y recorrido de demo | Pendiente | Conservar acceso precargado intencional; permisos verificados y P04 |
| P13 | Media | Tests/lint/build en CI | Pendiente | Workflow existente |
| P14 | Media | Comprobar despliegue público | Pendiente | URL real; preferible tras P07/P12/P13 |
| P15 | Alta | README de portafolio | Pendiente | Reflejar resultados de las tareas anteriores |
| O01 | Opcional | E2E repetible | Sin iniciar | Solicitud explícita del usuario |
| O02 | Opcional | Flujos reales adicionales | Sin iniciar | Solicitud explícita del usuario |

P01–P15 cubren conjuntamente las listas de la evaluación inicial y los pendientes
posteriores, evitando duplicar demo/acceso, autorización y comprobación real.
Una dependencia no autoriza ejecutar otra tarea completa en el mismo chat.

**Decisión del usuario:** el acceso precargado del login es intencional para
que los visitantes entren a la demo en producción. Se excluye de los pendientes
la propuesta de retirarlo o sustituirlo. P12 conserva esa decisión y se limita
a preparar datos ficticios y documentar el recorrido existente.

## Contexto reutilizable y límites

- Migración de los 16 pasos cerrada. Redux conserva sesión/filtros y Query los
  datos remotos. Lint y build pasan; las 208 pruebas de la última suite siguen
  como referencia histórica, no como una nueva ejecución en cada chat.
- Se verificaron realmente sesión local, cookies, persistencia y CRUD
  representativo. No está pendiente verificar todo desde cero.
- Roles actuales: `administrador`, `operador`, `analista`; permisos sin prefijo
  de aplicación. Catálogo y asociaciones en
  [frontend-roles-permissions.md](frontend-roles-permissions.md) y su JSON.
- P01 repitió la matriz tras los cambios Laravel: 186/186 comprobaciones según
  asignaciones actuales. Los 22 accesos indebidos de la matriz anterior quedan
  como historia. Operador tiene 27 permisos frente a los 23 propuestos;
  P04 respeta los permisos efectivos sin modificar asociaciones por deducción;
  la intención de la política de roles sigue siendo decisión del backend.
- Pendientes confirmados en la revisión previa: variable de imágenes ausente,
  metadatos omitidos en sublistas vacías, tipos string frente a IDs numéricos.
  P02 resuelve la discrepancia de IDs con evidencia actual y OpenAPI; P06 adapta
  solo el vacío inicial y mantiene pendiente el contrato backend. P07 configura
  y verifica las imágenes locales; limpieza física y entrega de producción sin acreditar.
- P04 integra permisos efectivos en rutas/menú/acciones. P05 implementa renovación
  en vivo y verifica integración real selectiva con la cuenta temporal. Actualmente
  el refresh anónimo JSON devuelve 401; sin Accept JSON se reproduce el 500 por
  redirección a `login` ausente. Ver evidencia nueva y límites en autorización.
- Entorno usado: API localhost/api, frontend 5174 y puerto 5173 reservado al
  backend. Comprobar disponibilidad y configuración en cada chat.

## Registro de esta preparación

Se añadieron el plan con **15 prompts principales y dos opcionales** y este
registro. Se enlazaron desde el plan/progreso anterior. No se ejecutaron
aplicación, pruebas, llamadas backend, instalaciones ni despliegues. Validación
documental: códigos, bloques de prompts, referencias relativas y diff.

## Cómo registrar cada ejecución

Actualización del 10 de noviembre: se explicitan prioridades y se conserva el
acceso de demo por petición del usuario. También se enlazan los pendientes
medios desde el informe de autorización. Cambio documental; comprobados enlaces,
coherencia de códigos y diff. Ninguna tarea funcional ejecutada.

Actualizar la fila correspondiente y añadir una entrada fechada con:

- Código, alcance real y archivos afectados; decisiones y contratos preservados.
- Comprobaciones ejecutadas y resultado exacto; indicar simulación/backend real.
- Evidencia reutilizada y motivo por el que sigue vigente.
- Pendientes y bloqueos concretos; no marcar completado si falta un criterio.
- Documento/informe actualizado y siguiente tarea disponible, sin ejecutarla.

Añadir además un resumen breve con enlace en docs/refactor-progress.md para que
los chats que empiezan leyendo AGENTS.md encuentren este plan.

## P01 — Revalidación del 10 de noviembre de 2026

Se conserva el workspace y se adapta `tests/browser/verify-real-access.js`:
preflight de permisos efectivos, contextos independientes, fixtures propios
para edición/borrado, lecturas/análisis y JSON/multipart con `_method=PUT`.
Se elimina la dependencia de filas visibles sin permisos. No se recrea el
catálogo ni se modifican usuarios existentes.

Los intentos iniciales detectaron sesión sin permisos y posteriormente rol
`administrador` sin permisos efectivos. El usuario actualizó roles/asociaciones
en Laravel. La sesión posterior ya devuelve los 48 permisos requeridos y
25 permisos antiguos adicionales, que se conservan. Se inició la matriz con
una cuenta temporal por lote. Primer lote (sin sesión, sin permisos y analista):
**92/92 y 16 fixtures eliminados**. Segundo (operador, administrador y permiso
directo): **94/94 y 23 fixtures eliminados**. Total: **186/186**, con 74 respuestas
200, 29 respuestas 401 y 83 respuestas 403. Seis comprobaciones finales
independientes aprobadas: cero registros con el prefijo de prueba en cinco
dominios y refresh anónimo 401. No quedan fixtures de los lotes informados.
Los usuarios analista/operador existentes no se usan como fixtures ni se alteran.

Las lecturas cubren once dominios CRUD, auditoría, detalle, sublistas y análisis.
Altas/ediciones/borrados representativos en permisos, decomisos, drogas e hijos
de drogas; JSON, PNG multipart, `_method=PUT` y relaciones. No es una auditoría
exhaustiva de todos los controladores. Login/refresh reflejan las asignaciones
en los cinco perfiles autenticados. El único permiso directo probado es
`drug.view`, sin rol.

**Hallazgo de política:** administrador 73 permisos (48 del proyecto + 25
antiguos), analista 11 y operador 27. Frente a la propuesta, operador añade
ocho permisos de alta/edición de catálogos y carece de cuatro borrados de
decomisos/hijos. Laravel respeta esa asignación en los casos probados; P01 no
la modifica ni declara confirmada la intención de producto. El catálogo y su
manifest se etiquetan como propuesta original; las asociaciones actuales y
sus diferencias quedan en el JSON nuevo.

Un intento de seis perfiles excedió 300 s de MCP y perdió su informe; no se
cuenta como aprobado. Se comprobaron contextos cerrados y usuario ausente; las
consultas finales por prefijo cubren también ese intento. Se dividió el recorrido
en lotes de hasta tres perfiles y se añadió un checkpoint saneado en la página.
Montaje/limpieza espaciados a 1,25 s, sin reintentos automáticos ni 429 en los
lotes informados. Auditoría del servidor conservada; limpieza física de medios
no verificable desde este workspace.

Validación: sintaxis Node, lint con cero advertencias y build correctos en esta
ejecución; artefacto TypeScript restaurado. Suite previa de 208 pruebas
reutilizada por aplicación/dependencias sin cambios, sin contar una ejecución
nueva. Playwright MCP operativo contra API real; Context7 consultado para las
APIs del recorrido, con límite de versión transitiva descrito en el informe.
Sin cambios de aplicación, guards, dependencias, backend, commits o despliegues.
JSON, conteos de matriz/limpieza, ausencia de campos de credenciales, enlaces
actuales de P01 y `git diff --check` comprobados. Se conservan los enlaces a
implementaciones retiradas dentro de las entradas históricas del progreso.

Informe: [autorización](verification-access-control-2026-11-10.md).
Evidencia: [JSON de P01](verification-access-control-p01-results-2026-11-10.json).
Siguiente tarea disponible: **P02**, no ejecutada. P03–P15/O01/O02 siguen en su
estado anterior; confirmar la política de operador antes de P04.

### P02 — Identificadores y relaciones (11 de noviembre de 2026)

Ejecutado solo P02. Respuestas actuales de nueve listados, tres tipos de hijos,
login/refresh y OpenAPI confirman IDs numéricos y relaciones administrativas
integer[]; sesión por nombres y actividad con usuario nullable. DTO, entidades,
services, mutaciones, formularios y opciones alineados sin casts ni uniones
especulativas. types.ts conserva exportaciones; JSON/multipart/_method=PUT
conservados. AGENTS documenta la convención.

Conversión URL a número en consumidores de useParams mediante parseRouteId,
antes de Query/HTTP. Claves e invalidaciones numéricas; alias /007 y /7 comparten
recurso. Ruta inválida muestra alerta sin montar hijos ni consultar. Filtros
de análisis con IDs numéricos. Pruebas nuevas en tests/identifiers.test.mjs y
tests/browser/identifiers.js; fixtures/comparaciones/claves anteriores adaptados.

Verificación: **213/213 pruebas Node**, lint con cero advertencias, build y diff
correctos. Playwright MCP real: **6/6 grupos**, cero excepciones de página;
selecciones de roles/permisos y droga/presentación, navegación a detalle/edición,
caché única de alias y rechazo/recuperación de ruta inválida sin HTTP. Recorrido
solo de lectura, sin fixtures ni cambios de cuentas/asignaciones. No se cuenta
una repetición de toda la batería histórica. Artefacto TypeScript restaurado.
Context7 y fallback oficial consultados, con límites de versión en el informe.

Contratos, archivos, decisiones y límites en [P02](verification-identifiers-p02-2026-11-11.md),
enlazado desde [backend real](verification-backend-real-2026-11-10.md).
Cambios anteriores conservados. Sin dependencias nuevas, backend, commits ni
despliegues. P06, P07 y política del operador siguen pendientes.
**Siguiente tarea: P03**, sin ejecutar; las demás mantienen su estado.

Consolidación solicitada: `f0ff9f8` conserva auditorías y recorridos reales
previos; `cd226a0` contiene la implementación y pruebas de P02. Planes, informes
y progresos se consolidan en un commit documental separado. Se reutilizan las
213 pruebas, lint, build y seis casos reales anteriores: no cambió el código
durante la preparación de commits. Sin push ni despliegue.

### P03 — Acceso denegado y errores (11 de noviembre de 2026)

Ejecutado solo P03. `AccessDenied` es una presentación accesible reutilizable
con acciones por composición; `ApiRequestError` aporta reintento explícito y
logout mediante el thunk existente. Integrada en listados, dashboard, detalle,
análisis y opciones. Sin enlaces a destinos no comprobados: incluso con cero
vistas permitidas se puede cerrar sesión. El botón del layout tiene nombre
accesible. No se implantan guards, filtros de menú ni permisos de acciones.

El interceptor conserva exactamente los rechazos/body y sus campos; metadatos
HTTP/causa Axios en WeakMap privada, sin mutar cuerpos ni llevarlos a Redux.
Clasificación separada de 401, 403, transporte y 5xx; validación por campo y
contratos de mensajes preservados. Un 403 no renueva ni cierra sesión. Se corrige
también el caso de refresh inicial 403: el thunk lo propaga sin `onLogout` y el
router muestra recuperación, sin montar consultas protegidas. Los demás fallos
de ese chequeo conservan la política anterior. Los cuerpos primitivos opacos
mantienen el rechazo intacto y mensaje genérico; no se infiere estado por texto.

Verificación nueva: **217/217 pruebas Node**, lint con cero advertencias, build,
sintaxis de los dos recorridos y diff correctos; artefacto TypeScript restaurado.
Playwright MCP real: **3 grupos**, cuerpos actuales 401/403 de lectura/escritura,
usuario temporal sin permisos, navegación estable, teclado y cierre real hasta
login. Un usuario creado y eliminado en `finally`; sin cambiar asignaciones o
datos existentes. Captura local inspeccionada. Playwright simulado: **5 grupos**,
incluidos 403 sin `code`, recuperación de lectura, alta rechazada con texto/PNG
y modal conservados ante 403/422/transporte/500, borrado 403 con confirmación
conservada y recuperación del refresh inicial. Cero excepciones de página y
cero avisos inesperados en la simulación; contextos aislados cerrados.

No se repite la matriz P01 ni se considera la simulación prueba de una escritura
real exitosa. Los primeros intentos del script simulado fallaron por selectores
de botón/elementos ocultos por el modal; corregidos y recorrido final aprobado.
No se declara conformidad WCAG completa. Context7 y fuentes oficiales consultados
con límites de versión registrados. Sin dependencias nuevas, backend, commits,
push ni despliegue; acceso precargado de demo conservado.

Decisiones, cuerpos reales, archivos, evidencia y límites en el
[informe de autorización](verification-access-control-2026-11-10.md#p03--presentación-de-rechazos-11-de-noviembre-de-2026).
**Siguiente tarea: P04**, sin ejecutar; confirmar la intención de la política
actual de operador. P05 conserva revocación/limpieza y actualización de permisos
en vivo; las demás tareas mantienen su estado.

Consolidación solicitada (12 de noviembre de 2026): `e45e8c7` registra la
implementación y pruebas de P03; informe y progresos se consolidan en un commit
documental separado. Se reutilizan las 217 pruebas, lint, build y recorridos
aprobados anteriores: el código no cambió al preparar los commits. Diff revisado.
Sin push ni despliegue; P04 y P05 siguen pendientes.

### P04 — Permisos de sesión en la interfaz (12 de noviembre de 2026)

Ejecutado solo P04. `auth/access.ts` y `useAccess` centralizan capacidades desde
Redux, sin copia en Query/contextos ni bypass por rol. Guards antes de montar
módulos lazy, create/edit por URL, menú filtrado y callbacks CRUD autorizados.
Dependencias explícitas de catálogos en formularios, mapa/gráficos y dashboard
compuesto. Hooks de opciones con `enabled` y reintento protegido; opciones de
formularios se consultan al abrir. Salida por vista permitida o logout sin bucle.

Prerrequisito mínimo: detalle de decomiso de solo lectura con navegación desde
el listado, para consultar hijos sin editar el padre. Cada tipo de hijo exige
su propio `view`; alta/edición requieren sus catálogos, borrado independiente
del formulario permite `view` + `delete` sin `update`. Se conservan validaciones
de IDs, formularios, archivos, rechazos e invalidación. Tras crear se navega a
detalle si falta update. Comodín de roles corregido a `/rol`. Convención en AGENTS.

Se aplican permisos efectivos confirmados en P01, incluidas las diferencias de
operador, sin cambiar asociaciones ni imponer la propuesta histórica. La decisión
de política de roles permanece en el backend. El servidor puede rechazar una
acción admitida inicialmente por la UI: se conserva el formulario/confirmación.

Verificación nueva: **223/223 pruebas Node**, lint sin advertencias, build y
sintaxis de 30 recorridos correctos. Playwright MCP simulado: **7 grupos P04**
(15 rutas sin permisos sin lecturas, permiso directo, perfiles completos,
dependencias, tres hijos, borrado parcial 403, análisis y logout por teclado)
y **5 grupos de regresión P03** (rechazo/recuperación y campos/archivo/diálogos
conservados). Cero excepciones y avisos inesperados; contextos aislados cerrados.
Capturas locales de detalle y denegación inspeccionadas con datos ficticios.
Fixtures anteriores adaptados a sesiones con permisos explícitos; no se declara
una repetición de todos los recorridos. Incidencias iniciales de aserción de
acordeones y resolución de iconos SSR corregidas; suite final aprobada.

**Límite real:** `GET /api/drug` anónimo y `POST /api/refresh` responden 500 ahora.
Pendiente recuperar el backend y verificar selectivamente la nueva integración
real; no se considera la matriz histórica P01 una ejecución nueva ni se hicieron
escrituras/fixtures reales. Sin dependencias nuevas, backend, cambios de roles,
commits o despliegues. Demo precargada conservada. Context7 y documentación
oficial consultados; límites de versión, política de dependencias y evidencia
en [el informe de autorización](verification-access-control-2026-11-10.md#p04--rutas-menú-y-acciones-12-de-noviembre-de-2026).

Siguiente tarea del plan: **P05**, sin ejecutar, con backend operativo para su
prueba real. Actualización/revocación en vivo y limpieza específica tras revocar
siguen en P05; P06–P15/O01/O02 mantienen su estado.

Consolidación solicitada (12 de noviembre de 2026): `6a19441` registra la
implementación y pruebas de P04; guía, informe y progresos se consolidan en un
commit documental separado. Se reutilizan las 223 pruebas, lint, build y los
recorridos aprobados del mismo código, sin contarlos como ejecuciones nuevas.
Diff revisado. Sin push ni despliegue; integración real pendiente por 500 del
backend y P05 sin ejecutar.

### P05 — Autorizaciones en sesión abierta (12 de noviembre de 2026)

Ejecutado solo P05. `refreshAuthorization` reutiliza el service y `/refresh`
existentes, sin otra sesión. Un listener del router comprueba cada 60 s visible,
al recuperar foco/conexión/visibilidad (límite 60 s) y mediante Actualizar permisos.
Una respuesta 403 de datos puede agrupar una comprobación cada 30 s; endpoints
auth y respuestas retiradas quedan excluidos. Plazo 10 s y ninguna repetición
automática de operaciones. Un refresh idéntico conserva RHF/archivo/diálogos.

Si cambian roles/permisos, el middleware retira señal, consultas y ambas cachés;
la revisión Redux remonta consumidores para retirar también filas, opciones,
selecciones y borradores locales. Se elige limpiar todo por dependencias cruzadas,
también al asignar permisos. Misma cuenta conserva filtros, URL e identidad;
otra cuenta (correo distinto según el contrato disponible) reinicia filtros.
Un fallo vivo distinto de 401 bloquea acceso, limpia y ofrece recuperación
manual/logout; detiene comprobaciones pasivas. 401 termina sesión. Logout pausa
refresh para impedir que una respuesta concurrente lo desplace.

Verificación final: **231/231 pruebas Node**, lint sin advertencias y build
correctos; sintaxis de tres recorridos y diff comprobados. Artefacto TypeScript
incidental restaurado. Playwright MCP simulado: **11 grupos P05** (incluidos
ocultación/foco/conexión, 403 con y sin cambios, lectura/escritura pendientes,
recuperación y logout); **5 grupos P03** con errores 403/422/red/500 y borradores
con PNG conservados cuando los permisos no cambian. Cero excepciones/avisos
inesperados. Expectativas históricas del recorrido P03 adaptadas a P05.

Playwright MCP real: **6 grupos** en dos ejecuciones con fixtures propios,
final repetida tras ajustes de coordinación. Una cuenta mantiene sesión al
revocar/reponer permisos de su rol, retirar/reasignar el rol y retirar/reponer
permisos directos. `/refresh` refleja los cambios y operaciones revocadas
devuelven 403. Vista parada y formulario en edición reaccionan al tick; lectura
200 pendiente no repone datos al revocar. Una escritura 200 retenida **permanece
persistida en Laravel** aunque se aborte su entrega; no publica efectos tardíos.
Recuperación sin nuevo login y logout real seguidos de refresh 401. Cero
excepciones de página; no se simulan los cuerpos/códigos del recorrido real.

Se eliminaron **6/6 fixtures** entre las dos ejecuciones: dos cuentas, dos roles
propios y dos permisos creados. Comprobación administrativa final independiente
de los catálogos completos: cero `PORTFOLIO_P05_`. No se alteran roles/cuentas
existentes ni auditoría; helpers espaciados, sin 429 ni reintentos de escrituras.
La integración selectiva nueva de P04 cubre drogas/permisos, no todos sus perfiles
y dependencias. No se repite P01 como matriz ni se cuentan pruebas históricas.

Límite: actualización eventual, dependiente del temporizador visible/red; durante
la comprobación se conserva la edición. Cambiar autorización descarta todos los
borradores, incluso de otros dominios; cancelar transporte nunca deshace una
escritura aceptada. Context7 no ofrece los patches instalados exactos; contraste
oficial y límites documentados. Sin nuevas dependencias, backend, commits o
despliegues. Demo precargada conservada; AGENTS recoge la convención.

Hallazgo backend separado: refresh anónimo con Accept JSON responde 401, con
`Accept: */*` devuelve 500 `Route [login] not defined.`. Ajuste pendiente Laravel:
renderizar autenticación `/api/*` como JSON 401 sin depender de esa cabecera,
evitando redirección web. No se observa falta de revocación en los casos probados.
Los fallos iniciales de los recorridos simulados fueron selectores/aserción
prematura, corregidos antes de los resultados finales; ninguna fuga de fixtures.

Política, resultados, archivos y límites en
[autorización P05](verification-access-control-2026-11-10.md#p05--revocación-con-sesión-abierta-12-de-noviembre-de-2026)
y [JSON P05](verification-access-control-p05-results-2026-11-12.json).
Siguiente tarea del plan: **P06**, sin ejecutar. Las demás mantienen su estado.

Consolidación solicitada (12 de noviembre de 2026): `354682e` contiene la
implementación y pruebas de P05. Guía, informe, evidencia JSON y progresos se
consolidan en un commit documental separado. Se reutilizan las 231 pruebas,
lint, build y recorridos aprobados del mismo código, sin contarlos como nuevas
ejecuciones. Diff e índice revisados; JSON saneado comprobado. Sin push ni
despliegue. El ajuste Laravel de autenticación anónima sin Accept JSON sigue
pendiente; P06 y posteriores no se ejecutan.

### P06 — Paginación de sublistas vacías (12 de noviembre de 2026)

Ejecutado únicamente P06. Los tres endpoints reales omiten los cuatro metadatos
cuando el padre no tiene hijos, incluida la lectura tras borrar el hijo final.
Con tres hijos y tamaño 2, última página y fuera de rango sí devuelven metadatos;
al borrar la fila de página 2, su vacío conserva total 2 y última página 1.
Segundo padre permanece vacío: aislamiento acreditado. 24 lecturas documentadas
en [JSON real](verification-sublist-p06-results-2026-11-12.json).

Los tres services usan `api/sublistPagination.ts`: solo página solicitada 1 con
filas vacías y los cuatro campos ausentes se adapta a total 0/página 1/última 1/
tamaño solicitado. Metadatos existentes se conservan, incluyendo total positivo
fuera de rango. Una página posterior sin metadatos o metadatos parciales/inválidos
rechaza el listado; no se deduce cero ni se cambia página ante el error. Los
hooks mantienen un propietario de página y muestran total desconocido mientras
no hay lectura acreditada o hay error. Orden, filtros, tamaño, señal y claves
por padre permanecen; invalidación actual y corrección de página reutilizadas.

**256/256 pruebas Node finales**, incluidas 25 de P06 (grupo/subgrupos incluidos),
lint sin advertencias, build y diff correctos. Artefacto TypeScript restaurado.
Pruebas de services/query: contratos, parámetros, aborto, escritura/relectura,
total/página, error ambiguo sin sobrescribir caché e invalidación por padre.
Fixture antiguo de deduplicación corregido: respondía página 1 también al pedir 2.

Playwright MCP real, sin interceptar respuestas: tres grupos de interfaz/services,
normalización vacía de los tres dominios, borrado por UI con total 6→5 y página
2→1 conservando tamaño 5, eliminación de hijos restantes seguida de recarga con
total 0/estado vacío/controles deshabilitados. Cero excepciones y errores de
consola en el recorrido final; un aviso de rendimiento Canvas2D del entorno,
sin avisos de paginación MUI. [Evidencia UI](verification-sublist-p06-ui-results-2026-11-12.json).

Se limpiaron los nueve hijos/dos padres del sondeo y seis hijos/un padre del
recorrido final, más los padres de dos intentos iniciales (tamaño 1 rechazado
422 y módulo anterior retenido en la pestaña, resuelto recargando). Comprobación
final independiente: cero padres con prefijo `PORTFOLIO_P06_`. No se modifican
cuentas, roles ni auditoría; eliminación física de fotos no acreditada.

**El contrato Laravel no se declara resuelto.** El informe entrega los cuerpos
mínimos para vacío real y fuera de rango; faltan implementación backend y nueva
verificación de esa garantía, incluidos filtro sin resultados y página posterior
cuando ya no hay hijos. Ante esos casos indeterminados el cliente muestra error
y permite reintentar. No se enviaron mensajes externos ni se modificó Laravel.
Context7 sin patch exacto de Query 5.107.1; contraste oficial y límites en
[informe backend P06](verification-backend-real-2026-11-10.md#p06--paginación-vacía-12-de-noviembre-de-2026).
Sin dependencias nuevas, commits o despliegues. Siguiente disponible **P07**,
sin ejecutar; ajuste backend P06 y resto de pendientes conservados.

Consolidación solicitada: `9ce885a` registra implementación y pruebas P06;
informe, evidencias JSON y ambos progresos se consolidan por separado. Se
reutilizan las 256 pruebas, lint, build y recorridos del mismo código, sin nueva
ejecución. Diff e índice revisados. Sin push ni despliegue; contrato Laravel
pendiente y P07 sin ejecutar.

### P07 — Configuración y renderizado de medios (12 de noviembre de 2026)

Ejecutado solo P07. El usuario confirma `http://localhost/storage`; subida
temporal y GET 200/image/png acreditan la base, también sin cookies. `.env`
local resuelto (ignorado), variable documentada sin secretos en `.env.template`.
`getMediaUrl` centraliza resolución para logoColumn, PhotoInput y subdecomisos;
sin base/referencia válida no hay petición `undefined`. Respeta referencias
relativas/absolutas y conserva los valores originales de RHF/payloads. Fallbacks
con inicial/icono y referencia eliminable aunque no pueda cargar; validadores,
multipart y revocación de object URLs conservados.

**259/259 pruebas Node**, lint sin advertencias, build, sintaxis y diff correctos.
Playwright MCP operativo: **7 grupos catálogo** (creación, recarga, conservación,
reemplazo y recuperación), **8 grupos subdecomisos** (tres services y paneles,
incluido guardado UI de droga) y **3 grupos de ciclo de previews** aprobados.
GET de PNG coincide byte a byte; imágenes decodificadas y capturas locales
inspeccionadas. Solo se simulan respuestas de imagen 403/404 en el bloque de
fallback del catálogo; API real y resto de recorridos sin interceptaciones.
Cero excepciones en recorridos reales finales. Avisos MUI de opciones al cargar
arma/munición y Canvas2D registrados; sin ampliar alcance para corregirlos.

Diferencia acreditada: variable ausente es configuración frontend; archivo
inexistente bajo `/storage` devuelve **403** del servidor, no fallo de variable
ni prueba de permiso API revocado. Fuera de esa base devuelve 404. Se retienen
referencias ante ambos códigos. No se modifica Laravel ni medios existentes.

**Nueve registros temporales limpiados**, incluidos intentos iniciales; tres
listas de hijos vacías y comprobación independiente cero drogas/padres P07.
Un borrado rechazó inicialmente aunque una lectura posterior ya estaba vacía;
causa sin determinar y script de limpieza adaptado a releer sin repetir writes.
No se acredita limpieza física: el PNG del sondeo sigue público con 200 tras
borrar su registro. Auditoría conservada. Sin acceso al disco backend; entrega
de producción tampoco verificada.

Intento del recorrido histórico de controles compartidos falla en la aserción
de fecha antes de fotos (`format is not a function`); no se cuenta como aprobado.
Cobertura específica PhotoInput ejecutada con éxito. Incidencias iniciales de
selectores/firmas y supuesto 404, evidencia y límites de versiones en
[informe backend P07](verification-backend-real-2026-11-10.md#p07--medios-públicos-12-de-noviembre-de-2026)
y [JSON P07](verification-media-p07-results-2026-11-12.json).
Artefacto TypeScript restaurado, sin dependencias nuevas, commits ni despliegues.
Siguiente disponible **P08**, sin ejecutar; resto de pendientes conservados.

Consolidación solicitada: `f179e3e` contiene implementación, plantilla y pruebas
de P07. Informe, evidencia JSON y ambos progresos se consolidan en un commit
documental separado. Se reutilizan las 259 pruebas, lint, build y recorridos del
mismo código, sin nueva ejecución. Diff e índice revisados; `.env` local sigue
ignorado. Sin push ni despliegue; limpieza física no acreditada, respuesta 403
de archivos ausentes y fallo del recorrido histórico de fechas documentados.
P08 permanece sin ejecutar.

## P08 — Frontera y recuperación de vistas (12 de noviembre de 2026)

Completado exclusivamente P08. `ViewErrorBoundary.tsx` envuelve Suspense/Routes
en `AppRouter`, conservando proveedores, coordinación de sesión y lazy. Fallback
genérico accesible con foco, alerta, un reintento local, recarga manual, otra
vista permitida y logout. Navegación/revisión de sesión reinician la frontera;
ninguna recarga automática. No se muestran excepciones ni se cambian errores
HTTP de Query. Sin nuevas dependencias, runner, monitorización o despliegues.

Verificación nueva: **259/259 pruebas**, lint sin advertencias, build aprobado y
diff revisado. Playwright MCP sobre preview producción: cuatro grupos P08
aprobados (render persistente/transitorio, rechazo de import y recuperación,
HTTP separado, móvil/logout), sin pageErrors. Regresión lazy de seis grupos
aprobada a 1280×900, sin errores inesperados. Primer intento agotó una aserción
de mapa >300 px con mapa de 298 px; diagnóstico y repetición documentados, sin
ampliar alcance a mapas. Captura móvil revisada. Artefacto TypeScript restaurado.

Informe y recorrido reproducible:
[P08](verification-view-errors-p08-2026-11-12.md),
`tests/browser/view-error-boundary.js`. Imports rechazados quedan cacheados por
React: reintento local no garantiza descargarlos; recarga requiere pulsación.
Edición local desmontada puede perderse; proveedores no se remontan. No cubre
bootstrap, proveedores superiores, fallback propio o callbacks asíncronos
arbitrarios; pruebas de sesión/API simuladas, sin acreditar hosting real ni
auditoría completa de accesibilidad. Límites previos conservados.
Siguiente disponible: **P09**, sin ejecutar.

Consolidación solicitada: `d06ad3f` registra implementación y recorrido P08.
Informe y ambos progresos se consolidan en un segundo commit documental.
Se reutilizan las verificaciones del mismo código: 259 pruebas, lint, build y
recorridos descritos; sin repetirlas por cambios exclusivamente documentales.
Diff e índice revisados. Sin push ni despliegue; P09 sigue sin ejecutar.

## P09 — Página no encontrada (12 de noviembre de 2026)

Ejecutado exclusivamente P09. Página MUI con tema/foco, salida al login para
visitantes, primera vista permitida y logout para sesiones; sin destinos
privados cuando no hay permisos. Comodines principal y de once módulos muestran
404 conservando URL. Guards en rutas concretas antes de consultas; entradas
deliberadas de raíz/auth/login/registro conservadas. Recurso HTTP 404 mantiene
la vista y Query con mensaje propio, separado de ruta inexistente y 403.

**260/260 pruebas Node**, lint sin advertencias y build correctos. Playwright
MCP: siete grupos del recorrido P09 aprobados sobre build/preview local con
sesiones/API simuladas, más comprobación aislada de tema oscuro y Tab/Enter.
URL directa, recarga, once comodines con/sin sesión, atrás/adelante, recuperación,
permisos, recurso 404/403 y logout fallido/recuperado sin bucles. Cero excepciones
JS; errores HTTP simulados esperados. Capturas móvil/escritorio/oscuro revisadas.
Bloque adicional incorporado al script sin repetir toda la matriz por ese cambio.
Sintaxis y diff correctos; artefacto TypeScript restaurado.

Documento desconocido del preview recibe HTTP 200 aunque React muestra 404;
la UI cliente no modifica ese código. Hosting público, fallback y HTTP real
pendientes de P14, sin acreditarlos por el preview. No hay pruebas backend
reales, dependencias nuevas, commits ni despliegues. Límites previos conservados.
Informe, decisiones y reproducción: [P09](verification-not-found-p09-2026-11-12.md)
y `tests/browser/not-found-p09.js`. Siguiente disponible: **P10**, sin ejecutar.

Consolidación solicitada: `5c07f94` registra implementación y pruebas de P09.
Informe y ambos progresos se consolidan en un segundo commit documental.
Se reutilizan las 260 pruebas, lint, build y recorridos del mismo código; no se
repiten por esta consolidación. Diff e índice revisados. Sin push ni despliegue;
hosting público pendiente de P14 y P10 sin ejecutar.

## P10 — Identidad y panel de producto (12 de noviembre de 2026)

Ejecutado solo P10. Se propone **Decomisos · Gestión y análisis** como identidad
descriptiva, sin marca previa acordada. Título, favicon SVG propio, `lang="es"`,
login/registro y navegación coherentes. Acceso precargado conservado. Textos de
contraseña, acciones/tablas y calendarios MUI/Day.js en español, sin cambiar
rutas, contratos ni mensajes del backend. Tema claro/oscuro reutilizado.

El panel pasa a accesos explicados según permisos efectivos; no consulta datos
ni muestra contadores. Barras/líneas y mapas anteriores eran constantes de
`demoData.ts`, retirado sin otros consumidores; la tabla remota de drogas sigue
en su catálogo. La procedencia API no acredita autenticidad de registros: demo
identificada y cifras oficiales no afirmadas. Preparar datos persiste en P12.
`dashboard.view` permite el panel sin otras lecturas; cada destino conserva sus
dependencias/guards. Estado vacío con actualización de permisos/logout, sesión
única y lazy conservados. Menú móvil se cierra al navegar.

**260/260 pruebas Node**, lint sin advertencias y build correctos. Playwright MCP
en preview local con sesión/API simuladas: **5 grupos P10**, **7 de regresión
P04** y **7 de P09**, sin excepciones ni avisos inesperados. P10 verifica permisos
parciales, vacío/denegación sin consultas, origen/aviso de demo, carga diferida,
teclado, listado vacío/error/reintento, calendario español, móvil/retorno/logout.
1440×1000 y 390×844 sin desbordamiento; cinco capturas inspeccionadas, sesión
ficticia y campos precargados enmascarados. Recorridos históricos adaptados a
etiquetas nuevas, sin declarar que se repitieron todos. Sintaxis y diff revisados;
artefacto TypeScript restaurado.

Context7 y fuentes oficiales consultados; patches exactos no disponibles,
contraste con APIs instaladas y navegador documentado. Incidencias iniciales
del evaluador/selector de fecha y captura durante Grow corregidas antes de los
resultados finales. No hubo escrituras, integración backend nueva, dependencias,
commits ni despliegues. No se acredita hosting público ni auditoría completa de
accesibilidad. Informe, fuentes y capturas:
[P10](verification-product-p10-2026-11-12.md), recorrido
`tests/browser/product-p10.js`. Límites previos conservados. Siguiente: **P11**,
sin ejecutar; P12–P15/O01/O02 mantienen su estado.

Consolidación solicitada: `e3fd8fe` registra implementación y pruebas P10.
AGENTS, informe, cinco capturas enmascaradas/ficticias y ambos progresos se
consolidan en un segundo commit documental. Se reutilizan las 260 pruebas,
lint, build y recorridos del mismo código; no se repiten por esta consolidación.
Diff e índice revisados. Sin push ni despliegue; P11 sigue sin ejecutar y los
límites de integración, datos y hosting se conservan.
