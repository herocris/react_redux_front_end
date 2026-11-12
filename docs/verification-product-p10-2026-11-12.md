# P10 — Identidad y panel de inicio

Verificación del 12 de noviembre de 2026. Solo P10; no ejecuta P11–P15.

## Identidad y criterio de producto

Se propone **Decomisos**, con el descriptor **Gestión y análisis de decomisos**.
No se encontró un nombre de producto acordado: `React Redux App`, el favicon
de Vite y los encabezados de librerías eran la identidad visible anterior.
Es una propuesta descriptiva para esta aplicación, no una marca institucional
ni una acreditación de cifras oficiales. El icono SVG propio representa un
registro con barras, con el azul del tema MUI. No añade dependencias.

`index.html` usa `lang="es"`, título de producto y descripción. Login, registro,
barra y menú comparten nombre e idioma. Se conserva deliberadamente el acceso
precargado. Se tradujeron contraseña y su control de visibilidad, acciones y
controles de tablas, nombres de columnas de catálogos/cuentas/roles y calendario
(MUI y Day.js). No se traducen identificadores de rutas, payloads, permisos ni
mensajes suministrados por el backend. La cabecera deja de mostrar la URL del
repositorio como título de la aplicación; la presentación documental queda en P15.

## Datos y dashboard

Contraste con la implementación anterior:

| Elemento anterior | Fuente acreditada por el código | Decisión P10 |
| --- | --- | --- |
| Barras y líneas de 2020–2025 | `dashboard/demoData.ts`, valores constantes y nombres de ejemplo | Retirados del panel; no eran indicadores remotos |
| Mapas de ubicación/calor | Coordenadas e hijos constantes del mismo archivo | Retirados del panel; no representaban una consulta de sesión |
| Tabla de drogas | `useDrugView` → Query → service → API del entorno | Se consulta en su catálogo, sin duplicarla en el panel |
| Gráficos y mapa de sus vistas | Services existentes y filtros aplicados | Conservados, sin nuevos endpoints o agregaciones |

La procedencia API acredita el origen técnico, **no la autenticidad de cada
registro**. No se auditaron ni cambiaron datos persistentes; tampoco se afirma
que sean registros operativos reales. La preparación/restablecimiento de datos
de demostración permanece en P12. Login y panel identifican la demostración;
el panel advierte que los registros pueden contener ejemplos y que no son cifras
oficiales. No hay contadores, tendencias, totales agregados ni valores inventados.

El panel ofrece accesos con una explicación breve de gestión, análisis y
catálogos, además de administración/actividad solo si están autorizados. No
hace lecturas ni escrituras. Con únicamente `dashboard.view` muestra un estado
vacío útil y conserva actualización de permisos y logout. Se retira la antigua
dependencia global de drogas/gráficos/mapas: cada destino verifica `canAccess`
con sus propias dependencias; sus guards siguen situados antes de las consultas.
No hay bypass por rol ni segunda sesión. La convención queda en AGENTS.md.

Se retiró `demoData.ts` tras comprobar su único consumidor. La ruta del panel
sigue siendo lazy; no importa gráficos, Leaflet ni DataGrid. Las consultas,
estados de carga/error/vacío, filtros e invalidación de las vistas de destino
mantienen sus propietarios. El menú móvil se cierra al elegir un destino y el
contenido usa padding adaptable y `minWidth: 0`. Se reutiliza el tema existente,
incluido modo oscuro, sin introducir un sistema visual adicional.

## Comprobaciones nuevas

- `npm test`: **260/260**, cero fallos. La cobertura de acceso se adapta al panel
  independiente; se conservan contratos, Query y sesión.
- `npm run lint`: correcto, sin advertencias. `npm run build`: TypeScript y Vite
  correctos. Se retira el cambio incidental de `tsconfig.app.tsbuildinfo`.
- Playwright MCP operativo, build/preview local en `127.0.0.1:4176`, **5 grupos
  P10** aprobados en `tests/browser/product-p10.js`: identidad/icono/lang, login
  y entrada lazy; permisos parciales y denegación; panel autorizado sin lecturas
  ni chunks de análisis anticipados; teclado/listado vacío/error/reintento/atrás;
  gráficos lazy, calendario español, móvil/menú/retorno/logout.
- Escritorio 1440×1000 y móvil 390×844, sin desbordamiento horizontal. Capturas
  claras/oscuras y login revisadas visualmente. El control de logout permanece
  dentro del viewport móvil; el menú se cierra tras navegar.
- Regresión P04: **7 grupos** aprobados con sesión/API simuladas, sin excepciones
  ni avisos inesperados. Se adaptan las expectativas de dependencias y lecturas
  del panel (ahora cero); se conservan las de análisis, formularios y CRUD.
- Regresión P09: **7 grupos** aprobados, sin excepciones; 404, permisos, navegación,
  recurso 403/404 y logout conservados. Los 28 errores HTTP de consola fueron
  respuestas deliberadas del escenario, no excepciones JS.
- Los recorridos históricos afectados se adaptan a las etiquetas españolas;
  su modificación no significa que se haya repetido cada uno. Sintaxis y diff
  comprobados. No se instaló otro runner.

En P10 no hubo excepciones JS ni avisos inesperados. Los HTTP 401 de sesión
anónima y 500 del listado son simulaciones deliberadas. Un primer intento de
cargar el script tuvo un punto y coma final incompatible con el evaluador;
corregido. La comprobación adicional de calendario buscó inicialmente «Elegir
fecha» en vez del texto instalado «Elige fecha»; selector corregido y recorrido
final completo aprobado. Las capturas iniciales del login se tomaron durante
Grow: se sustituyeron por capturas tras finalizar la transición.

## Capturas sin datos personales

Sesión ficticia «Demo», sin registros, correo ni datos personales visibles.
Los campos del login precargado se enmascaran por completo en la captura;
los valores de la aplicación se conservan. Archivos reproducibles del recorrido:

- [Panel de escritorio](screenshots/p10-dashboard-desktop.png).
- [Panel móvil](screenshots/p10-dashboard-mobile.png).
- [Panel oscuro](screenshots/p10-dashboard-dark.png).
- [Acceso de escritorio enmascarado](screenshots/p10-login-desktop.png).
- [Acceso móvil enmascarado](screenshots/p10-login-mobile.png).

## Documentación consultada y límites

Versiones resueltas en `package-lock.json`: React 19.3.1, MUI 6.4.7,
DataGrid 7.27.3, Date Pickers 8.14.0, Day.js 1.11.18 y React Router 7.18.5.
Skills React/composición aplicadas a valores derivados y composición simple,
sin contextos o memoización nuevos. Context7 no ofrece todos los patches exactos:
MUI v6, MUI X 7.29.4 y 8.11.0 se contrastaron con las APIs y traducciones
instaladas y con las fuentes oficiales devueltas por Context7:
[composición MUI v6](https://v6.mui.com/material-ui/guides/composition/),
[localización DataGrid](https://github.com/mui/mui-x/blob/v7.29.4/docs/data/data-grid/localization/localization.md),
[adaptador de fechas](https://github.com/mui/mui-x/blob/v8.11.0/docs/data/date-pickers/adapters-locale/adapters-locale.md)
y [textos del calendario](https://github.com/mui/mui-x/blob/v8.11.0/docs/data/date-pickers/localization/localization.md).
Build y navegador verifican el uso con las versiones instaladas.

Esta ejecución **no verifica integración real con Laravel, hosting público ni
autenticidad de datos**. No accede a cuentas reales ni escribe fixtures. El
preview ya estaba disponible; el intento de iniciarlo de nuevo detectó el puerto
ocupado y se reutilizó, comprobando el título/build servido. No acredita una
auditoría completa de accesibilidad, otros anchos o todos los formularios; eso
permanece en P11. No se modifican endpoints, dependencias, credenciales ni
asignaciones. No hay commits ni despliegues. Siguiente tarea: **P11**, sin ejecutar.

## Consolidación posterior solicitada

`e3fd8fe` registra implementación y pruebas de P10. La guía, este informe, las
cinco capturas y ambos progresos se consolidan en un commit documental separado.
Se reutilizan las comprobaciones anteriores porque el código verificado no ha
cambiado; no se cuentan como ejecuciones nuevas. Diff e índice revisados.
Esta consolidación crea commits locales; no realiza push ni despliegue y no
ejecuta P11.
