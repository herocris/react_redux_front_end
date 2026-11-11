# Verificación con backend real — 10 de noviembre de 2026

Actualización P02 (11 de noviembre): la discrepancia de IDs del hallazgo 3 se
corrigió y verificó contra respuestas actuales y OpenAPI. Contratos, frontera
URL, pruebas y límites en [el informe P02](verification-identifiers-p02-2026-11-11.md).
El contenido siguiente conserva la evidencia histórica; imágenes y paginación
de sublistas vacías siguen pendientes.

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
