# Guía de despliegue y verificación P14

## Estado al 12 de noviembre de 2026

**P14 parcial. Verificación pública pendiente de disponer de producción.**
El propietario confirmó durante esta tarea que aún carece del despliegue de
producción. La guía reúne la revisión local y los criterios para comprobar el
destino cuando esté disponible.

La búsqueda abarcó documentación, README, workflow, configuración Vite, variables
locales, código de rutas/login y remoto Git. Los entornos documentados son
`http://localhost:5174`, API `http://localhost/api` y medios
`http://localhost/storage`. `DROPLET_HOST` y `REACT_ENV` son referencias a secrets
en el workflow, cuyo contenido y disponibilidad quedan sin comprobar.

El enlace «Consultar API» de `src/modules/auth/views/LoginView.tsx` apunta a
`https://crisdemo.xyz/api/documentation`. Esa referencia permitió ensayar un
candidato, cuya correspondencia con un frontend publicado queda sin confirmar.
Playwright MCP respondió `net::ERR_CONNECTION_REFUSED` para los tres accesos
`https://crisdemo.xyz/`, `http://crisdemo.xyz/` y
`https://crisdemo.xyz/api/documentation`. El error acredita el resultado desde
este navegador en esta ejecución. La causa requiere diagnóstico del destino.

## Configuración de compilación contrastada

Versiones resueltas en `package-lock.json`, Vite **8.3.5**, React Router
**7.18.5** y Axios **1.21.0**. Context7 cubrió Vite **8.3.5** exactamente.

`npm run build` ejecuta `tsc -b && vite build` en modo production. Vite sustituye
las variables `import.meta.env` al compilar. Carga `.env` y `.env.local`, además
de los archivos del modo. Los archivos del modo prevalecen sobre los genéricos
y las variables presentes en el proceso tienen prioridad superior. El bundle
es público. Las variables `VITE_` deben contener únicamente configuración
pública. [Documentación Vite 8.3.5](https://github.com/vitejs/vite/blob/v8.3.5/docs/guide/env-and-mode.md).

| Variable | Consumidor | Local | Configuración pública pendiente |
| --- | --- | --- | --- |
| `VITE_API_URL` | `src/api/graphdataApi.ts` | `http://localhost/api` | Base API del destino, incluyendo su prefijo real |
| `VITE_LOCAL_PHOTOS_URL` | `src/helpers/getMediaUrl.ts` | `http://localhost/storage` | Base pública de medios confirmada con ese backend |

Las referencias absolutas de imágenes recibidas del backend conservan su URL.
Revisar también esas referencias en el destino, especialmente esquema y host.
La base de medios solo resuelve las referencias relativas.

El job `checks` compila sin el secret privado. El job `deploy` escribe
`REACT_ENV` en `.env` y hace otra compilación antes de empaquetar `dist`.
Ambas variables deben tener los valores del destino durante esa compilación.
Cambiar variables en nginx o en un contenedor que sirve archivos ya compilados
requiere generar de nuevo el bundle para que el navegador reciba otros valores.
La plantilla documenta ahora esa distinción entre reinicio de desarrollo y build.

El build local con `.env` incorpora las URLs localhost, que en un navegador
remoto apuntarían al equipo del visitante. El build genérico también termina
correctamente con las dos variables ausentes. En ese caso Axios carece de
`baseURL` configurada y las referencias relativas de medios carecen de base.
El éxito de compilación deja pendiente validar la configuración efectiva.

## Hosting SPA que debe comprobarse

`vite.config.ts` define `base: '/'` y `src/bootstrap.tsx` usa
`BrowserRouter basename="/"`. El destino previsto sirve la app en la raíz.
Un alojamiento en subdirectorio requiere coordinar ambas bases y verificar
sus rutas y assets. [Base de Vite](https://github.com/vitejs/vite/blob/v8.3.5/docs/guide/build.md).

Para las rutas cliente, el servidor debe entregar `index.html` cuando se solicita
directamente una URL como `/dashboard` o `/confiscation`. En nginx, el patrón
`try_files $uri $uri/ /index.html;` puede cubrir el espacio de rutas de la SPA.
El administrador debe integrarlo con el `root` efectivo y las ubicaciones
existentes. `/api/`, medios y assets requieren sus destinos propios y errores
reales cuando falten. Un JS ausente debe devolver 404, evitando que el fallback
le entregue HTML con HTTP 200. Este repositorio carece de configuración nginx
que permita acreditar su implementación. [Directiva try_files](https://nginx.org/en/docs/http/ngx_http_core_module.html#try_files).

La vista «Página no encontrada» de React puede recibirse con HTTP 200 si se
sirvió el documento de entrada mediante fallback. Registrar por separado estado
HTTP y vista cliente. `vite preview` permite revisar el build localmente.
El comportamiento del servidor público requiere su propia medición.
[Despliegue estático Vite](https://vite.dev/guide/static-deploy.html).

El workflow reemplaza `dist` mediante borrado/descompresión y tolera el fallo
del reinicio nginx con `|| true`. Quedan por revisar en hosting la continuidad
del reemplazo, el diagnóstico del reinicio y la política de caché. Una pestaña
abierta puede solicitar chunks del build anterior. Comprobar revalidación de
`index.html`, coherencia de assets con hash y disponibilidad durante el cambio.

## Matriz pública pendiente

Todos los casos siguientes requieren una URL de producción confirmada y accesible.

| Área | Recorrido y evidencia necesaria | Estado P14 |
| --- | --- | --- |
| HTTPS | Abrir frontend, API y medios, comprobar certificado, redirección HTTP y ausencia de contenido mixto | Pendiente |
| API y CORS | Login precargado y lecturas, observar URL efectiva, OPTIONS cuando corresponda y respuestas HTTP | Pendiente |
| Cookies | Inspeccionar atributos saneados, aceptación, envío, refresh tras recarga y logout | Pendiente |
| Imágenes | Abrir catálogo y detalle existente, decodificar imágenes tras recarga y comprobar origen/estado HTTP | Pendiente |
| Fallback SPA | Abrir directamente y recargar `/dashboard`, `/confiscation`, un detalle válido y una ruta desconocida | Pendiente |
| Chunks lazy | Navegar mediante enlaces a catálogo, gráficos y mapa, comprobar solicitud JS al abrir y MIME correcto | Pendiente |
| Consola y red | Registrar excepciones, fallos de transporte y HTTP relevantes del recorrido, distinguiendo rechazos esperados | Pendiente |

Axios conserva `withCredentials: true`. Si API y frontend tienen distinto
origen, el servidor debe permitir el origen concreto del frontend y credenciales.
Comprobar los headers en preflight y respuesta efectiva. El comodín de origen
impide el acceso CORS con credenciales. [CORS con credenciales](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

Registrar nombre y atributos de la cookie sin copiar valores. Revisar `Secure`,
`HttpOnly`, `SameSite`, dominio, ruta y caducidad según el contrato backend.
Las cookies cross-site con `SameSite=None` requieren `Secure` y pueden verse
limitadas por políticas del navegador sobre cookies de terceros. La topología
real determinará los ajustes backend. Verificar persistencia mediante login,
recarga/refresh y logout en ese navegador. [Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie).

Usar la cuenta de demostración precargada y el recorrido de consultas de
[demo-guide.md](demo-guide.md). Resolver IDs e inventario en el entorno público.
El conjunto `DEMO_P12_V1` y sus IDs están acreditados en local. La preparación
pública y el inventario de ese entorno siguen pendientes. Evitar altas,
ediciones, borrados y preparación de datos durante esta comprobación de hosting.
Conservar credenciales y asignaciones de la cuenta existente.

## Comprobaciones locales nuevas y límites

- Workspace inicialmente limpio. `npm.cmd test` aprobó **261/261**, cero fallos,
  canceladas u omitidas. Transporte controlado por la suite.
- `npm.cmd run lint -- --max-warnings=0` terminó con exit 0.
- Dos ejecuciones completas de `npm.cmd run build` terminaron con exit 0 en
  una copia temporal del código actual, enlazada a las dependencias instaladas.
  La primera carecía de `.env` y la segunda usó el `.env` local. La búsqueda
  en JS encontró cero coincidencias de las URLs localhost en la primera y
  ambas URLs en la segunda, cada una en un archivo. Se generaron doce chunks
  separados de rutas, gráficos y mapa. La entrega por red queda pendiente.
- Logs locales en `%TEMP%/frontend-p14-tests.log`, `frontend-p14-lint.log`,
  `frontend-p14-build-generic.log` y `frontend-p14-build-local.log`. La ruta
  de la copia se conserva en `%TEMP%/frontend-p14-build-path.txt`.
- Playwright MCP estuvo operativo e intentó los tres accesos al candidato.
  El rechazo de conexión impidió observar HTML, certificado, cookies o tráfico
  funcional. La cuenta demo pública quedó sin utilizar. Los resultados P12
  mantienen su alcance de API y medios locales.
- Diff sin errores de whitespace y enlaces locales de las secciones P14 y
  ambas guías comprobados. El barrido del progreso histórico detectó dos enlaces
  anteriores a `LegacyEntityList.tsx` y `useEntityList.tsx`, retirados en la
  migración. Esas referencias históricas quedan fuera de esta revisión P14.

La revisión deja pendientes la URL de producción, sus bases API/medios y la
configuración efectiva del hosting. El enlace «Consultar API» requiere
confirmación del propietario del destino. El contenido de los secrets, GitHub
Actions, SCP/SSH y nginx sigue pendiente de comprobación. Esta ejecución produjo
documentación y una corrección de comentarios en la plantilla. No se realizaron
publicaciones, cambios externos, commits ni escrituras en datos de aplicación.
