# Verificación de roles y permisos — 10 de noviembre de 2026

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

- **P03 — Acceso denegado:** presentar 403 y distinguirlo de 401 y transporte.
- **P08 — Recuperación de errores:** frontera para renderizado y vistas lazy.
- **P09 — Página no encontrada:** vista 404 y navegación de recuperación.
- **P11 — Revisión visual y accesible:** móvil, teclado, foco y formularios.
- **P13 — CI:** pruebas, lint y build como requisitos del despliegue.
- **P14 — Despliegue público:** comprobar HTTPS, cookies, CORS, imágenes y rutas.

**Excepción del usuario:** el acceso precargado del login se conserva para que
los visitantes puedan entrar a la demo publicada. No es un pendiente retirarlo
ni sustituirlo. La preparación/documentación de datos y recorrido de demo sigue
en P12, respetando ese acceso intencional.
