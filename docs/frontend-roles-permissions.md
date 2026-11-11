# Roles y permisos del frontend

Creación real: **10 de noviembre de 2026**, API `http://localhost/api`.
Convención actual: roles `administrador`, `operador` y `analista`; permisos
`<dominio>.<acción>`, sin prefijo de aplicación. El usuario confirmó el mismo
cambio de nombres y la aplicación de permisos en los controladores Laravel.
P01 revalidó la autorización: 186/186 comprobaciones de la matriz pasan según
las asignaciones actuales; véase el [informe](verification-access-control-2026-11-10.md).
Se crearon **48 permisos y 3 roles** y se consultaron nuevamente para comprobar
sus asociaciones. Los IDs son los de este entorno; para seeders o migraciones
resolver por nombre, sin asumir los mismos IDs en otra base de datos.

Definición completa y asociaciones por nombre/ID en
[frontend-access-control.json](frontend-access-control.json).

## Roles creados y propuesta original (referencia histórica)

| ID | Nombre exacto | Permisos | Alcance previsto |
| --- | --- | --- | --- |
| 5 | `administrador` | 48 | Administración, catálogos, decomisos, análisis y auditoría. |
| 6 | `operador` | 23 | CRUD de decomisos e hijos; lectura de catálogos, dashboard, gráficos y mapa. |
| 7 | `analista` | 11 | Lectura de catálogos, decomisos e hijos, dashboard, gráficos y mapa. |

Durante el aprovisionamiento original ningún usuario existente recibió estos roles. Se conservan los cuatro roles y
los 25 permisos anteriores. La cuenta temporal de verificación no forma parte
de los datos permanentes.

## Asignaciones observadas en P01

El usuario preparó tres usuarios con sus roles antes de la revalidación. P01
no los modifica: usa cuentas temporales y consulta los IDs actuales por nombre.
`administrador` tiene 73 permisos (48 del proyecto y 25 antiguos), `operador`
tiene 27 y `analista` 11. El operador actual puede crear/editar los cuatro
catálogos y no borrar decomisos/hijos, a diferencia de la propuesta de la tabla.
Confirmar esa diferencia antes de implementar P04. No se ajustan asociaciones
para hacer coincidir la prueba con una propuesta antigua.

La matriz y el JSON de este catálogo conservan la propuesta original y sus IDs
históricos. La evidencia actual y las diferencias por nombre están en
[los resultados de P01](verification-access-control-p01-results-2026-11-10.json).

## Permisos creados

`view`: consultar listado/detalle/opciones o visualizar análisis.
`create`: crear; `update`: editar; `delete`: borrar.
Se conservan los nombres de dominio actuales, incluidos los camelCase.

| ID | Nombre exacto |
| --- | --- |
| 26 | `user.view` |
| 27 | `user.create` |
| 28 | `user.update` |
| 29 | `user.delete` |
| 30 | `role.view` |
| 31 | `role.create` |
| 32 | `role.update` |
| 33 | `role.delete` |
| 34 | `permission.view` |
| 35 | `permission.create` |
| 36 | `permission.update` |
| 37 | `permission.delete` |
| 38 | `drug.view` |
| 39 | `drug.create` |
| 40 | `drug.update` |
| 41 | `drug.delete` |
| 42 | `drugPresentation.view` |
| 43 | `drugPresentation.create` |
| 44 | `drugPresentation.update` |
| 45 | `drugPresentation.delete` |
| 46 | `weapon.view` |
| 47 | `weapon.create` |
| 48 | `weapon.update` |
| 49 | `weapon.delete` |
| 50 | `ammunition.view` |
| 51 | `ammunition.create` |
| 52 | `ammunition.update` |
| 53 | `ammunition.delete` |
| 54 | `confiscation.view` |
| 55 | `confiscation.create` |
| 56 | `confiscation.update` |
| 57 | `confiscation.delete` |
| 58 | `drugConfiscation.view` |
| 59 | `drugConfiscation.create` |
| 60 | `drugConfiscation.update` |
| 61 | `drugConfiscation.delete` |
| 62 | `weaponConfiscation.view` |
| 63 | `weaponConfiscation.create` |
| 64 | `weaponConfiscation.update` |
| 65 | `weaponConfiscation.delete` |
| 66 | `ammunitionConfiscation.view` |
| 67 | `ammunitionConfiscation.create` |
| 68 | `ammunitionConfiscation.update` |
| 69 | `ammunitionConfiscation.delete` |
| 70 | `dashboard.view` |
| 71 | `graph.view` |
| 72 | `map.view` |
| 73 | `activity.view` |

## Matriz propuesta originalmente

| Recurso | Administrador | Operador | Analista |
| --- | --- | --- | --- |
| user, role, permission | CRUD | Sin acceso | Sin acceso |
| activity | Ver | Sin acceso | Sin acceso |
| drug, drugPresentation, weapon, ammunition | CRUD | Ver | Ver |
| confiscation, drugConfiscation, weaponConfiscation, ammunitionConfiscation | CRUD | CRUD | Ver |
| dashboard, graph, map | Ver | Ver | Ver |

Las autorizaciones efectivas son la unión de permisos directos y permisos de
roles. No se usa el nombre del rol como bypass. Sin permisos, el acceso previsto
a recursos protegidos es denegado; sin sesión se espera 401.

## Correspondencia para el backend

- `GET` de listados, detalles y opciones: `<dominio>.view`.
- `POST` de creación: `<dominio>.create`.
- `PUT/PATCH`, incluido multipart con `_method=PUT`: `<dominio>.update`.
- `DELETE`: `<dominio>.delete`.
- Roles: dominio `role`, endpoint `/api/role`; la ruta del frontend sigue siendo `/rol`.
- Auditoría: `GET /api/activity` requiere `activity.view`.
- Gráficos: `GET /api/drugGraphIndex`, `weaponGraphIndex` y
  `ammunitionGraphIndex` requieren `graph.view`.
- Mapa: `GET /api/confiscation/map` requiere `map.view`.
- Sublistas por padre: permiso `view` del tipo de hijo correspondiente.
- `dashboard.view` representa una vista del frontend; no hay endpoint
  propio del dashboard. Sus peticiones necesitan además los permisos de los
  dominios que consumen.

Estos nombres se registraron como catálogo y política propuesta. Registrar un
permiso no configura middleware/policies ni oculta controles de la interfaz.
La verificación histórica detectó ausencia de restricciones en los endpoints
probados y en la ruta administrativa del frontend. P01 revalidó las acciones
representativas tras los cambios Laravel: ahora responden según los permisos
efectivos, con 401/403/200 esperados. La integración de permisos en rutas,
menú y acciones del frontend sigue pendiente. La evidencia histórica está en el
[informe de autorización](verification-access-control-2026-11-10.md).

## Reproducción

[provision-frontend-access.js](../tests/browser/provision-frontend-access.js)
es un recorrido manual de Playwright MCP desde una sesión autenticada con
capacidad administrativa. Crea por nombre solo los registros ausentes y verifica
las asociaciones; no modifica usuarios existentes ni roles preexistentes con
otra definición. No guarda credenciales. Espacia peticiones para el límite de
60/minuto. Un fallo de aprovisionamiento devuelve los registros que llegó a crear.

[verify-real-access.js](../tests/browser/verify-real-access.js) comprueba perfiles
sin rol, analista, operador, administrador y permiso directo mediante una cuenta
temporal y contextos separados, además de sin sesión. Se ejecuta en dos lotes
de hasta tres perfiles para no exceder 300 s de MCP; configuración en el informe.
Efectúa escrituras representativas de alta/edición/borrado y las elimina en
`finally`; la auditoría de esas acciones permanece en el servidor.
