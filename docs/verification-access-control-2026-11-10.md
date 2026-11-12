# Verificación de roles y permisos — 10 de noviembre de 2026

## P05 — Revocación con sesión abierta (12 de noviembre de 2026)

Ejecutado únicamente P05. Implementación y comprobaciones nuevas con backend
real y HTTP simulado. La cuenta temporal mantiene la misma cookie durante las
revocaciones y asignaciones; no se vuelve a hacer login para recuperarla.
Laravel refleja los cambios probados en `/refresh` y en operaciones posteriores.
La evidencia anterior de P01/P03/P04 se conserva como historia.

### Política de actualización y 403

- Redux `auth.user` sigue siendo la única sesión. Se reutiliza
  `authService.checkSession` (`POST /refresh`, cookies y contrato existentes).
  `authorizationRevision` es un contador de retirada de consumidores y
  `authorizationError` un mensaje serializable; no contienen otra identidad.
  El coordinador conserva únicamente promesas, tiempos, señales y contadores de
  pausa por store. No guarda usuario, permisos, contraseña ni token.
- Un único hook del router programa una comprobación **cada 60 s con la pestaña
  visible**. Foco, vuelta a visible y conexión disparan una comprobación pasiva,
  limitada a una por 60 s. El tick periódico no se pospone por ese límite. La
  acción accesible **Actualizar permisos** permite comprobar explícitamente,
  incluso desde una ruta denegada. Comprobaciones concurrentes comparten promesa.
  Cada comprobación tiene señal de sesión y plazo de **10 s**.
- Un **403 HTTP de un endpoint de datos** notifica al consumidor de sesión sin
  transformar el rechazo original. Puede iniciar una comprobación, con límite
  de **una por 30 s**; las concurrentes se agrupan. Se excluyen login, register,
  refresh, logout y respuestas de transporte ya retirado. No se repite la lectura
  o escritura rechazada, no se llama a login ni se redirige por un 403. El plazo
  y los límites evitan cadenas de refresh y tormentas de errores.
- Con roles/permisos efectivos **idénticos**, el refresh actualiza los datos de
  sesión sin retirar la generación, caché o formulario. El orden y los duplicados
  de nombres no son cambios. Un 403 con permisos iguales conserva el rechazo,
  texto, archivo y confirmación para recuperación explícita; no se interpreta
  como éxito ni como prueba suficiente para expulsar al usuario.
- Si cambian roles o permisos (asignación o revocación), se retira la señal de
  transporte, se cancelan consultas y se limpian **ambas cachés completas** del
  cliente Query. Se elige esta limpieza conservadora porque listas, detalles,
  opciones, hijos y análisis tienen dependencias cruzadas. Antes de aplicar la
  nueva sesión, el middleware retira el trabajo antiguo. El contador cambia la
  key del árbol protegido: desmonta también selecciones, RHF, archivos, diálogos
  y observadores que podrían conservar datos fuera de la caché. Los guards de
  P04 evalúan de nuevo los permisos antes de montar consultas. Se conservan URL,
  cuenta autenticada y filtros aplicados; los datos permitidos se consultan de
  nuevo. **Un cambio de autorización descarta todos los borradores abiertos**,
  incluso los de otro dominio. La misma política conservadora rige para altas.
- Un refresh vivo **401** usa `onLogout`. Un refresh vivo 403, fallo de red,
  timeout, respuesta inválida o 5xx bloquea el árbol protegido, retira trabajo y
  cachés, conserva la identidad Redux y ofrece actualización manual/logout. Los
  ticks y eventos pasivos se detienen hasta recuperar explícitamente; no hay
  reintento automático del fallo. `useAccess` también bloquea con ese error.
  La comprobación inicial del router conserva la política anterior de P03.
- `onSessionRefreshed` distingue la misma cuenta de una distinta por `correo`,
  la identidad disponible en el contrato actual (no hay ID de sesión). Solo una
  cuenta diferente reinicia también filtros como frontera completa. Login,
  checking y logout conservan su limpieza completa y reinician la coordinación
  de refrescos. Cambiar el correo de la misma persona se trata conservadoramente
  como cambio de identidad. No se deduce identidad del rol ni se añade un usuario
  paralelo para resolverlo.
- Logout tiene prioridad: pausa comprobaciones y aborta la comprobación viva
  antes de solicitar la salida. Tras éxito limpia sesión/filtros/cachés; si falla,
  conserva el comportamiento anterior y permite volver a comprobar. Los thunks
  ligados a la señal retirada y los callbacks de `sessionMutationOptions` no
  publican efectos tardíos. La limpieza del servidor se prueba por separado.

### Límites deliberados

No hay push de revocaciones. Antes de conocer el cambio puede seguir visible la
última autorización confirmada: normalmente hasta el siguiente tick visible
(60 s), más red hasta 10 s. Los temporizadores de pestañas suspendidas no son una
garantía de tiempo real; al volver se usa la comprobación limitada o la acción
manual. Durante una comprobación se conserva la edición hasta conocer su
resultado. Un segundo 403 dentro del límite no vuelve a comprobar; el tick y
la actualización manual siguen disponibles.

Un 403 puede expresar una regla de recurso que no cambie `permissions`. No se
inventa una revocación por nombre de endpoint. Si Laravel devolviera permisos
obsoletos, esa sesión no acreditaría una revocación global: debe corregirse la
fuente efectiva del backend (relaciones/caché Spatie y autorización por operación).
No se ha observado ese defecto en las revocaciones probadas aquí. No se cubren
todas las políticas por registro ni todos los controladores. La UI no es una
frontera de seguridad y no puede retirar datos ya descargados fuera de la app.

**Abortar transporte no revierte una escritura aceptada.** En el caso real se
retuvo la entrega de un POST ya respondido 200 por Laravel, se revocó el permiso
y se dejó llegar el resultado antiguo. El cliente no reabrió formulario, publicó
éxito ni recuperó datos; una lectura administrativa independiente confirmó que
el permiso temporal creado seguía persistido. Se eliminó expresamente en cleanup.
La recuperación obtiene el estado actual del servidor, sin repetir el POST.

### Evidencia nueva y limpieza

| Comprobación | Resultado |
| --- | --- |
| Suite Node final | **231/231**; ocho pruebas contadas en el grupo nuevo, incluyendo su contenedor |
| Lint / build / sintaxis / diff | Correctos; sin advertencias ESLint; artefacto TypeScript incidental restaurado |
| Simulación P05 | **11 grupos**, 17 refresh, 8 lecturas, 4 escrituras simuladas; cero excepciones/avisos inesperados |
| Regresión simulada P03 | **5 grupos**, 403/422/red/500, campos/PNG/diálogos, reintento y refresh inicial; cero excepciones/avisos inesperados |
| API y UI reales | **6 grupos** por ejecución; dos ejecuciones con fixtures distintos, la final tras ajustes de coordinación |
| Limpieza real | **6/6** registros eliminados: dos cuentas, dos roles propios y dos permisos creados por los POST retenidos |
| Comprobación final independiente | Catálogos completos de usuarios/roles/permisos: **cero** registros `PORTFOLIO_P05_` |

Las pruebas Node cubren igualdad semántica, conservación de filtros, revocación
y asignación, cachés de consultas/mutaciones, lectura y escritura tardías aun
sin consumir señal, agrupación/límite de 403, exclusión de refresh, bloqueo y
recuperación, 401, cambio de cuenta, logout pendiente/fallido y respuesta antigua
tras logout. La suite completa se ejecutó de nuevo sobre el código final.

En navegador simulado se acelera el reloj para los ticks, límites, pestaña
oculta, vuelta a visible, foco y reconexión; no es medición de latencia real.
El 403 con permisos cambiados retira el formulario; con permisos iguales conserva
texto/PNG y no repite escrituras. La regresión P03 adapta las expectativas de
refresh a P05 y espera la retirada real de la fila tras borrar.

El recorrido real usa un rol **propio temporal**, con `drug.view`, y permisos
directos `permission.view/create/update` resueltos por nombre desde el catálogo
actual. Prueba: retirar/reponer permiso del rol; desasignar/reasignar rol; editar
un formulario sin cambios de autorización; retirar creación/edición directas;
revocar view con lectura aceptada pendiente; revocar con escritura aceptada
pendiente; recuperar permisos directos y cerrar sesión. Lectura de droga y alta
de permiso posteriores a revocar devuelven **403** con
`{"error":"User does not have the right permissions.","code":403}`. Refresh conserva
el rol cuando solo cambia su contenido y lo retira al desasignarlo. Logout real
lleva a login y el refresh posterior devuelve **401** con
`{"error":"No autenticado","code":401}`. Cero excepciones de página en ambas ejecuciones.

Solo se retrasa la **entrega** de las respuestas reales pendientes con
`route.fetch`; ni cuerpos ni códigos se simulan en ese recorrido. Limpieza en
`finally`, solo IDs propios, sin alterar cuentas/roles preexistentes o auditoría.
Peticiones del helper espaciadas al menos 1,25 s, sin reintentos de escrituras ni
429. No se crean archivos de medios en el backend. P01 no se repite como matriz
completa; P04 gana integración selectiva nueva de rutas/menú/acciones en drogas
y permisos, sin declarar probados todos sus perfiles/dependencias reales.

Recorridos: [P05 simulado](../tests/browser/live-authorization.js),
[P05 real](../tests/browser/live-authorization-real.js),
[regresión P03](../tests/browser/access-denied.js) y
[pruebas de coordinación](../tests/live-authorization.test.mjs).
Resultados saneados, cuerpos y limpieza:
[JSON P05](verification-access-control-p05-results-2026-11-12.json).
Los primeros intentos simulados corrigieron selectores de cabecera/alerta y una
aserción prematura tras borrar; no se cuentan como aprobados. No hubo fixtures
reales fallidos; las dos ejecuciones reales terminaron y limpiaron sus registros.

### Hallazgo Laravel y documentación consultada

Se aisló el 500 anónimo observado anteriormente: en contextos sin cookie,
`POST /api/refresh` con `Accept: application/json` devuelve **401**; con
`Accept: */*` devuelve **500** y
`{"message":"Excepción no controlada","error":"Route [login] not defined."}`.
Login y refresh autenticados responden 200 actualmente. No se atribuye el fallo
a revocación ni se presupone que los 500 históricos tuviesen todos esta causa.
**Ajuste pendiente en Laravel:** los fallos de autenticación de rutas `/api/*`
deben renderizar JSON 401 incluso sin negociación JSON, evitando la redirección
a una ruta web `login` ausente. Revisar el handler/middleware de autenticación
y su renderizado de excepciones según la versión Laravel instalada. Código
Laravel ausente aquí; ajuste identificado, no implementado ni verificado.

Versiones del lock verificadas: React **19.3.1**, Redux Toolkit **2.6.1**,
TanStack Query **5.107.1**, Axios **1.21.0**. Sin cambios de dependencias. Skill
React aplicada a listener único, derivación de capacidades y retirada por key.
Context7 consultado para Query, RTK y Axios; no publica estas versiones exactas
en su catálogo. Contraste con APIs/tipos instalados y documentación oficial:
[QueryClient](https://tanstack.com/query/v5/docs/reference/QueryClient),
[cancelación Query](https://tanstack.com/query/v5/docs/framework/react/guides/query-cancellation),
[configureStore](https://redux-toolkit.js.org/api/configureStore),
[interceptores Axios](https://axios-http.com/docs/interceptors) y
[cancelación Axios](https://axios-http.com/docs/cancellation).
Son referencias de familia mayor, no certificaciones de cada patch instalado;
las pruebas locales y reales acreditan el comportamiento descrito.

Cambios limitados a P05, guía y documentación asociada. Sin backend, dependencias,
commits, push ni despliegue. Se conserva la demo precargada. P06 y posteriores
no se ejecutan.

## P04 — Rutas, menú y acciones (12 de noviembre de 2026)

Implementación frontend completada; nueva integración real pendiente. La API
local respondió **500** tanto a `GET /api/drug` sin sesión como a
`POST /api/refresh`. No se crearon fixtures ni se intentaron escrituras reales
con ese estado. La matriz real de P01 permanece como evidencia histórica y
fuente de contratos, no como una ejecución nueva de P04. No se atribuye causa
al 500 ni se modifica Laravel, cuyo código no está en este workspace.

### Propietario y política

- `src/modules/auth/access.ts` contiene la política de permisos y dependencias;
  `useAccess` deriva las capacidades desde la sesión Redux existente y exige
  estado autenticado. No hay copia en Query/contextos ni bypass por nombre de
  rol. Se usa exactamente la unión efectiva `permissions` de login/refresh,
  adaptada a `user.permisos` por el service existente.
- Se respetan las asignaciones observadas en P01. El operador puede crear/editar
  catálogos y decomisos/hijos, pero no borrarlos. P04 no decide ni modifica la
  política de roles del servidor. La discrepancia con la propuesta inicial
  queda identificada; no impide aplicar los permisos efectivos solicitados.
- `AccessRoute` envuelve los módulos lazy antes de montarlos. Un rechazo local
  conserva URL y sesión, usa `AccessDenied` de P03 y el layout con logout. La
  entrada elige una vista permitida; sin ninguna muestra denegación con logout,
  sin redirigir en bucle a dashboard. El menú usa la misma política, incluido
  Dashboard; el nombre de usuario deja de ser un enlace implícito a esa vista.
- Cada escritura necesita `view` del dominio además de su acción. Los callbacks
  de tabla y los botones de alta se omiten cuando falta autorización. Los
  formularios no se montan sin permiso de acción/dependencias. El servidor
  conserva la autorización efectiva: permitir iniciar una acción en la UI no
  convierte un rechazo HTTP en éxito, no cierra el formulario ni invalida datos.

### Dependencias explícitas de la interfaz actual

| Consumidor | Requisitos adicionales a su propio `view`/acción |
| --- | --- |
| Crear/editar usuario | `role.view` y `permission.view` para sus selectores |
| Crear/editar rol | `permission.view` |
| Consultar hijos desde el detalle del padre | `confiscation.view` y `view` de cada tipo de hijo |
| Crear/editar subdecomiso de droga | `drug.view` y `drugPresentation.view` |
| Crear/editar subdecomiso de arma/munición | `weapon.view` / `ammunition.view` |
| Gráficos y mapa | `drug.view`, `weapon.view`, `ammunition.view` para los filtros existentes |
| Dashboard compuesto actual | `drug.view`, `graph.view`, `map.view` |

Mapa/gráficos se protegen como vistas completas, incluidos sus filtros; no se
introduce una variante sin selectores ni nuevas funciones de análisis. Dashboard
requiere permiso para las tres secciones actuales, aunque mapas/gráficos usen
datos de demo y solo la tabla consulte drogas. Estos requisitos son dependencias
de esta interfaz, no nuevos permisos exigidos por los endpoints del backend.
Los listados y borrados no requieren leer catálogos relacionados.

Los siete hooks de opciones comprueban su `view`, bloquean también `refetch`
manual sin permiso y no entregan datos cacheados de un catálogo no autorizado.
Usuarios, roles y subdecomisos consultan opciones al abrir el formulario; sus
hooks siguen llamándose incondicionalmente. Los guards se sitúan por encima de
las consultas de vista; cada panel de hijos se monta solo con su propio `view`.

### Prerrequisitos mínimos y consumidores

Se añade `/confiscation/detail/:confiscationId` con los campos del padre en solo
lectura y los paneles autorizados de los tres hijos. El listado ofrece
`Ver detalle`. Es necesario porque antes los hijos solo se alcanzaban por
`/edit/:id`, que ahora exige `confiscation.view` y `confiscation.update`.
`/create` exige `view` + `create`. Se conserva `parseRouteId` antes de consultar.
Tras crear, si falta `update`, se navega al detalle autorizado.

`ListSubConfiscation` recibe callbacks opcionales de crear/editar/borrar.
La confirmación de borrado es independiente del formulario: un usuario con
`view` + `delete` puede borrar sin `update` ni permisos de catálogo. Se mantienen
RHF, archivos, contratos HTTP, paginación, invalidación y errores de P03. Se
corrige el comodín existente `/role/` a `/rol/` dentro del módulo protegido.
AGENTS documenta el punto común de autorización. Sin dependencias nuevas.

### Verificación nueva

- **223/223 pruebas Node**: seis nuevas comprobaciones de política, perfiles
  completos con los permisos del JSON de P01, permiso directo, dependencia de
  catálogos, transiciones de sesión y guard real que impide montar el consumidor
  y exige acción de creación. El render SSR usa `noExternal` de iconos MUI para
  resolver su distribución ESM en el cargador de pruebas; no cambia Vite de app.
- Lint sin advertencias, build y sintaxis de **30 recorridos** correctos. Los
  fixtures de sesión de consumidores anteriores declaran permisos explícitos;
  no se cuentan esos recorridos como ejecutados por adaptar sus fixtures.
- Playwright MCP operativo con HTTP **simulado** en contexto aislado:
  [access-control.js](../tests/browser/access-control.js), **7 grupos**. Quince
  rutas directas sin permisos no generan lecturas de dominio; incluye create,
  edit, detalle, dashboard, mapa y gráficos. Rol administrador sin permisos,
  entrada por permiso directo, menú/CRUD, dependencias ausentes, tres perfiles
  completos, tres tipos de hijo y permisos parciales de hijo comprobados.
  Un borrado simulado rechazado con 403 conserva confirmación y no recarga datos.
  Logout por teclado con cero permisos; cero excepciones de página y avisos
  inesperados. Cada navegación de documento renueva sesión una vez; no hay bucle.
  Capturas locales `.playwright-mcp/p04-detail.png` y `p04-denied.png`
  inspeccionadas; solo datos ficticios. Recorrido final repetido tras los cambios
  de menú/semántica de lista, con los mismos siete grupos aprobados.
- Regresión simulada [access-denied.js](../tests/browser/access-denied.js):
  **5 grupos**, 403/401/transporte/500, recuperación explícita, refresh inicial
  rechazado y alta/borrado rechazados. Campos, PNG y diálogos conservados;
  cero excepciones/avisos inesperados. Su fixture ahora permite las acciones
  para alcanzar el rechazo HTTP detrás del guard de P04.
- Comprobaciones reales nuevas: lectura anónima **500**, refresh **500**.
  No se acredita una nueva matriz real de perfiles ni escrituras exitosas.
  Recuperar el backend y repetir selectivamente integración real es pendiente.

El primer intento del recorrido P04 esperaba tres botones visibles dentro de
acordeones colapsados: se corrigió la aserción para contar también sus controles
ocultos. El primer render de prueba SSR necesitó resolver los iconos de MUI;
la configuración de prueba final y la suite completa pasan. No se contaron los
intentos fallidos como verificación aprobada.

Versiones del lock: React **19.3.1**, React Router **7.18.5**, React Redux
**9.2.0**, Query **5.107.1**. Skills React/composición y Context7 consultados:
composición de guards y diferencia entre `enabled` y `refetch` manual. Context7
no indexa estos parches exactos de Router/Query; contrastado con
[Router 7.18.5](https://reactrouter.com/7.18.5/api/components/Routes),
[Query v5](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries)
y [reglas de hooks React 19.3](https://react.dev/reference/rules/rules-of-hooks).
La guía de Query es por versión mayor, no una referencia fijada al parche.

P05 sigue sin ejecutar: revocación/asignación en sesión abierta, actualización
de permisos y limpieza específica tras revocación. No se afirma que ocultar una
vista cancele una escritura aceptada por el servidor. No se avanzó P06–P15,
se preservó la demo precargada y no hubo commits, despliegues ni cambios de roles.

## P03 — Presentación de rechazos (11 de noviembre de 2026)

Implementado únicamente P03. `AccessDenied` presenta una alerta persistente,
con título asociado y acciones compuestas por el consumidor; no administra
permisos, sesión ni navegación. `ApiRequestError` coordina reintento explícito
y cierre de sesión con el thunk existente; si falla logout, conserva la sesión
y muestra el error. Se integra en listados administrativos, dashboard, detalle
de decomiso, análisis y estados de opciones. Las escrituras mantienen su error
dentro del formulario/confirmación, sin desmontarlos ni invalidar por fracaso.
El botón de logout del layout tiene ahora nombre accesible «Cerrar sesión».

### Contratos y clasificación

Respuestas actuales de API real `http://localhost/api`, sin interceptaciones:

| Escenario | HTTP | Cuerpo completo de error observado |
| --- | --- | --- |
| Lectura de drogas sin sesión | 401 | `{ "error": "No autenticado", "code": 401 }` |
| Lectura de drogas sin permisos | 403 | `{ "error": "User does not have the right permissions.", "code": 403 }` |
| Alta de droga sin permisos | 403 | El mismo cuerpo 403; rechaza antes de validar el payload |

El interceptor sigue rechazando con el mismo body, sin envolverlo, mutarlo ni
convertirlo en éxito. Una `WeakMap` privada relaciona cuerpos objeto con su estado
HTTP y causa Axios original; `getApiErrorCause` permite recuperar esa causa.
Los metadatos no se copian a Redux ni se agregan al JSON. El estado HTTP tiene
prioridad sobre `code` del body; sin metadatos se aceptan códigos HTTP numéricos,
incluidos los cuerpos reales anteriores, y `response.status` de AxiosError.
No se deduce autorización de textos traducidos ni del nombre de un rol.

`getApiErrorMessage`/`getApiErrorText` conservan sus tipos públicos. Distinguen
403 (permiso), 401 (autenticación), transporte sin respuesta y 5xx (servidor).
Los mensajes de campos bajo `error` mantienen su precedencia/forma, con soporte
adicional para `errors` de Laravel; `setServerFormErrors` conserva su contrato.
Los errores locales permanecen genéricos. Los cuerpos primitivos opacos
(por ejemplo HTML/string) siguen rechazándose intactos y muestran el mensaje
genérico: no se les inventa un estado ni se usa un mapa global por texto que
pueda confundir peticiones. Los contratos JSON observados sí conservan estado
y causa incluso si el body omite `code`.

### Sesión y salida

Un 403 de operación no llama a refresh ni a logout, ni redirige. No se introduce
una actualización automática de permisos; Query mantiene su política existente
sin reintentos automáticos. En el chequeo inicial, `checkAuthToken` propaga 403
sin ejecutar `onLogout`; `AppRouter` muestra recuperación mientras continúa en
`checking`, con reintento manual y cierre de sesión, sin montar consultas de
vistas protegidas. El tratamiento anterior de otros fallos de ese chequeo se
conserva; P03 no redefine globalmente la política de renovación de sesión.

La salida garantizada es cerrar sesión. No se ofrece dashboard, historial ni
otra ruta que requiera permisos aún no comprobados. La presentación permite
componer una salida validada por futuros guards. Menú, rutas y acciones siguen
pendientes de P04; no se ha implantado su matriz. La limpieza de datos retenidos
tras revocar permisos y la renovación de permisos durante la sesión pertenecen
a P05; no se acreditan aquí. No se cambia la cuenta de demo ni sus asignaciones.

### Verificación P03

- `tests/api-errors.test.mjs`: clasificación con/sin código, prioridad HTTP,
  identidad y causa de cuerpos congelados, validación por campo, lecturas y
  escrituras 403 sin éxito/invalidación/salida de sesión, y refresh 403 desde
  sesión autenticada o estado inicial. Se conserva la cobertura previa.
- Playwright MCP, [recorrido real](../tests/browser/access-denied-real.js):
  **3 grupos aprobados**, 401/403 de la tabla, cuenta temporal con cero permisos,
  alerta etiquetada y persistente, acciones accesibles por Tab, URL estable,
  un único refresh inicial y logout real hasta login. Un usuario temporal creado
  y eliminado en `finally`; no se crean drogas ni se modifican roles/cuentas
  existentes. Auditoría del servidor conservada, cero excepciones de página.
- Playwright MCP, [recorrido simulado](../tests/browser/access-denied.js):
  **5 grupos aprobados**, 403 sin código, 401/500/transporte diferenciados y
  recuperación del listado; alta con 403/422/transporte/500 conserva texto,
  archivo PNG y modal, cinco envíos con el mismo archivo hasta éxito; borrado
  403 conserva selección/confirmación y reintento exitoso; refresh inicial 403
  no monta consultas protegidas y se recupera manualmente. Ocho lecturas, cinco
  altas y dos borrados simulados; tres refresh (inicial, rechazo de arranque y
  reintento), cero logout, cero excepciones/avisos inesperados. Contextos cerrados
  en `finally`, sin interceptaciones en la sesión administrativa real.
- Captura local `.playwright-mcp/p03-access-denied-real.png` inspeccionada:
  título, texto y acciones legibles, con foco visible. Recorrido breve de teclado;
  no equivale a una auditoría WCAG ni de lector de pantalla completa.
- Los primeros intentos del script simulado usaban un nombre de botón incorrecto
  y buscaban la tabla sin incluir elementos ocultos por el modal; se corrigieron
  los selectores. Esos intentos no se cuentan como recorridos aprobados.

Skills React/composición aplicadas a estado derivado y acciones por children.
Versiones resueltas: React 19.3.1, Axios 1.21.0, MUI 6.4.7, Router 7.18.5 y
Query 5.107.1. Context7 consultado para interceptores y accesibilidad de Alert;
no ofrece exactamente Axios 1.21.0/MUI 6.4.7. Contraste con las fuentes oficiales
de [errores Axios](https://axios-http.com/docs/handling_errors) y
[Alert MUI v6](https://v6.mui.com/material-ui/react-alert/), y con el cliente
instalado mediante pruebas. No se actualizan dependencias.

Resultados finales de suite/lint/build y continuidad en
[portfolio-progress.md](portfolio-progress.md#p03--acceso-denegado-y-errores-11-de-noviembre-de-2026).
P04/P05 y la decisión de política del operador siguen pendientes.

## P01 — Revalidación con Laravel actualizado

**186/186 comprobaciones aprobadas según las asignaciones actuales del backend**:
74 respuestas 200, 29 respuestas 401 y 83 respuestas 403. La API ya restringe
las operaciones probadas por permisos; el resultado anterior de 22 accesos
indebidos queda como evidencia histórica, no como diagnóstico actual.

Se usó API real `http://localhost/api` mediante Playwright MCP, sin
interceptaciones, y frontend del workspace en 5174. Los IDs de roles/permisos
se resolvieron por nombre desde los catálogos paginados actuales. Se mantuvieron
catálogo, usuarios existentes y sus asignaciones. Los usuarios preparados por
el usuario no se modificaron: los perfiles se probaron con cuentas temporales
y sesiones nuevas aisladas, como requiere P01.

| Perfil | Comprobaciones | Resultado |
| --- | --- | --- |
| Sin sesión | 29 | 401 en todas |
| Sin roles/permisos | 31 | Login/refresh correctos; operaciones protegidas 403 |
| Analista | 31 | Lecturas/análisis permitidos; escrituras 403 |
| Operador | 31 | Respuestas acordes a sus 27 permisos efectivos |
| Administrador | 31 | Operaciones probadas permitidas |
| Solo permiso directo `drug.view` | 31 | Lectura de drogas permitida; demás operaciones 403 |
| Preflight administrativo de los dos lotes | 2 | Refresh correcto antes de escribir |

Se comprobaron listados de los once dominios CRUD y actividad, detalle de
decomiso, tres sublistas por padre, los tres endpoints de gráficos y el mapa.
Las escrituras representativas cubren `permission`, `confiscation`, `drug` y
`drugConfiscation`: alta, edición y borrado por cada perfil. Incluyen JSON,
archivo PNG multipart, POST con `_method=PUT` y relaciones de un hijo con
decomiso/droga/presentación. La respuesta de edición autorizada del hijo
conservó esas relaciones y devolvió la cantidad nueva. Los objetivos de
edición/borrado se prepararon con la sesión administrativa, independientemente
de que el perfil pudiera crear o leer. Login y refresh coincidieron con roles
y permisos asignados en los cinco perfiles autenticados.

### Diferencias entre la propuesta y las asignaciones actuales

Los éxitos anteriores se comparan con los permisos actuales consultados, no
certifican que las asociaciones sean idénticas a la propuesta original:

- `administrador`: 73 permisos, los 48 del proyecto y 25 antiguos adicionales.
- `analista`: 11 permisos; coincide con la propuesta.
- `operador`: 27 frente a los 23 propuestos. Añade `create`/`update` de
  `drug`, `drugPresentation`, `weapon` y `ammunition`; no tiene `delete` de
  `confiscation`, `drugConfiscation`, `weaponConfiscation` ni
  `ammunitionConfiscation`. En la matriz, crear/editar drogas devuelve 200 y
  borrar decomisos/hijos devuelve 403, de acuerdo con esa asignación real.

No se corrigieron asociaciones para hacer pasar las pruebas. Antes de P04
conviene confirmar si esta política actual de operador es la deseada. El
manifest original se conserva identificado como propuesta/histórico; el JSON
de P01 incluye el catálogo de roles observado y sus diferencias nominales.

### Limpieza, incidencias y límites de P01

- Dos lotes informados: **92/92 y 94/94**, con **16 + 23 fixtures eliminados**
  por sus IDs en `finally`, hijos antes que padres/catálogos. Cero fallos de
  limpieza. La auditoría del servidor se conserva.
- Cinco lecturas finales independientes devuelven total cero para el prefijo
  `PORTFOLIO_RBAC_P01_` en usuarios, permisos, drogas, presentaciones y decomisos.
  Una comprobación adicional de refresh sin sesión devuelve 401. Estas seis
  comprobaciones pasan y se contabilizan separadas de las 186 de la matriz.
- Los primeros intentos detectaron sesión sin permisos y, después, rol
  administrador sin permisos efectivos. Tras las actualizaciones de Laravel
  realizadas por el usuario, refresh devolvió los permisos necesarios.
- La llamada inicial con los seis perfiles excedió el límite MCP de 300 s;
  sus aserciones no se recuperaron ni se cuentan como aprobadas. Después se
  observaron los contextos cerrados y el usuario temporal ausente. Se repitió
  por lotes de tres con informe recuperable sin credenciales. Las lecturas
  finales por prefijo cubren también posibles registros de ese intento.
- Peticiones espaciadas al menos 1,25 s, incluidos montaje y limpieza, sin
  reintentos automáticos de escrituras. Los dos lotes informados no recibieron
  429. La sesión administrativa precisó nuevo login para las lecturas finales;
  este devolvió 200 y 73 permisos. No se atribuye una causa a la pérdida de sesión.
- Sintaxis Node del recorrido y lint con cero advertencias: correctos. Build
  TypeScript/Vite correcto en esta ejecución; restaurado el artefacto generado
  de TypeScript. Se reutiliza la suite previa de 208 pruebas porque aplicación
  y dependencias no cambian; no se cuenta como una ejecución nueva.
- JSON, conteos, ausencia de campos de credenciales en el informe estructurado,
  enlaces actuales de P01 y diff comprobados. Los enlaces de antiguas entradas
  del progreso a implementaciones retiradas se conservan como historia.
- Context7 consultado para cookies compartidas de `BrowserContext.request`,
  aislamiento, multipart y reintentos de Playwright. El lanzador fija MCP
  0.0.84; Playwright no está instalado en el lockfile de la app. La documentación
  consultada es general y no acredita una versión resuelta de su dependencia
  transitiva. No se introducen librerías ni cambios React.
- Las escrituras son representativas; no prueban todo el CRUD de cada
  controlador. `dashboard.view` no tiene endpoint propio. No se verifican aquí
  guards de frontend, revocación en vivo, producción ni seguridad integral.
  Tampoco se acredita eliminación física de medios desde este workspace.

Evidencia nueva separada:
[resultados estructurados de P01](verification-access-control-p01-results-2026-11-10.json).
Recorrido: [verify-real-access.js](../tests/browser/verify-real-access.js).
Para repetir, seleccionar hasta tres perfiles mediante
`window.__P01AuditProfiles` en la página administrativa antes de ejecutar el
archivo con Playwright MCP. El valor por defecto es
`['sin_sesion', 'sin_rol', 'analista']`; el segundo lote usa
`['operador', 'administrador', 'permiso_directo']`. Cada lote monta y limpia sus
propios fixtures. `window.__P01AuditReport` conserva un informe saneado al
terminar cada perfil y después de la limpieza, mientras no se recargue la página.

## Actualización anterior a P01 (histórica)

El usuario informa que renombró roles/permisos eliminando el prefijo de
aplicación y que ya aplicó los permisos a las acciones de los controladores
Laravel. Se normalizan los nombres en este informe, su JSON de resultados,
el catálogo y los recorridos. IDs y asociaciones se conservan como referencia
del entorno original. **No se ha repetido la matriz tras ese cambio**: las
respuestas HTTP descritas abajo corresponden a la ejecución anterior.

## Resultado de la ejecución anterior

Se crearon **48 permisos y tres roles persistentes**, autorizados por el usuario.
Las relaciones se guardan correctamente y el login/refresh devuelve los permisos
del rol o los directos según cada perfil probado. Sin embargo, **los endpoints
probados no hacen cumplir las restricciones por permisos**. La interfaz tampoco
restringe la ruta administrativa probada ni el botón de creación.

Catálogo exacto, IDs y política propuesta para documentar el backend:
[frontend-roles-permissions.md](frontend-roles-permissions.md).
Asociaciones completas por nombre e ID:
[frontend-access-control.json](frontend-access-control.json).

## Entorno y cambios persistentes

- API real `http://localhost/api`, frontend del workspace en
  `http://localhost:5174`, Playwright MCP operativo y sin interceptaciones.
- Se reutilizó la sesión autenticada existente para el aprovisionamiento.
  No se registraron credenciales/cookies en archivos ni salidas.
- Antes: 25 permisos y cuatro roles con nombres de datos de ejemplo.
  Después: **73 permisos y siete roles**, incluidos:

| ID | Rol nuevo | Permisos asociados |
| --- | --- | --- |
| 5 | `administrador` | 48 |
| 6 | `operador` | 23 |
| 7 | `analista` | 11 |

- Permisos nuevos con IDs **26–73**; listado nominal en el documento enlazado.
  Nombres y asociaciones se verificaron mediante nuevas lecturas del catálogo.
- No se modificaron roles/permisos anteriores ni se asignaron los nuevos roles
  a usuarios existentes. Los IDs son específicos de esta base de datos.
- Se consultó OpenAPI local en `/api/docs?api-docs.json`, descubierto desde
  `/api/documentation`. Sus operaciones publican autenticación `bearerAuth`,
  sin especificar una política de permisos por acción. Se respetaron los
  endpoints/payloads de los services existentes.

## Prueba de autorización real

Se creó un usuario temporal sin relaciones y se probaron cinco configuraciones
sucesivas mediante contextos de navegador independientes. Cada configuración
se asignó explícitamente al usuario temporal, con login nuevo y refresh:

| Perfil | Permisos devueltos | Login y refresh coinciden con la asignación |
| --- | --- | --- |
| Sin roles ni permisos | 0 | Sí |
| `analista` | 11 | Sí |
| `operador` | 23 | Sí |
| `administrador` | 48 | Sí |
| Sin rol, permiso directo `drug.view` | 1 | Sí |

En cada perfil se ejecutaron siete operaciones:

| Operación | Resultado observado en los cinco perfiles |
| --- | --- |
| `GET /api/drug` | 200 |
| `GET /api/confiscation` | 200 |
| `GET /api/user` | 200 |
| `GET /api/permission` | 200 |
| `GET /api/activity` | 200 |
| `POST /api/permission` con nombre temporal | 200, creación confirmada |
| `POST /api/confiscation` con datos ficticios | 200, creación confirmada |

**35 comprobaciones: 13 coinciden con los accesos previstos y 22 fallan porque
se esperaba denegación 403.** No hubo errores 429 en este recorrido. La evidencia
no se presenta como una suite de autorización aprobada. Los accesos sin sesión
devuelven 401 según la verificación real anterior, que sigue vigente; el fallo
está en las restricciones dentro de una sesión autenticada.

Con el perfil sin rol se abrió además el frontend en `/user`: se mostraron
siete filas de datos visibles en el grid y el botón de creación. No se exportaron
los datos personales. La revisión del código confirma que AppRouter distingue
solo autenticación y GraphLayout publica el menú sin consultar permisos. Esta
tarea no incorporó guards ni cambios en formularios/controles.

Resultados estructurados, sin credenciales ni datos personales:
[verification-access-control-results-2026-11-10.json](verification-access-control-results-2026-11-10.json).

## Limpieza y comprobaciones

- Se eliminaron los cinco permisos temporales y los cinco decomisos temporales
  que el backend permitió crear, además del usuario temporal. Once limpiezas
  confirmadas, sin fallos. La auditoría real de estas acciones se conserva.
- Lectura final independiente de esa ejecución: 48 permisos creados, 73 permisos
  totales, siete roles y asociaciones 48/23/11; cero permisos, usuarios o
  confiscaciones temporales con prefijo `PORTFOLIO_RBAC_`.
- Se mantienen los cambios documentales y recorridos de la tarea anterior.
  No se cambia aplicación, configuración local, dependencias ni código del
  backend. Se añaden dos recorridos manuales de aprovisionamiento/verificación
  y los documentos de esta tarea. Vite permanece en el puerto 5174.
- Lint con `--max-warnings 0`, sintaxis Node de ambos recorridos y
  `git diff --check`: correctos. Se reutilizan las 208 pruebas y el build
  aprobados de la verificación anterior: el código de aplicación y sus
  dependencias no cambian; los recorridos manuales no se incluyen en el bundle
  ni en `npm test`. No se cuentan como nuevas ejecuciones.
- Un primer intento de cargar el script de aprovisionamiento falló por el
  punto y coma final que no admite el evaluador MCP; no realizó peticiones ni
  creó registros. Corregido antes de la ejecución real aprobada.

## Pendientes de la ejecución anterior (históricos; ver P01 arriba)

1. Volver a verificar la autorización que el usuario indica haber implementado
   en los controladores Laravel, esperando 403 cuando falte permiso. No hay
   código del backend en este workspace; no se acredita aquí su implementación
   ni su resultado mediante una nueva ejecución.
2. Conectar permisos de sesión a rutas, menú y acciones del frontend, incluyendo
   entrada directa por URL y dependencias de catálogos. Conservar la comprobación
   del servidor para todas las operaciones.
3. Repetir la matriz esperando 403, ampliar a editar/borrar y a los demás dominios,
   y comprobar revocación durante una sesión abierta. Aquí se probaron altas,
   lecturas y propagación de asignaciones con sesiones nuevas; no se acredita
   cobertura de todas las acciones ni de revocación en vivo.

La creación y verificación originales quedan registradas. Tras los cambios
reportados por el usuario, quedan pendientes una nueva comprobación del backend
y la integración de permisos en la interfaz.

## Pendientes de prioridad media del proyecto

Se incluyen aquí para que esta lista no quede limitada a los tres bloques de
autorización. Estado centralizado en [portfolio-progress.md](portfolio-progress.md)
y prompts completos en [portfolio-plan.md](portfolio-plan.md):

- **P03 — Acceso denegado:** completado; evidencia y límites en la sección P03.
- **P08 — Recuperación de errores:** frontera para renderizado y vistas lazy.
- **P09 — Página no encontrada:** vista 404 y navegación de recuperación.
- **P11 — Revisión visual y accesible:** móvil, teclado, foco y formularios.
- **P13 — CI:** pruebas, lint y build como requisitos del despliegue.
- **P14 — Despliegue público:** comprobar HTTPS, cookies, CORS, imágenes y rutas.

**Excepción del usuario:** el acceso precargado del login se conserva para que
los visitantes puedan entrar a la demo publicada. No es un pendiente retirarlo
ni sustituirlo. La preparación/documentación de datos y recorrido de demo sigue
en P12, respetando ese acceso intencional.
