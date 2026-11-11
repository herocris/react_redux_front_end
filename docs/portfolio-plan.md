# Preparación del proyecto para portafolio

Este plan reúne los pendientes de presentación, integración y autorización.
Es posterior a los 16 pasos de refactorización ya cerrados; no los reabre.
Se ejecuta **una tarea por chat**, en el orden propuesto cuando sus dependencias
lo requieran. El estado está en [portfolio-progress.md](portfolio-progress.md).
Preparar estos prompts no significa haber implementado ninguna tarea.

La lista con prioridades está en [portfolio-progress.md](portfolio-progress.md).
Incluye los pendientes de prioridad media. **Excepción acordada:** el acceso
precargado del login es intencional para la demo pública; no se debe retirar
ni tratar como defecto. P12 cubre únicamente datos y documentación de la demo.

## Reglas comunes para todos los prompts

- Leer AGENTS.md, el plan/progreso de refactorización y este plan/progreso.
  Contrastar con código, informes y `git status`; conservar cambios existentes.
- Ejecutar solo la tarea solicitada. Reutilizar trabajo vigente; completar
  únicamente prerrequisitos mínimos y registrar cualquier cambio de alcance.
- Aplicar skills y Context7 cuando corresponda según AGENTS.md. SPA React/Vite,
  Redux para sesión/filtros, Query para remoto; no introducir otra copia de
  sesión ni rehacer la migración.
- Roles actuales: `administrador`, `operador`, `analista`. Permisos
  `<dominio>.<acción>`; consultar docs/frontend-roles-permissions.md y su JSON.
  Resolver IDs por nombre desde el backend, no asumir los IDs históricos.
- Backend local usado: http://localhost/api. Frontend en 5174; **5173 pertenece
  al backend**. Comprobar disponibilidad y configuración actuales antes de usar
  esas direcciones. No asumir que un proceso de una conversación sigue activo.
- El usuario informa que aplicó autorización en Laravel. La matriz anterior es
  histórica y no prueba el backend actual. El código Laravel no está en este
  workspace. No declarar arreglado un comportamiento sin verificarlo.
- Ante pruebas reales, usar fixtures identificables y cuentas temporales con
  credenciales efímeras; limpiar solo lo creado para la tarea en `finally`.
  Conservar usuarios/asignaciones existentes y auditoría. Respetar el límite
  observado de 60 solicitudes/minuto; no reintentar escrituras automáticamente.
  No guardar contraseñas/tokens en documentación o Git.
- Ejecutar pruebas apropiadas, lint y build para cambios de código, con navegador
  selectivo según AGENTS.md. No repetir toda la batería sin motivo. Separar
  resultados simulados, reales, históricos y comprobaciones pendientes.
- Al terminar, actualizar **docs/portfolio-progress.md** con alcance, archivos,
  decisiones, comprobaciones reales, límites y siguiente tarea disponible.
  Añadir una entrada breve y enlace en **docs/refactor-progress.md** para mantener
  la continuidad. Actualizar el informe del tema afectado o crear uno fechado
  si hace falta. Conservar evidencia histórica identificada como tal.
- No avanzar automáticamente a otra tarea, crear commits, desplegar o publicar
  por ejecutar un prompt que no incluya esa acción. Los cambios locales y las
  comprobaciones necesarias del paso sí están autorizados por su solicitud.

## P01 — Volver a verificar autorización en backend

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P01.

Lee el catálogo de roles/permisos y el informe de autorización. Repite con
backend real la matriz tras los cambios que el usuario hizo en Laravel.
Comprueba sin sesión, sin permisos, analista, operador, administrador y permiso
directo. Verifica login/refresh y lecturas, altas, ediciones y borrados de
fixtures, incluyendo multipart con _method=PUT, relaciones y análisis.

Inspecciona y adapta verify-real-access.js antes de ejecutarlo: no dependas
de filas visibles ni de lecturas que ahora deben devolver 403. Parte de una
sesión con permisos administrativos suficientes; no amplíes permisos de
usuarios existentes para hacer pasar la prueba. No recrees el catálogo ya
renombrado. Usa IDs actuales y registra 401/403/éxitos esperados por acción.

Si la API impide el montaje/limpieza o falla un contrato, diagnostica y documenta
el bloqueo sin ocultarlo ni cambiar el backend que no está en este workspace.
Conserva la matriz histórica y añade resultados nuevos separados.

Actualiza el informe de autorización y ambos progresos según las reglas comunes.
No implementes controles del frontend ni avances otra tarea.
```

## P02 — Alinear tipos de identificador

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P02.

Contrasta IDs de respuestas reales, OpenAPI disponible, DTO, entidades,
relaciones, formularios, sesión, opciones y parámetros de ruta. Corrige las
discrepancias entre números reales y tipos string sin cambiar el contrato HTTP.
Define explícitamente en qué frontera se convierten los parámetros string de
la URL. Comprueba comparaciones, selección de opciones y claves de Query para
evitar cachés distintas por el mismo ID o relaciones que dejan de seleccionarse.

No uses casts ni uniones generales como sustituto de validar el contrato.
Mantén types.ts compatible donde sea necesario y actualiza consumidores y
pruebas afectadas coordinadamente. Cubre IDs y relaciones representativos,
opciones seleccionadas y navegación a detalle/edición.

Actualiza el informe de contratos/backend y ambos progresos. No amplíes la tarea
a imágenes, paginación o permisos visuales.
```

## P03 — Presentar acceso denegado y distinguir errores

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P03.

Implementa una presentación accesible de acceso denegado reutilizable por
futuros guards. Diferencia 403 de 401, error de transporte y error del servidor.
Contrasta los cuerpos reales: el interceptor Axios puede entregar solo el body.
Preserva los errores de validación, las causas y los contratos existentes.

Un 403 no debe cerrar sesión ni provocar bucles de refresh/redirección. Ofrece
una salida válida, evitando enviar al usuario a otra vista sin permiso. Si no
tiene ninguna vista permitida, debe conservar acceso al cierre de sesión.
Comprueba también mutaciones rechazadas: conservar campos, archivos y diálogo.

Añade pruebas justificadas y un recorrido breve de rechazo/recuperación.
No implantes todavía toda la matriz de rutas/acciones. Actualiza el informe
de autorización y ambos progresos.
```

## P04 — Conectar permisos a rutas, menú y acciones

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P04.

Usa los contratos confirmados en P01/P02 y la presentación de P03. Si falta un
prerrequisito, implementa únicamente lo mínimo y regístralo. Centraliza la
consulta de permisos efectivos desde la sesión Redux existente, sin duplicarla
en Query o contextos. No uses el nombre de un rol como bypass administrativo.

Restringe rutas por view, incluidos enlaces directos y create/edit por URL;
filtra menú y acciones CRUD según sus permisos. Cubre subdecomisos, dashboard,
mapa y gráficos. No dispares consultas de vistas o catálogos no autorizados.
Revisa dependencias: los selectores requieren permisos de sus catálogos y el
dashboard combina recursos. Evita hooks condicionales y guards que llegan
después de iniciar peticiones. Mantén siempre una salida/cierre de sesión.

Comprueba perfiles completos, permiso directo, usuario sin permisos y rechazo
del backend aunque la interfaz hubiera permitido iniciar la acción. El servidor
sigue siendo el propietario de la autorización efectiva.

Actualiza pruebas de sesión/rutas y consumidores afectados, con Playwright
selectivo. Actualiza el informe de autorización y ambos progresos.
```

## P05 — Cambios de permisos durante una sesión abierta

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P05.

Tras P01 y P04, comprueba revocación/asignación de roles y permisos directos
mientras una cuenta temporal mantiene sesión abierta. Incluye usuario parado
en una vista, formulario en edición y lectura/escritura pendiente.

Define una política explícita para actualizar permisos mediante el mecanismo
de sesión existente y reaccionar a 403; evita refrescos en bucle. Coordina Redux,
cancelación y limpieza de consultas afectadas para no seguir mostrando datos
que dejaron de estar permitidos ni publicar respuestas tardías. Diferencia una
revocación de permisos de un cambio real de usuario; no almacenes otra sesión.

Si el backend no refleja revocación en sesión/operaciones, registra la respuesta
y el ajuste necesario en Laravel. No atribuyas a cancelar transporte la
cancelación de una escritura ya aceptada por el servidor.

Prueba recuperación/asignación posterior y logout. Documenta la política, sus
límites y resultados nuevos en el informe de autorización y ambos progresos.
```

## P06 — Resolver metadatos de sublistas vacías

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P06.

Comprueba los tres endpoints de subdecomisos con padre existente sin hijos,
última página y borrado del último elemento. Revisa si Laravel ya devuelve
total/current_page/last_page/per_page también en vacío.

Si sigue omitiéndolos, documenta el contrato y adapta en la frontera del service
solo el vacío cuya semántica puedas acreditar. No inventes total cero cuando
una página fuera de rango puede tener filas en páginas previas. Si faltan datos
para decidir, entrega al backend la respuesta mínima necesaria y conserva el
estado coherente sin presentar el contrato como resuelto.

Conserva filtros, orden y un solo propietario de página. Comprueba corrección
de total/página tras borrar y aislamiento por padre. Pruebas de service/query y
recorrido breve del caso límite. Actualiza el informe de backend y ambos progresos.
```

## P07 — Configurar y comprobar imágenes

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P07.

Confirma con el backend la URL pública real de medios; no asumas /storage.
Resuelve VITE_LOCAL_PHOTOS_URL en el entorno local y documenta la variable en
.env.template sin secretos. Revisa logoColumn, PhotoInput y fotos de subdecomisos:
evita URLs undefined y respeta el contrato de referencias existentes.

Verifica entrega y renderizado del archivo tras guardar/recargar, conservación
al editar sin reemplazo, reemplazo y fallback ante archivo no disponible.
Preserva validación de archivos y liberación de object URLs. Diferencia un
problema de configuración frontend de un 403/404 del servidor de archivos.

Usa registros temporales, comprueba visualmente consumidores representativos y
registra si no puedes verificar limpieza física del servidor. No modifiques
archivos de medios existentes. Actualiza el informe de backend y ambos progresos.
```

## P08 — Recuperación ante errores de renderizado/carga diferida

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P08.

Añade una frontera de errores en un punto apropiado de la aplicación para
fallos de render y carga de vistas lazy. Ofrece mensaje accesible y recuperación
útil sin bucles de recarga. No confundas errores HTTP administrados por Query
con errores de render ni expongas trazas/datos privados al usuario.

Preserva carga diferida y sesión. Comprueba fallo de componente y de importación
en un escenario controlado, recuperación y navegación posterior. No instales
un sistema de monitorización externo ni un runner solo para este cambio.
Registra comprobaciones y límites en un informe del tema y ambos progresos.
```

## P09 — Página 404 y navegación desconocida

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P09.

Introduce una página no encontrada coherente con el tema y los permisos.
Revisa comodines del router principal y de módulos para que una URL desconocida
no se oculte con una redirección genérica. Conserva los flujos deliberados de
entrada/login y distingue ruta inexistente de recurso inexistente y 403.

Ofrece navegación útil para usuarios autenticados y visitantes, sin bucles ni
acceso a destinos no autorizados. Verifica URL directa, ruta anidada desconocida,
atrás y recuperación. Documenta la diferencia entre vista 404 de una SPA y el
código HTTP de su servidor de hosting. Actualiza el informe y ambos progresos.
```

## P10 — Identidad y dashboard orientados al producto

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P10.

Sustituye título/icono de Vite y etiquetas de demostración de librerías por una
identidad coherente con la gestión/análisis de decomisos. Revisa lang, títulos,
textos y consistencia de idioma. Usa una propuesta sobria basada en el producto;
documenta el nombre elegido si no existe uno acordado.

Replantea el dashboard con información útil y autorizada. Contrasta datos reales
y de ejemplo: identifica claramente una demo y no presentes indicadores ficticios
como métricas reales. No inventes endpoints ni incorpores nuevas funcionalidades
analíticas fuera de alcance. Mantén carga diferida, permisos y estados de vacío.

Reutiliza MUI/tema, comprueba aspecto y navegación en escritorio/móvil y registra
capturas sin datos personales. Actualiza el informe del tema y ambos progresos.
```

## P11 — Revisión visual, móvil y accesibilidad

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P11.

Audita con recorridos representativos login, navegación, tabla, diálogo,
formulario, gráficos y mapa en móvil/escritorio. Comprueba teclado, foco al
abrir/cerrar, etiquetas de iconos y campos, errores, contraste y desbordamientos.
No consideres una tabla ancha necesariamente defectuosa si tiene desplazamiento
accesible. Distingue preferencias visuales de barreras de interacción.

Corrige los problemas confirmados dentro de estos flujos sin rediseñar toda la
aplicación. Conserva validación, geocodificación y formularios ante fallos.
Comprueba los arreglos con navegador; usa capturas cuando el aspecto lo requiera.
Registra alcance, casos aprobados y límites; no declares conformidad WCAG completa
por un recorrido breve. Actualiza el informe y ambos progresos.
```

## P12 — Datos y recorrido de demostración

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P12.

Conserva el acceso precargado del login: el usuario lo dejó intencionalmente
para que los visitantes puedan entrar a la demo una vez publicada. No lo retires,
no lo clasifiques como defecto ni cambies la cuenta, credenciales o asignaciones
existentes por ejecutar esta tarea. La revisión funcional de permisos pertenece
a P01/P04; aquí se documentan los que tenga la demo realmente.

Separa fixtures de prueba y datos de demo persistentes. Usa datos ficticios y
no alteres usuarios ni registros existentes. Reutiliza el acceso de demostración
decidido por el usuario y documenta las funciones disponibles y las limitaciones,
sin copiar secretos privados adicionales. Si la preparación de datos requiere
un cambio backend no disponible, deja el pendiente preciso.

Documenta un recorrido corto para el reclutador y limpieza/restablecimiento
de la demo, indicando qué quedó realmente preparado. Verifica login, navegación
y rechazos esperados. Actualiza la guía de demo y ambos progresos.
```

## P13 — Pruebas y lint como requisitos en CI

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P13.

Revisa .github/workflows/deploy-frontend.yml y las versiones Node/dependencias
resueltas. Añade comprobaciones en PR y push: instalación reproducible, npm test,
lint con cero advertencias y build. El despliegue existente debe depender de
checks aprobados y seguir limitado al evento/rama autorizado; una PR no debe
usar credenciales ni ejecutar el despliegue.

Revisa las versiones de actions y fija Node compatible. Determina si
--legacy-peer-deps sigue siendo necesario en lugar de retirarlo a ciegas.
Los tests actuales no necesitan backend real. No publiques ni dispares un
despliegue para comprobar sintaxis; prueba lo viable y distingue checks locales
de una ejecución de GitHub Actions todavía no realizada.

Documenta el workflow, validación, dependencias y límites en ambos progresos.
```

## P14 — Verificar despliegue público

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P14.

Identifica la URL real del despliegue desde documentación/configuración disponible;
si falta, solicita ese dato mientras revisas localmente lo independiente.
Comprueba en el sitio publicado HTTPS, API/CORS, cookies de sesión, imágenes,
recarga de rutas internas, chunks diferidos y errores de consola/red relevantes.
Usa una cuenta de demostración apropiada y evita escrituras en datos ajenos.

Contrasta la configuración de build: las variables Vite se incorporan al
compilar. Documenta SPA fallback y diferencias entre entorno local y producción.
No des por verificado el servidor por tener un workflow ni el transporte por
pasar tests simulados. Registra resultados reales y ajustes pendientes del hosting.

Esta tarea verifica el despliegue existente; no autoriza publicar uno nuevo ni
cambiar infraestructura externa. Prepara correcciones locales revisables dentro
del alcance. Actualiza la guía de despliegue/demo y ambos progresos.
```

## P15 — README y presentación del proyecto

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo P15.

Sustituye el README de Vite por una presentación del producto: problema, usuarios,
funcionalidades, capturas útiles, demo y recorrido, stack, arquitectura y arranque
con variables de entorno. Incluye comandos de verificación y límites actuales.
Enlaza informes técnicos sin volcar la cronología interna en la portada.

Explica decisiones defendibles: Query frente a Redux, límites de services,
permisos, formularios ante errores, sesión/cancelación y carga diferida.
Describe la aportación propia usando evidencia del repo y del usuario; no
inventes autoría exclusiva, métricas, cobertura o experiencia de producción.

Usa enlaces/capturas verificados y datos ficticios; no publiques credenciales
ni URLs supuestas. Si la demo no está comprobada, indícalo y conserva instrucciones
locales útiles. Actualiza ambos progresos. No añadas funcionalidades.
```

## Ampliaciones opcionales

No bloquean por sí solas la presentación del portafolio. Ejecutarlas solo cuando
el usuario solicite expresamente su código de tarea.

### O01 — Suite E2E repetible

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo O01.

Convierte una selección pequeña de los recorridos manuales en una suite E2E
repetible con Playwright Test. Esta solicitud autoriza incorporar el runner
necesario, sin actualizar dependencias ajenas. Define instalación, scripts,
servidor, fixtures y limpieza; no dependas de una sesión manual del navegador.

Prioriza login, permisos, CRUD representativo y un flujo de análisis. Diferencia
suite aislada con HTTP simulado de opt-in contra backend real; esta última no
debe correr en PR ni modificar entornos públicos por defecto. Reutiliza escenarios
sin copiar ciegamente scripts MCP. Registra resultados y artefactos sin secretos.

Añade CI para la variante reproducible si P13 existe y comprueba estabilidad
de la selección elegida, sin ampliar a todos los módulos equivalentes. Actualiza
guía de pruebas y ambos progresos.
```

### O02 — Ampliar comprobaciones reales de flujos restantes

```text
Lee AGENTS.md, docs/refactor-plan.md, docs/refactor-progress.md,
docs/portfolio-plan.md y docs/portfolio-progress.md. Ejecuta solo O02.

Contrasta la cobertura vigente y verifica con backend real los huecos concretos
de registro, CRUD administrativo y geocodificación. No repitas los flujos ya
aprobados sin cambios relevantes. Define escenarios pequeños, incluyendo errores
de validación, relaciones, acceso limitado y recuperación.

Usa cuentas/roles/registros temporales y conserva asignaciones existentes.
Revisa si el registro inicia sesión y qué permisos recibe, sin asumirlos.
Respeta límites de API/geocodificación externa y no envíes direcciones privadas.
Limpia fixtures y separa fallos de aplicación, contrato y entorno.

Corrige problemas confirmados de frontend dentro de estos flujos y documenta
los ajustes backend que no puedas implementar aquí. Actualiza informes de los
dominios afectados, el informe de backend y ambos progresos.
```
