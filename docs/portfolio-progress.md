# Progreso de preparación para portafolio

## Estado al 12 de noviembre de 2026

**P01–P04 ejecutados; P04 tiene pendiente su nueva integración real por errores 500 del backend. Las demás tareas siguen sin ejecutar.** La preparación del
plan no ejecutó por sí misma ninguna tarea.
Fuente: [portfolio-plan.md](portfolio-plan.md). Se conserva la refactorización
cerrada en [refactor-progress.md](refactor-progress.md).

| Código | Prioridad | Tarea | Estado | Dependencias o referencia |
| --- | --- | --- | --- | --- |
| P01 | Alta | Revalidar autorización backend | Completado con hallazgo de política | 186/186 según permisos actuales; operador difiere de la propuesta |
| P02 | Alta | Tipos de identificador | Completado | Respuestas/OpenAPI, IDs numéricos y frontera URL verificados; informe P02 |
| P03 | Media | Acceso denegado y tipos de error | Completado | Cuerpos reales 401/403, presentación reutilizable y recuperación verificados |
| P04 | Alta | Permisos en rutas, menú y acciones | Implementado y verificado con simulación; integración real pendiente | Backend local devuelve 500 en lectura anónima y refresh; informe de autorización |
| P05 | Alta | Revocación durante sesión abierta | Pendiente | P01 y P04 |
| P06 | Alta | Paginación de sublistas vacías | Pendiente | Contrato real del backend |
| P07 | Alta | Configuración y renderizado de imágenes | Pendiente | URL pública real de medios |
| P08 | Media | Recuperación de errores de render/lazy | Pendiente | Mantener carga diferida |
| P09 | Media | Página no encontrada | Pendiente | Integrar con P03/P04 si están implementados |
| P10 | Alta | Identidad y dashboard de producto | Pendiente | Considerar permisos de P04 |
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
  P02 resuelve la discrepancia de IDs con evidencia actual y OpenAPI; imágenes
  y sublistas quedan pendientes. Comprobar vigencia antes de implementarlas.
- P04 integra permisos efectivos en rutas/menú/acciones; nueva integración real
  pendiente por 500 del backend. P05 conserva actualización/revocación en vivo.
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
