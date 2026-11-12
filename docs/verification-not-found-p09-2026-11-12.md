# P09 — Página no encontrada y navegación

Verificación local del 12 de noviembre de 2026. Solo P09; no se ejecuta P10,
no hay publicación, cambios Laravel ni dependencias nuevas. Workspace limpio
al comenzar. Los 16 pasos originales permanecen cerrados.

## Comportamiento y decisiones

`src/router/NotFoundPage.tsx` presenta una página MUI con colores del tema,
encabezado h1 enfocado y contenido adaptable. No expone la URL, errores privados
ni datos de sesión. La navegación se deriva del Redux existente y de
`firstAllowedPath`, incluidas sus dependencias de permisos; no se infiere por rol.

- Visitante: enlace al login.
- Sesión con vistas disponibles: enlace a la primera vista permitida y logout.
- Sesión sin vistas: explicación y logout, sin enlaces a vistas no autorizadas.
- Logout fallido: conserva sesión, muestra error y permite otro intento explícito.
- Ninguna redirección o recarga automática desde la 404. No se añade un botón
  de atrás que pudiera sacar al visitante de la aplicación o enviarlo a un destino
  desconocido; se conserva el historial del navegador.

`AppRouter` reserva `/` a la entrada deliberada. `/auth`, `/auth/login` y
`/auth/register` conservan su flujo para visitantes y envían al autenticado a
una vista permitida (o acceso denegado con logout si no tiene ninguna).
Las entradas deliberadas y el login de una ruta privada válida usan `replace`.
El acceso precargado de la demo no se modifica.

Los once routers de módulos, incluido auth, muestran la 404 en su comodín.
Los guards pasan del prefijo de módulo a sus rutas concretas, siempre antes de
montar vistas con consultas. En confiscaciones se conservan guards de create y
update y se protege explícitamente detail con view. Graph/map siguen protegidos
en su ruta exacta. Los módulos continúan con `React.lazy`: resolver un prefijo
puede descargar su módulo de rutas incluso sin autorización, pero no monta sus
consumidores remotos; la descarga de código no concede acceso a datos.

| Escenario | Resultado |
| --- | --- |
| `/desconocida`, `/drug/no/existe`, `/auth/no/existe` | 404 de navegación; URL conservada para visitantes y autenticados |
| `/graph/no/existe`, `/confiscation/edit/7/extra` | 404 de navegación |
| Ruta privada válida sin sesión | Login deliberado |
| Ruta válida sin permiso | Acceso denegado; no monta consultas de esa vista |
| `/confiscation/detail/999999` con permiso y API 404 | Error de recurso dentro de la vista y reintento de Query |
| Misma ruta con API 403 | Acceso denegado; no se convierte en ruta inexistente |
| Parámetro de detalle reconocido pero ID inválido | Conserva validación de ID existente; no se consulta por deducción |

`apiErrors.ts` da a un HTTP 404 acreditado el mensaje «Recurso no encontrado».
El interceptor conserva rechazo, cuerpo y causa; no se cambia el estado de Query,
sesión, validación por campo ni contratos de escritura. Un texto parecido a 404
sin estado HTTP no se toma como prueba de ausencia. La nueva prueba ejercita el
cliente Axios con adaptador simulado, cuerpo sin código, metadata y causa.

## Comprobaciones ejecutadas

- **260/260 pruebas Node**, cero fallos, omisiones o cancelaciones.
- `npm.cmd run lint`: correcto, sin advertencias. `npm.cmd run build`: correcto.
- Sintaxis del recorrido y `git diff --check`: correctos. Artefacto TypeScript
  generado restaurado a su contenido previo; sin commits ni despliegues.
- Playwright MCP operativo sobre build de producción con preview local en
  `http://127.0.0.1:4176`. El intento de iniciar otro preview encontró el puerto
  ocupado; se reutilizó el existente, que sirvió el build recién generado.
- `tests/browser/not-found-p09.js`: **7 grupos aprobados**, con sesiones/API
  simuladas aisladas y componentes/rutas reales, sin escrituras al backend.
  Cubre URL directa, recarga, atrás/adelante, recuperación al login, once
  comodines para visitante y sesión, sufijos extra de graph/map y confiscación,
  entradas deliberadas, registro, login simulado, navegación permitida,
  denegación sin consultas, recurso 404/403 y logout fallido/recuperado sin bucle.
- Ocho peticiones de datos en las vistas válidas del recorrido; ninguna desde
  las URLs desconocidas ni la vista válida sin permiso. Dos intentos explícitos
  de logout. Cero `pageErrors`; 27 mensajes de consola HTTP esperados por los
  rechazos 401/403/404/500 simulados, sin otros errores de consola.
- Capturas de 375×812 y 1280×900 inspeccionadas: sin desbordamiento horizontal,
  contenido y acciones visibles, foco del h1 comprobado.
- Comprobación adicional aislada aprobada: tema oscuro persistido aplicado y
  enlace de recuperación alcanzable con Tab/Enter hasta login; cero excepciones.
  Ese bloque se incorpora al recorrido guardado; no se repitió toda la matriz
  únicamente para integrarlo. Captura oscura inspeccionada.

Logs y capturas locales ignorados en `.playwright-mcp/p09-*`: tests, lint, build,
mobile.png, desktop.png y dark.png. Los contextos simulados se cierran en
`finally`, retirando interceptaciones. No se consultaron perfiles reales ni se
repitió la matriz backend de autorización en P09.

## Vista 404 de SPA frente a HTTP del hosting

Esta SPA usa BrowserRouter en el cliente. Para una entrada directa o recarga de
ruta interna, el hosting debe entregar el documento de entrada y los assets
correctos. Después React Router decide si corresponde una vista o esta 404.
Mostrar «404» en React **no modifica** el estado HTTP del documento ya recibido.
En el sondeo real del preview, `/p09-inexistente?origen=directo` recibió **HTTP
200** y mostró la 404: es una respuesta de fallback de SPA, a veces denominada
soft 404. La navegación por Link ni siquiera solicita un nuevo documento.

Un hosting sin fallback puede responder con su propia 404 antes de cargar
React; esta página entonces no se ejecuta. Para devolver un HTTP 404 real junto
con una interfaz personalizada, el servidor/edge debe resolver la existencia de
la ruta o aplicar una estrategia equivalente. No basta con cambiar un componente
React. No debe convertir errores de `/api` ni assets/chunks ausentes en HTML de
entrada, y las rutas válidas deben seguir recuperándose al recargar.

No se ha inspeccionado ni modificado la configuración efectiva del hosting
público. Su fallback, códigos HTTP, assets y recarga quedan para P14; un preview
local no acredita producción. El HTTP 404 de un recurso API sigue siendo una
respuesta independiente del HTTP del documento y de la existencia de la ruta.

## Documentación y límites

Versiones resueltas en lockfile: React **19.3.1**, React Router **7.18.5**, MUI
**6.4.7**. Skill React aplicada: estado derivado durante render, sin nuevo
contexto/copia de sesión ni solicitudes desde la 404.

Context7 consultado para comodines y Routes declarativos; no ofrece patch
7.18.5 en su catálogo. Se contrastó con la documentación oficial de
[routing declarativo](https://reactrouter.com/start/declarative/routing) y
[Navigate 7.18.5](https://reactrouter.com/7.18.5/api/components/Navigate).
La URL versionada de routing no pudo abrirse con el buscador; la página actual
y los ejemplos Context7 se contrastaron con el código instalado y los recorridos.
[Vite: despliegue estático](https://vite.dev/guide/static-deploy.html) aclara que
preview es una comprobación local, no un servidor de producción.

No se acredita conformidad WCAG completa, hosting público ni contratos backend
por estas simulaciones. Se conservan los límites anteriores de P04–P08, incluido
el contrato pendiente de P06 y la limpieza física no acreditada de P07.
