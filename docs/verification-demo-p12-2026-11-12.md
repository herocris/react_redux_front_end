# P12 — Datos y recorrido de demostración

Verificación del 12 de noviembre de 2026 sobre workspace inicialmente limpio.
Se leyeron AGENTS y los planes/progresos de refactorización y portafolio.
Se ejecutó únicamente P12. El login y las asignaciones existentes se conservaron.

## Entorno y entregables

Frontend Vite de desarrollo en `http://localhost:5174`, API real en
`http://localhost/api`, medios en `http://localhost/storage`. Playwright MCP
activo y usado, con navegador a 1440 × 1000 en el recorrido final.

- [Guía de demo](demo-guide.md), con recorrido corto, capacidades efectivas,
  separación de fixtures, preparación y procedimiento de restablecimiento.
- [Definición ficticia](demo-data-p12.json) e
  [inventario persistente local](demo-inventory-p12-local-2026-11-12.json).
- `scripts/prepare-demo-p12.js`, preparación explícita con services existentes,
  preflight de permisos y duplicados, inventario incremental y rollback de IDs
  confirmados si falla. Se conserva el conjunto después de completar la operación.
- `tests/browser/demo-p12.js`, recorrido de consulta y autenticación con API real.

Se crearon cuatro catálogos propios, dos padres y seis hijos. Las diez imágenes
son PNG generados con canvas y rotulados «DEMO / Imagen ficticia». Definición
e inventario conservan datos ficticios y referencias públicas de esos registros.
Los documentos y el preparador conservan datos ficticios y referencias públicas.
El recorrido incluye credenciales ficticias inválidas para verificar el rechazo
y toma el acceso precargado desde la interfaz, conservando sus valores en el login.

## Preparación y comprobaciones reales

| Comprobación | Resultado |
| --- | --- |
| Login con dos campos precargados | HTTP 200, destino `/dashboard`. |
| Sesión efectiva | `administrador`, 73 permisos; 48 del proyecto y 25 históricos. |
| Preparación de datos | 12 registros nuevos, seis relecturas iniciales de sublistas correctas. |
| Inventario | Comparación exacta con la respuesta original conservada en sessionStorage aprobada. |
| Persistencia independiente | 12/12 registros releídos; IDs, descripciones, campos de padres, cantidades, pesos y relaciones de padre correctos. |
| Medios | 10/10 PNG decodificados como imágenes de 240 × 160, diez respuestas HTTP 200 observadas. |
| Análisis de noviembre | Drogas 5, armas 3 y municiones 30, filtrando los IDs propios. |
| Mapa API | Dos puntos con IDs 5028/5029 y observaciones propias. |
| Segunda preparación | Se detiene en preflight con `Existing DEMO_P12_V1 records in drug`. |

El script de preparación usa POST para crear los datos propios. Su primera
ejecución completó con `complete: true`, doce IDs y ninguna limpieza necesaria.
La segunda se detuvo en la primera lectura antes de escribir. Los registros de
demo permanecen guardados. Se preservaron los usuarios, las asignaciones y el
contenido anterior. Login/logout producen los efectos normales de sesión y
las operaciones pueden generar auditoría del backend.

## Recorrido final de navegador

Ejecutar con Playwright MCP `browser_run_code_unsafe` y
`filename: "tests/browser/demo-p12.js"`, desde una pestaña autenticada del Vite
local después de preparar el conjunto. El login adicional usa una ventana de
contexto independiente y toma los valores precargados de la interfaz. Ese
contexto se cierra en `finally`.

| Grupo | Resultado |
| --- | --- |
| Panel → listado descendente → detalle B y tres acordeones | Aprobado. |
| Ocho rutas de catálogos/administración, únicamente consulta | Aprobado. |
| Filtros de gráfico por UI y tabla con total ficticio 5 | Aprobado. |
| Navegación por menú al mapa, filtros compartidos y dos puntos | Aprobado. |
| Ruta desconocida con página 404 | Aprobado. |
| Visitante por URL privada, API anónima e intento de login ficticio inválido | Redirección a login y dos rechazos HTTP 401 esperados. |
| Login precargado, recarga de sesión y logout | HTTP 200 en login/logout y panel conservado tras recarga. |

Los siete grupos pasaron. El recorrido carece de interceptaciones y escrituras
de entidades. Las peticiones a API de la pestaña principal carecieron de fallos
HTTP en la ejecución final. Se observaron cero excepciones JS en las dos páginas
monitorizadas. La consola principal de los recorridos mostró el 401 de `/refresh`
anónimo al arrancar, sin advertencias. Las operaciones rechazadas corresponden
a autenticación anónima o inválida. El acceso actual incluye los permisos del
proyecto; P12 conserva esa situación y remite la matriz 403 a P01/P04/P05.

## Incidencias de los intentos iniciales

- El primer recorrido buscaba los datos recientes en el listado ascendente.
  Se añadió el orden descendente por `id`. Un selector posterior coincidía
  también con `municipalidad`; se acotó por el campo de la columna.
- El script esperaba el botón de apertura del menú aunque la navegación de
  escritorio ya estaba visible. Se usa directamente el botón Mapa a 1440 px.
  Se repitió el recorrido completo después de corregir esos selectores.
- Dos intentos de guardar el inventario desde el proceso del MCP encontraron
  importación dinámica de Node y `require` indisponibles. Se guardó mediante
  la herramienta de edición del workspace y se comparó exactamente con la
  respuesta original. La preparación de datos ya había completado con éxito.
- Un sondeo adicional usó `fetch` para leer los bytes de una imagen entre
  orígenes y encontró ausencia de `Access-Control-Allow-Origin` en `/storage`.
  Los dos mensajes de consola de ese sondeo son CORS y `ERR_FAILED`. Se verificó
  después el uso real de imágenes con `Image.decode()`, dimensiones y estados
  HTTP observados, con diez éxitos. La lectura de bytes mediante fetch desde
  el frontend queda fuera de las garantías acreditadas.
- `git restore` del artefacto TypeScript encontró el límite de escritura de
  `.git` del sandbox. La repetición con aprobación restauró el archivo generado.

## Comprobaciones automatizadas

`npm.cmd test` pasó **261/261 pruebas**, cero fallos, omitidas o canceladas.
`npm.cmd run lint` y `npm.cmd run build` terminaron correctamente. Se comprobaron
la sintaxis de ambos scripts, los JSON, los enlaces de los documentos nuevos
y el diff. La revisión global encontró dos enlaces históricos preexistentes
a `LegacyEntityList.tsx` y `useEntityList.tsx`, retirados durante la migración.
El artefacto `tsconfig.app.tsbuildinfo` generado se restauró. La aplicación y
sus dependencias conservan su implementación previa.

## Estado entregado y pendientes

Los doce registros persisten en la API local y tienen un inventario revisable.
Los fixtures de pruebas permanecen en sus recorridos históricos y usan sus
prefijos propios. La guía define limpieza por IDs, orden de hijos/padres/catálogos,
relectura y nueva preparación. El ciclo completo de borrado/recreación y los
fallos parciales del preparador quedan pendientes de ensayo.

Para publicar este conjunto falta prepararlo contra la API de destino y generar
su inventario. Si se opta por un seeder Laravel, debe crear únicamente este
conjunto ficticio, resolver IDs actuales y preservar cuentas y asignaciones.
La retirada física de medios requiere revisión y procedimiento backend acotado
a las diez referencias del inventario, con comprobación posterior. P07 ya
acreditó que borrar un registro puede dejar su archivo accesible.

El restablecimiento automático y atómico requiere una implementación backend
específica. Los endpoints actuales permiten el procedimiento manual descrito.
Se mantienen los límites P05/P06/P07 y la comprobación pública pendiente de P14.
P13 es la siguiente tarea disponible. Esta ejecución deja cambios locales.

Consolidación solicitada por el usuario. `a3f40e5` registra la definición y los
scripts P12. La guía, el inventario, este informe y ambos progresos se consolidan
en un segundo commit documental. Se reutilizan las 261 pruebas, lint, build y
recorridos del mismo código. Se revisan el diff y el índice de ambos commits.
Los pendientes descritos conservan su estado y P13 sigue pendiente.
