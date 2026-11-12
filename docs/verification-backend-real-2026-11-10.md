# Verificación con backend real — 10 de noviembre de 2026

Actualización P02 (11 de noviembre): la discrepancia de IDs del hallazgo 3 se
corrigió y verificó contra respuestas actuales y OpenAPI. Contratos, frontera
URL, pruebas y límites en [el informe P02](verification-identifiers-p02-2026-11-11.md).
Actualización P06 (12 de noviembre): nueva comprobación de los tres endpoints,
adaptación limitada del vacío inicial y respuesta mínima solicitada a Laravel
al final de este informe. La omisión de metadatos del backend sigue pendiente;
no se considera resuelto el contrato completo.
Actualización P07 (12 de noviembre): base de medios confirmada y configurada,
entrega/renderizado y conservación/reemplazo comprobados. Véase P07 al final:
los archivos inexistentes bajo `/storage` pueden responder 403 y no se acredita
limpieza física; un PNG temporal sigue accesible tras borrar su registro.
El contenido siguiente conserva la evidencia histórica.

## Entorno y alcance

- Frontend Vite del workspace, `http://localhost:5174`; API configurada en
  `http://localhost/api`. Puerto 5173 reservado al servicio del backend según
  indicación del usuario. Se conserva el proceso de Vite en 5174 al terminar.
- Playwright MCP comprobado operativo. HTTP y autenticación reales, sin rutas
  interceptadas ni respuestas simuladas. Cuenta ya configurada en el formulario
  de acceso; no se registran credenciales, cookies ni datos personales aquí.
- Workspace inicialmente limpio. No se cambian aplicación, endpoints,
  dependencias, `.env` ni configuración del backend. Se incorporan recorridos
  manuales reproducibles e informe; se actualiza el progreso.
- `npm test`: 208 aprobadas, cero fallos/canceladas/omitidas. Ejecutado al iniciar
  esta verificación, antes de la interrupción que precisó el puerto 5174.
  Las pruebas automatizadas siguen usando transporte simulado; los recorridos
  de este informe sí acceden al backend.

## Resultados confirmados

### Sesión y acceso

- Preflight para origen `http://localhost:5174`: 204, origen permitido y
  `Access-Control-Allow-Credentials: true`.
- Login real 200 y navegación al dashboard. Cookie `token` HttpOnly; sesión
  conservada al recargar. Cookies locales SameSite Strict, sin Secure en HTTP.
  Esto no acredita configuración HTTPS de producción.
- Contexto independiente sin cookies: lectura y creación de drogas devuelven
  401. No se crea el registro del intento sin autenticar.
- Logout desde la interfaz: 200. Tras recargar, refresh y lectura protegida
  devuelven 401; se mantiene la pantalla de acceso.
- Login con contraseña incorrecta: 401, permanece en acceso y conserva el valor
  editado. Se restaura el valor inicial y se comprueba un nuevo login correcto.
- No se cambian roles/permisos de usuarios. No se acredita una matriz de
  autorización por roles ni aislamiento entre dos usuarios reales diferentes.

### Lecturas, persistencia y relaciones

[backend-real.js](../tests/browser/backend-real.js) se ejecutó desde la sesión
autenticada usando los services reales del frontend:

- Listados de los nueve dominios: drogas, armas, municiones, presentaciones,
  permisos, roles, usuarios, actividad y confiscaciones.
- Catálogos completos de los siete dominios con opciones, contrastando su
  longitud con el total del listado. Roles usa `/role`, según su service.
- Páginas distintas, orden descendente y filtro por descripción en drogas.
- Confiscación temporal: creación JSON, detalle, edición, persistencia de
  coordenadas y borrado. Lectura posterior al borrado responde 404.
- Cada tipo de subdecomiso: creación multipart con PNG, lectura por padre,
  mapeo de relaciones, edición conservando imagen y eliminación. Metadatos
  paginados correctos cuando hay filas.
- Con cada hijo todavía persistido, gráficos con filtros y mapa incluyen los
  datos temporales. También se verifican respuestas vacías válidas de las tres
  variantes de gráficos y del mapa cuando no se seleccionan catálogos.
- Ejecución espaciada: 24 grupos aprobados. El script se amplió después con
  aserciones de paginación vacía; estas se comprobaron en un recorrido específico
  con otro padre temporal, sin repetir toda la batería.
- Recorrido específico: edición de padre con observación vacía rechazada con
  código 422 y error del campo `observacion`.

[backend-real-ui.js](../tests/browser/backend-real-ui.js) comprueba el CRUD real
desde la interfaz de drogas: creación multipart y actualización del listado,
persistencia tras recarga, edición conservando la referencia de imagen y
borrado confirmado por una nueva consulta. Cuatro grupos aprobados; falla la
visualización de imagen descrita abajo. Cero excepciones de página en el
recorrido final.

## Hallazgos pendientes

1. **Configuración de imágenes.** `.env` y `.env.template` solo definen
   `VITE_API_URL`; PhotoInput y logoColumn consumen además
   `VITE_LOCAL_PHOTOS_URL`. El navegador solicita `/undefined/...` y la imagen
   persistida no aparece en la tabla. Se acredita el almacenamiento de la
   referencia y su conservación al editar, pero no la entrega correcta del
   archivo. Es necesario confirmar la URL pública de medios del backend y
   configurar/probar esa variable. Dos sondeos exploratorios con una imagen
   existente devolvieron 403 en `/storage/…` y 404 en `/…`; esas rutas no se
   consideran un contrato confirmado ni identifican por sí solas la causa.

2. **Paginación de sublistas vacías.** Los tres endpoints anidados devuelven
   `data: []` sin `total`, `current_page` ni otros metadatos. Confirmado con un
   padre existente sin hijos y también tras borrar el último hijo. Los services
   entregan `tableOptions: {}`. Los consumidores esperan metadatos para resolver
   página vacía y total; no se declara verificada esa garantía con backend real.
   Con filas sí hay metadatos. Resolver el contrato en backend o definir una
   adaptación explícita del caso vacío y comprobar el borrado en última página.

3. **Tipos de identificador.** En los nueve listados reales el ID adaptado es
   numérico; varios contratos TypeScript públicos lo declaran como `string`.
   Los flujos probados funcionan, pero existe una discrepancia de tipos que
   merece una revisión coordinada. No se introduce coerción ni se cambian
   identificadores en una tarea de verificación.

## Incidencias del recorrido y comprobaciones finales

- El puerto 4175 usado inicialmente no está autorizado por CORS; 5173 sí lo
  está, pero pertenece al backend y no sirve el frontend. La indicación del
  usuario resolvió el entorno con 5174, también permitido. Se detuvo el Vite
  auxiliar iniciado en 4175; no se intervino el servicio de 5173.
- Backend limitado a 60 peticiones/minuto. Una repetición inicial recibió 429;
  no se cuenta como aprobada. Se dejó renovar la cuota y se añadió al recorrido
  de services una espera de 1,2 segundos por petición con interceptor temporal,
  retirado en `finally`. No se reintentan escrituras automáticamente.
- El primer recorrido confundía ausencia de metadatos con borrado fallido;
  la consulta de filas confirma el borrado. Se separaron ambas aserciones.
  El primer recorrido UI buscaba `Ok`; el botón actual es `Borrar`. Se corrigió
  el script, se limpió el fixture y se repitió el flujo completo.
- Las rutas exploratorias `/rol` y peticiones sin Accept JSON no son las usadas
  por los services. Sus errores no se atribuyen a los flujos del frontend.
- Se eliminaron los registros temporales creados, incluidos los de intentos
  incompletos. Comprobación final: cero drogas `PORTFOLIO_UI_`, cero padres
  `PORTFOLIO_`; totales originales conservados: 5 drogas y 5.000 confiscaciones.
  Los hijos se eliminaron explícitamente antes de sus padres. La auditoría real
  registra estas acciones; no se borró. Sin acceso al filesystem del backend,
  no se acredita eliminación física de los archivos subidos.
- Lint con `--max-warnings 0` correcto; build correcto, sin aviso de chunks
  grandes. Restaurado el artefacto generado `tsconfig.app.tsbuildinfo` a sus
  bytes iniciales. `git diff --check` correcto.
- No se repite la batería simulada de todos los formularios ni se certifican
  producción, registro de cuentas, CRUD administrativo completo, geocodificación,
  pruebas de carga, seguridad integral o permisos entre usuarios diferentes.

La integración real queda comprobada para los flujos descritos, con los tres
hallazgos anteriores abiertos. No se marca la validación global como libre de
pendientes ni se avanza otro paso del plan de refactorización.

## P06 — Paginación vacía (12 de noviembre de 2026)

Nueva ejecución real en `localhost/api`, sesión de demo existente y Vite en
5174. No se modifica Laravel ni cuentas/asignaciones. El código backend no
está en este workspace. Evidencia sanitizada de las 24 lecturas en
[JSON P06](verification-sublist-p06-results-2026-11-12.json), recorrido reproducible
en [sublist-pagination-real.js](../tests/browser/sublist-pagination-real.js).
No hay respuestas interceptadas/simuladas en este recorrido.

Los tres endpoints `GET /api/{dominio}/{padre}/confiscation`, con dominios
`drugConfiscation`, `weaponConfiscation` y `ammunitionConfiscation`, responden
200 con el mismo comportamiento:

| Escenario, tamaño 2 y orden identificador descendente | Filas | total / current_page / last_page / per_page |
| --- | --- | --- |
| Padre existente sin hijos, página 1 | 0 | Omitidos: cuerpo exacto `{"data":[]}` |
| Tres hijos, página 1 | 2 | 3 / 1 / 2 / 2 |
| Tres hijos, última página 2 | 1 | 3 / 2 / 2 / 2 |
| Tres hijos, página 3 fuera de rango | 0 | 3 / 3 / 2 / 2 |
| Segundo padre vacío mientras el primero tiene tres hijos | 0 | Omitidos |
| Borrar fila única de página 2, volver a consultar página 2 | 0 | 2 / 2 / 1 / 2 |
| Consultar página anterior tras borrar | 2 | 2 / 1 / 1 / 2 |
| Borrar también los dos hijos restantes, página 1 | 0 | Omitidos |

Esto precisa el hallazgo histórico: **una página vacía no implica total cero**.
En el escenario fuera de rango observado Laravel conserva los metadatos; los
omite cuando ya no hay hijos. Se acredita el aislamiento por padre y el orden
descendente, sin deducir el comportamiento de todos los filtros del servidor.
Un intento inicial con tamaño 1 recibió 422 (`per_page` mínimo 2); se limpiaron
sus dos padres y se repitió con tamaño válido, sin reintentar escrituras.

### Adaptación y límites

`api/sublistPagination.ts`, invocado solo desde los tres services, representa
honestamente la respuesta HTTP como metadatos opcionales y exige los cuatro
campos antes de publicar una respuesta paginada. Conserva los metadatos del
servidor, incluidos un total positivo y `last_page < current_page`.
Solo adapta `data: []` en **página solicitada 1**, con los cuatro campos ausentes:
total 0, página 1, última 1 y tamaño solicitado. La primera página vacía acredita
que no hay filas para esos argumentos en ese instante. No se inventan enlaces
ni se afirma haberlos recibido; el contrato adaptado requiere solo esos cuatro
campos. Se preservan parámetros, orden, filtros, padre, cookies y AbortSignal.

Si faltan metadatos en página posterior, o llegan parcialmente/inválidos, el
service rechaza explícitamente el listado. No sondea páginas, no inventa cero,
no reutiliza totales de otra clave/padre y no cambia la página. Query posee
error y resultados; los hooks conservan el único estado de página y ajustan
una página vacía únicamente tras una lectura exitosa actual con total probado.
La paginación muestra total desconocido (`-1` de MUI) durante ausencia de datos
o error; selección/escrituras del listado quedan bloqueadas ante error, con
Reintentar. La caché puede conservar la última respuesta acreditada de la misma
clave, sin presentarla como una nueva lectura exitosa.

### Respuesta mínima que debe garantizar backend

Pendiente Laravel: devolver siempre el paginador, también cuando no hay hijos
o el filtro no encuentra filas. Aplicar padre y filtros antes de contar; no
construir un `data: []` aislado al detectar colección vacía. Ejemplos mínimos
para tamaño 2 (el resto de enlaces puede seguir siendo opcional para este UI):

```json
{"data":[],"total":0,"current_page":1,"last_page":1,"per_page":2}
```

Página solicitada 2 tras borrar la tercera fila, quedando dos en página 1:

```json
{"data":[],"total":2,"current_page":2,"last_page":1,"per_page":2}
```

Si no quedan hijos pero se solicita página 2, conservar `current_page: 2`,
`total: 0`, `last_page: 1`, `per_page: 2`. El cliente decidirá volver a 1.
No sustituir el total por la longitud de `data` ni cambiar silenciosamente la
página solicitada. Distinguir mediante rechazo HTTP un padre inexistente/no
autorizado de una colección vacía; esa distinción no se certifica en P06.
Este documento es la entrega para backend; no se ha enviado mensaje externo
ni se ha aplicado/verificado ese ajuste en Laravel.

### Verificación del frontend

Pruebas de contrato/query en
[sublist-pagination.test.mjs](../tests/sublist-pagination.test.mjs) y regresión
[confiscation-save.test.mjs](../tests/confiscation-save.test.mjs). Cubren vacío
inicial, total positivo fuera de rango, parámetros/señal, metadatos parciales,
rechazos HTTP, borrado de última página/hijo final, recarga activa, error ambiguo
sin sobrescribir datos probados e invalidación limitada al padre. El fixture de
deduplicación antiguo devolvía página 1 para cualquier petición; corregido para
reflejar la página solicitada. La señal Axios combina sesión y consulta: la
prueba comprueba propagación de aborto, no identidad del objeto.

Context7 consultado para Query **5.107.1** (lockfile); no ofrece ese patch
versionado exacto. Se contrasta con la
[documentación oficial v5 de invalidación](https://tanstack.com/query/v5/docs/framework/react/guides/query-invalidation):
prefijo por padre y recarga de consultas activas. No se cambia la política
Query, ni dependencias. React resuelto 19.3.1, Axios 1.21.0 y MUI 6.4.7.

Resultado final: **256/256 pruebas Node**, lint sin advertencias y build correctos;
diff comprobado y `tsconfig.app.tsbuildinfo` restaurado. Las 25 pruebas P06 están
incluidas en ese total; el resto preserva la regresión existente. Transporte de
las pruebas Node simulado, separado de los recorridos HTTP reales.

[sublist-pagination-ui.js](../tests/browser/sublist-pagination-ui.js) pasó tres
grupos reales: adaptación inicial de los tres services, borrado por UI de la
fila única de página 2 (total 6→5, página 2→1, tamaño 5 conservado), y eliminación
por service de los hijos restantes seguida de invalidación/lectura UI con
total cero, estado vacío y navegación deshabilitada. No se añaden filtros/orden
a un control que no los ofrece; su conservación se verifica en parámetros y
claves de service/query, y el sondeo real comprueba el orden descendente.
[Resultado UI](verification-sublist-p06-ui-results-2026-11-12.json): cero excepciones
y errores de consola finales, un aviso de rendimiento Canvas2D, ningún aviso MUI
de página inválida. Red relevante: DELETE 200, relectura de página 2 con total
5 y posterior página 1; sin interceptaciones pendientes.

El primer intento UI detectó módulos anteriores retenidos desde el sondeo;
se limpió su padre, se añadió recarga inicial y el recorrido final pasó con el
código actual. Limpiados los nueve hijos/dos padres del sondeo y seis hijos/un
padre del recorrido UI; también dos padres del intento con tamaño 1 y uno del
primer intento UI. Consulta final independiente por observación: cero padres
`PORTFOLIO_P06_`. Se conserva auditoría; no se acredita eliminación física de
imágenes. Sin commits, despliegues ni cambios fuera de P06.

## P07 — Medios públicos (12 de noviembre de 2026)

Solo P07, con API real `http://localhost/api` y Vite en 5174. El usuario confirma
la base configurada por Laravel: **`http://localhost/storage`**. No se deduce
del nombre del framework. OpenAPI actual no documenta endpoints de medios;
la confirmación se contrasta con una subida temporal: referencia relativa
`drug/<nombre>.png`, GET público 200, `Content-Type: image/png`. La misma
referencia sin `/storage` responde 404. Un contexto independiente sin cookies
también recibe el PNG con 200. No se cambió configuración/código de Laravel.

### Cambio frontend y contrato

- `.env` local (ignorado por Git) y [.env.template](../.env.template) definen
  `VITE_LOCAL_PHOTOS_URL=http://localhost/storage`. Comprobado en el módulo
  servido por Vite, junto con `VITE_API_URL=http://localhost/api`. La plantilla
  explica base por entorno, reinicio y carácter público de las variables VITE_.
- [getMediaUrl](../src/helpers/getMediaUrl.ts) resuelve referencias relativas
  contra esa base, respeta URLs HTTP(S) absolutas y rutas desde la raíz del
  mismo origen (sin duplicar `/storage`). Normaliza barras/escape para mostrar,
  sin modificar referencias en RHF ni payloads. Sin referencia/base válida
  devuelve `undefined` como ausencia de `src`, nunca la cadena `undefined`.
- `logoColumn`, `PhotoInput` y `ListSubConfiscation` usan ese helper. El logo
  toma descripción/nombre como alternativa legible; los otros muestran icono
  «Imagen no disponible». Avatar administra el fallo de carga. Una referencia
  sin preview permanece en RHF y conserva su control de eliminación; no se
  confunde con ausencia de archivo. Se conservan índices de imágenes múltiples.
- No cambian services, validadores, límite 5.000.000 bytes, rechazo de vacíos,
  multipart ni `_method=PUT`. Los archivos nuevos siguen usando object URLs,
  revocadas al cambiar el valor y al desmontar.

### Resultados nuevos

**259/259 pruebas Node**, incluidas resolución/configuración y las pruebas
vigentes de los siete validadores y multipart. Lint con cero advertencias,
build y sintaxis de los tres recorridos nuevos correctos. No se añaden paquetes.
Artefacto TypeScript generado restaurado; diff comprobado.

- [Catálogo real](../tests/browser/media-catalog-real.js): **7 grupos aprobados**.
  Crear droga por UI con PNG azul, comprobar preview blob y su liberación,
  guardar/recargar y decodificar imagen de 32×32. GET devuelve exactamente los
  bytes subidos. Editar descripción conserva referencia exacta. Reemplazar por
  PNG rojo cambia referencia, entrega los nuevos bytes y renderiza tras recarga.
  Interceptaciones **solo de imagen** para casos señalados 403/404: inicial del
  logo e icono de PhotoInput visibles, valor/control conservado y recuperación
  al retirar la ruta. No se simula ninguna respuesta de API en este recorrido.
- [Subdecomisos reales](../tests/browser/media-subconfiscation-real.js): **8
  grupos aprobados**. Cada uno de los tres services crea con PNG, conserva la
  referencia al editar sin archivo, reemplaza y relee su nueva referencia;
  seis GET entregan los bytes esperados con 200/image/png. Los tres paneles
  muestran foto de lista y preview existente; droga se guarda además por UI
  sin reemplazo y vuelve a la lista. Recarga completa vuelve a mostrar la foto.
  Sin interceptaciones de red en este recorrido.
- [Previews aisladas](../tests/browser/media-preview-controls.js): **3 grupos
  aprobados**. Referencia no disponible intacta en RHF, eliminación correcta en
  una lista referencia/File y revocación de todas las object URLs al actualizar
  y desmontar. No crea registros. La respuesta de imagen no disponible es real.
- Cero excepciones de página en los dos recorridos reales finales. Capturas
  locales inspeccionadas: `.playwright-mcp/p07-catalog.png`, `p07-fallback.png`
  y `p07-subconfiscation.png`. Muestran respectivamente PNG azul, fallback y
  PNG naranja. No se solicitan rutas `/undefined/` en las recargas comprobadas.

Evidencia saneada: [resultados P07](verification-media-p07-results-2026-11-12.json).
Los errores de consola de imagen 403/404 son esperados en los fallbacks. En
subdecomisos aparecen avisos MUI de opciones aún vacías al abrir arma/munición
y Canvas2D del mapa; no son fallos de entrega ni se corrigen fuera de P07.

### Diagnóstico y límites de servidor

| Situación | Evidencia actual | Interpretación y acción |
| --- | --- | --- |
| Variable ausente o base inválida | Pruebas del helper: no hay URL de imagen | Configuración frontend; definir base y recargar/reiniciar Vite. No deducir una ruta de la API. |
| Archivo subido temporal existente | GET 200/image/png, bytes iguales y `img.decode()` correcto | Base y entrega local verificadas. |
| Archivo ficticio inexistente bajo `/storage/drug/…` | GET **403** application/json | Respuesta del servidor de archivos/ruta, no variable ausente ni prueba de revocación de permisos API. No se conoce su causa interna sin acceso Laravel. |
| Misma ruta relativa fuera de `/storage` | GET 404 application/json | Base/ruta incorrecta; no demuestra que la subida haya fallado. |
| Imagen responde 403 o 404 | Ambos códigos controlados en navegador | Fallback, conservando la referencia; no repetir escritura ni enviar la imagen a través del interceptor de sesión API. |

Para backend queda revisar la respuesta de archivos ausentes y la política de
retención: no se puede inferir existencia por 403, ni atribuirlo a permisos del
filesystem. No se modifican enlaces, permisos ni archivos de medios existentes.
Esto verifica HTTP local; no acredita entrega HTTPS/CDN de producción.

**Limpieza:** eliminados los nueve registros propios de todas las ejecuciones:
sondeo droga 25; drogas UI 26, 27 y 28; padres 5026 y 5027; hijos droga 1026,
arma 1004 y munición 1004. Tres listas por padre vacías antes de borrar 5027;
comprobación independiente final: cero drogas y cero padres `PORTFOLIO_P07_`.
La primera promesa de borrado de munición rechazó; la lectura posterior ya
devuelve vacío y un intento manual posterior respondió 404. No se conoce la
causa de ese rechazo inicial. El script ahora relee antes de decidir limpieza,
sin repetir automáticamente escrituras. Auditoría conservada.

**Limpieza física no acreditada.** Después de eliminar la droga 25, su PNG del
sondeo sigue devolviendo **200 a un contexto sin cookies**. Esto confirma que
ese archivo sigue accesible públicamente; no hay acceso al filesystem Laravel
para inspeccionar/eliminar bytes o acreditar la limpieza de los demás archivos.
No se declara que borrar registros o reemplazar fotos borre archivos físicos.

Incidencias de preparación: selector del `<title>` SVG sustituido por rol de
imagen; supuesto 404 de archivo ausente corregido al observar 403; firma de
listado del helper de prueba corregida. Fixtures de esos intentos limpiados;
resultados finales anteriores separados de intentos fallidos. El recorrido
histórico `shared-form-controls.js` también se intentó y falló antes del bloque
de foto en una aserción de fecha (`format is not a function`); no se cuenta
como aprobado ni se cambia su flujo ajeno a P07. La cobertura de foto se ejecutó
en el recorrido aislado nuevo con éxito.

Context7 cubre Vite **8.3.5** exacto: [variables públicas y reinicio](https://github.com/vitejs/vite/blob/v8.3.5/docs/guide/env-and-mode.md).
Para MUI instalado **6.4.7** ofrece la documentación oficial v6, sin ese patch
exacto: [fallback de Avatar](https://v6.mui.com/material-ui/react-avatar/#fallbacks),
contrastado con `node_modules/@mui/material/Avatar/Avatar.js` resuelto localmente.
React 19.3.1/RHF 7.55.0 permanecen; no se altera su API ni la política de sesión.
Skill React aplicada a derivación de URLs y limpieza de recursos, sin cambios
de arquitectura. Sin commits, despliegues ni avance a P08; P06 backend permanece.
