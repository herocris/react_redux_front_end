# P11 — Revisión visual, móvil y accesibilidad

Fecha: 12 de noviembre de 2026. Se ejecuta únicamente P11 del plan de portafolio.
Workspace inicialmente limpio; P01–P10 y los 16 pasos de migración se conservan.
No se rediseña la aplicación ni se modifican contratos, permisos, credenciales,
dependencias o registros del backend. El acceso precargado sigue siendo intencional.

## Entorno y alcance

Playwright MCP activo, Chromium y build de producción servido por el preview
local `http://127.0.0.1:4176`. Escritorio 1440×1000, móvil 390×844 y controles
adicionales a 320×844/320×568. Son tamaños de viewport, no dispositivos físicos.
Sesión, API, imagen PNG de un píxel, teselas y geocodificación simuladas en un
contexto nuevo que se cierra en `finally`. Las dos escrituras del recorrido son
intentos multipart interceptados; no se escribe en Laravel ni se usan cuentas reales.

Recorrido conservado en [accessibility-p11.js](../tests/browser/accessibility-p11.js).
[Resultado y mediciones](verification-accessibility-p11-results-2026-11-12.json).
No se afirma conformidad WCAG completa: es una auditoría representativa de
interacción, semántica observable, contraste de texto seleccionado y aspecto.

## Hallazgos confirmados y correcciones

| Flujo | Evidencia anterior | Corrección comprobada |
| --- | --- | --- |
| Login | Un rechazo remontaba el formulario por `authorizationRevision`, restableciendo correo/contraseña | `onAuthenticationFailure` presenta el error cuando ya se está sin sesión; login/logout auténticos mantienen sus fronteras y limpieza. RHF conserva el borrador y permite reintentar |
| Errores de campos | Contraseña inválida sin `aria-describedby`; error de imagen separado de su control visible | Mensajes asociados por ID; referencia RHF de la foto apunta al botón visible y su error se anuncia. El error HTTP del login tiene `role="alert"` |
| Login/contraste | Registrar 3,54:1 y Consultar API 4,22:1 sobre `#f5f5f5` | Enlaces subrayados con `text.primary`, medidos a 14,97:1 en claro |
| Navegación móvil | Tras abrir y cerrar enseguida con Escape podía quedar `isClosing` activo y no reabrir | Fin de cierre ligado a `slotProps.transition.onExited`, sin depender del evento DOM `transitionend` |
| Formulario modal | Ancho fijo 400 px: a 390 px, borde izquierdo −4,8 px y derecho 395,2 px; sin cierre visible | Ancho limitado al viewport, altura máxima y scroll vertical; Cancelar visible y deshabilitado durante envío |
| Confirmación | El foco inicial recaía en el contenedor | Cancelar recibe foco; Escape y restauración al disparador verificados |
| Foto/pantalla baja | Tooltip persistente interceptaba Guardar en 320×568 | Tooltip informativo sin interacción; envío y reintento con el mismo archivo comprobados |
| Filtros de análisis | Dos grupos llamados «Selecciona una fecha» | Etiquetas distintas «Fecha inicial» y «Fecha final»; tipos visuales exponen `aria-pressed` |
| Gráficos | Pastel sin nombres/valores visibles en reposo y snapshot reducido a `application`; colores aleatorios y texto fijo de ejes/leyenda | Tabla desplegable con los mismos datos de Query para barras/líneas/pastel; colores estables por tema, ejes/leyenda y texto activo usan el color del tema. La tabla evita depender de hover o color |
| Mapa de análisis | Zoom en inglés, marcadores genéricos; Escape no cerraba de forma fiable con el foco en el marcador | Región y marcadores nombrados, Acercar/Alejar; detalle recibe foco tras insertarse, tiene Cerrar detalle, cierra con Escape y devuelve foco al marcador |
| Ubicación en formulario | Seleccionar coordenadas requería clic; al alternar mapa/formulario se perdía el foco | Flechas del mapa y «Usar centro del mapa» llaman al mismo `selectLocation` y geocodificación; foco al entrar y retorno al botón del formulario |

Archivos: componentes compartidos `FormModal`, `ConfirmDialog`, `PhotoInput`,
`OptionSelector`, `boxStyle`; login, contraseña, slice/thunks auth; layout;
formularios de filtros y componentes de gráficos, `GraphDataTable` y
`graphColors`; mapa de análisis y componentes/tipos del formulario de decomisos.
Sin una segunda copia de sesión, datos remotos o estado de edición.

No se cambia la validación ni el transporte de archivos. Se preservan el
control de concurrencia, cancelación y credenciales separadas de geocodificación.
La nueva opción de teclado reutiliza sus mismos eventos y manejo de fallos.

## Casos aprobados

Ocho grupos del recorrido final, sin excepciones de página ni consola inesperada:

1. Login a 1440/390/320: sin desbordamiento, foco de validación, error asociado,
   mostrar/ocultar contraseña por teclado, error HTTP anunciado, borrador y reintento.
2. Menú móvil: Enter, Escape, retorno de foco, reapertura y navegación que cierra
   el drawer. Teclado dentro de DataGrid sin perder el foco.
3. Modal a 1440×1000, 390×844 y 320×568: cabe, contiene/restaura foco y ofrece
   Cancelar. Validación de descripción/foto, fallo de guardado que conserva texto
   y preview, mismo archivo en el reintento exitoso.
4. Confirmación de borrado: nombre/descripción, foco inicial seguro, Escape y
   retorno al disparador. Error de listado y recuperación por Reintentar listado.
5. Tabla de decomisos a 320: scroll horizontal interno y acciones accesibles con
   teclado, sin desbordamiento de la página. Se conserva la tabla.
6. Gráficos a 1440/390: etiquetas distintas, validación, selección con teclado y
   estado pulsado, tabla accesible con valores 12/8 en las tres variantes,
   tema oscuro, error/reintento conservando filtros.
7. Mapa a 1440/390: región, zoom, marcador, entrada al detalle y Escape con retorno
   de foco; sin desbordamiento. Teselas de prueba, no cartografía real validada.
8. Formulario de decomisos móvil: foco mapa/formulario, fallo de geocodificación
   sin perder observación/dirección, edición manual, recuperación seleccionando
   el centro por teclado. Se conserva también el clic.

La tabla puede truncar texto en celdas y mostrar una barra horizontal. El recorrido
no encontró una acción inaccesible por ello; su anchura o densidad no se considera
un defecto por sí misma. No se atribuye un desplazamiento automático a las flechas
si la acción enfocada ya está visible. La sombra pronunciada de los formularios,
la paleta concreta, la densidad y la altura del mapa son preferencias visuales;
no justificaron una sustitución general de componentes.

## Contraste y capturas

Colores computados en navegador y ratio sRGB de luminancia relativa, componiendo
el alfa sobre los fondos de ancestros. La aserción final exige al menos 4,5:1 en
las muestras de texto seleccionadas. No mide todos los estados, píxeles, iconos,
bordes ni la cartografía; no sustituye una revisión de todos los criterios WCAG.

| Muestra final | Ratio |
| --- | --- |
| Error de login sobre fondo claro | 4,57:1 |
| Enlaces del login claros | 14,97:1 |
| Tipo de gráfico/categoría seleccionado, claro | 4,60:1 |
| Tipo seleccionado, oscuro | 6,40:1 |
| Etiquetas de filtros, oscuro | 9,43:1 |
| Ejes/leyenda de barras y tabla, oscuro | 18,73:1 |

Capturas finales inspeccionadas después de las animaciones; login enmascarado,
sesión ficticia «Demo» y valores inventados. El mapa blanco es una tesela simulada,
no una evidencia de entrega real de OpenStreetMap.

- [Login móvil con rechazo](screenshots/p11-login-mobile.png).
- [Formulario a 320×568 tras fallo de guardado](screenshots/p11-form-mobile.png).
- [Tabla móvil y foco en acción](screenshots/p11-table-mobile.png).
- [Gráfico móvil y tabla de valores](screenshots/p11-graph-mobile.png).
- [Pastel oscuro](screenshots/p11-graph-dark.png).
- [Barras oscuras con ejes y leyenda](screenshots/p11-bar-dark.png).
- [Mapa móvil con teselas simuladas](screenshots/p11-map-mobile.png).

## Comprobaciones y límites

- `npm test`: **261/261**, incluidos contratos, geocodificación, sesión/Query y
  una nueva regresión de auth. La suite inicial previa a cambios era 260/260.
  Un test anterior montaba el reducer auth como raíz; se adapta al contrato real
  `{ auth }` que ahora lee el thunk. El fallo intermedio fue corregido y la suite
  completa se repitió. No se elimina cobertura de mensajes o rechazos.
- `npm run lint`: sin errores ni advertencias. `npm run build`: TypeScript y
  build correctos, incluido el último ajuste de colores claro/oscuro.
- Playwright MCP: **8 grupos P11** sobre el build final. Regresión P10: **5 grupos**
  aprobados con capturas separadas en `.playwright-mcp`; no se sustituyó su evidencia
  histórica. La última modificación de paletas se revalidó con el recorrido P11.
- Sintaxis del script, JSON, enlaces documentales y diff revisados. Se restaura
  únicamente `tsconfig.app.tsbuildinfo`, generado por el build, al estado inicial.

Los primeros intentos detectaron el error 504 de optimización del servidor de
desarrollo; se usó el preview existente y un build nuevo. Ambos intentos de arrancar
servidor detectaron puertos ocupados; no se cerraron procesos ajenos. Los selectores
de errores del recorrido se ajustaron a los mensajes públicos de `apiErrors`, que
normaliza 401/503. Las capturas iniciales durante animación se sustituyeron por las
finales; el foco de popup se espera después de su inserción. La navegación al mapa
es interna, para conservar los filtros Redux; recargar la URL no conserva ese estado.

Quedan fuera de esta comprobación: lectores de pantalla y anuncios efectivos en
AT, Safari/Firefox, dispositivos táctiles físicos, todos los tamaños/zoom y temas
de cada pantalla, filtros complejos de DataGrid, todos los campos/formularios,
mapa de calor con muchos puntos, popups con todas las combinaciones de subdecomisos,
daltonismo y contraste exhaustivo de elementos no textuales. Tampoco se repite
integración Laravel, entrega de teselas/medios reales ni hosting público. Los límites
anteriores P04/P05/P06/P07 siguen vigentes. No se declara conformidad WCAG completa.

## Fuentes y versiones

`package-lock.json`: React 19.3.1, MUI 6.4.7, DataGrid 7.27.3, Date Pickers 8.14.0,
React Hook Form 7.55.0, Recharts 3.3.0, React Leaflet 5.0.0 y Leaflet 1.9.4.
Skills React/composición leídas: eventos para interacción, edición con su dueño
existente y composición de contenido; sin contextos ni abstracciones generales.

Context7 respondió para [Modal MUI v6](https://v6.mui.com/material-ui/react-modal/),
[Dialog](https://v6.mui.com/material-ui/api/dialog/),
[Drawer y su transición](https://v6.mui.com/material-ui/api/drawer/) y
[React Leaflet](https://react-leaflet.js.org/docs/api-components/).
No se ofrecen todos los patches exactos; APIs contrastadas con tipos/código de las
versiones instaladas y build/navegador. Se completó la consulta con documentación
oficial de [Leaflet 1.9.4](https://leafletjs.com/reference-1.9.4.html),
[XAxis Recharts](https://recharts.github.io/en-US/api/XAxis/) y
[Legend Recharts](https://recharts.github.io/en-US/api/Legend/); estas dos páginas
no fijan el patch 3.3.0, por lo que se contrastaron con la instalación local.

P11 queda cerrado dentro de este alcance representativo. Siguiente tarea disponible:
P12, sin ejecutar. Sin commits, push, publicación o despliegue.

## Consolidación posterior solicitada

`3b25c50` registra implementación y pruebas de P11. Este informe, el resultado JSON,
las siete capturas ficticias/enmascaradas y ambos progresos se consolidan en un
segundo commit documental. Se reutilizan las verificaciones del mismo código:
261 pruebas, lint/build, ocho grupos P11 y cinco de regresión P10. No se cuentan
como nuevas ejecuciones. Diff e índice revisados; sin push ni despliegue. P12
permanece sin ejecutar y los límites anteriores se conservan.
