# Verificación de los bloques de fotos y errores de red

Fecha: 7 de noviembre de 2026.

## Entorno y método

- Brave, Chromium 157.0.8103.39, con perfil temporal independiente.
- App en desarrollo, React 19.3.1 y Vite 8.3.5.
- Playwright 1.65.0-alpha-2026-10-30, disponible con el MCP configurado.
  Context7 no ofrecía esa versión exacta; se contrastaron las APIs con su
  documentación y la instalación local.
- Ejecución mediante Playwright local y repetición de los 17 casos mediante
  Playwright MCP. No se instalaron dependencias adicionales en el proyecto.
- `PhotoInput` se montó con React Hook Form real en una página de prueba
  interceptada, sin añadir rutas al producto.
- Los flujos de usuarios, login y registro usaron la app real con respuestas HTTP
  simuladas y abortos de transporte. No se modificaron registros del backend.

## Resultado: 17 comprobaciones satisfactorias

| Caso | Resultado |
| --- | --- |
| Foto: foco y activación por teclado sin enviar el formulario | Pasa |
| Foto: eliminar y seleccionar de nuevo el mismo archivo | Pasa |
| Foto: selección múltiple, borrado parcial y reset | Pasa |
| Foto: cambio de `multiple` y liberación de URLs al desmontar | Pasa |
| Foto: no revocar direcciones de imágenes del servidor | Pasa |
| Usuarios: una petición inicial de listado y fin de carga | Pasa |
| Usuarios: fallo de red en listado muestra alerta y termina carga | Pasa |
| Usuarios: alta fallida mantiene formulario y datos | Pasa |
| Usuarios: error 422 se asocia al campo de correo | Pasa |
| Usuarios: error 500 sin JSON muestra mensaje seguro | Pasa |
| Usuarios: reintento de alta exitoso cierra formulario y limpia error | Pasa |
| Usuarios: actualización fallida conserva datos; reintento exitoso | Pasa |
| Usuarios: borrado fallido conserva diálogo; reintento exitoso | Pasa |
| Login: fallo de red muestra mensaje y sale de `checking` | Pasa |
| Login: error HTTP del backend se muestra como texto | Pasa |
| Registro: fallo de red y reintento con datos válidos | Pasa |
| Ausencia de excepciones no controladas en estos recorridos | Pasa |

El caso de teclado comprueba la invocación del input de archivos y evita el
envío del formulario; los archivos se adjuntan mediante `setInputFiles`. No se da
por verificado el diálogo nativo del sistema operativo: la espera del evento
`filechooser` no respondió en el primer intento con Brave.

## Hallazgo adicional: validación local incompatible

Enviar el registro vacío produce un `ZodError` no controlado y no presenta
errores de campo. Este caso adicional falla, aunque los flujos anteriores con
datos localmente válidos pasan.

Se confirmó en el navegador y en las fuentes instaladas:

- `@hookform/resolvers` 4.1.3 reconoce errores mediante `error.errors`.
- Zod 4.6.7 entrega `error.issues`, sin un array `error.errors`.
- El resolver vuelve a lanzar la excepción en vez de convertirla en errores de
  React Hook Form 7.54.2.

Esta combinación de dependencias es previa a ambos bloques y no se ha actualizado
durante la verificación. Se recomienda corregir su compatibilidad como siguiente
bloque y cubrir formularios válidos e inválidos.

También se observó que el registro pierde los valores tras pasar por
`checking`: el router desmonta la vista y vuelve a crearla con valores vacíos.
El reintento satisfactorio de la tabla vuelve a introducir datos válidos.

## Herramientas y corrección del lanzador

El primer arranque de Chrome DevTools MCP truncaba la ruta de Brave en
`C:\Program`. Se corrigió `scripts/run-mcp.mjs` para ejecutar `npx-cli.js` mediante
Node en Windows y pasar la ruta como un argumento, sin comillas de shell.

Chrome DevTools MCP 1.12.0 se verificó mediante una conexión MCP nueva usando el
lanzador corregido: abrió Brave, descubrió las herramientas React y ejecutó
`react_get_component_tree` con nodos de la app. Es necesario esperar a que React
monte; una consulta anterior al montaje devolvió `No mounted React roots found`.
No se hizo un perfil de rendimiento, al no tratarse de un cambio de rendimiento.

## Límites

Las respuestas simuladas prueban el comportamiento del frontend, no una sesión
real autenticada, las cookies del servidor ni persistencia de fotos. No se
comprobó una descarga real de imágenes existentes del backend.

La inspección visual se complementó con captura del formulario de registro y
las comprobaciones DOM de los recorridos. No constituye una auditoría general
de accesibilidad ni de diseño adaptable.

## Tercer bloque: compatibilidad de validación corregida

Se actualizó `@hookform/resolvers` de 4.1.3 a 5.9.2 y React Hook Form de 7.54.2
a 7.55.0, mínimo requerido por el nuevo resolver. Zod permanece en 4.6.7.
Context7 cubre el resolver 5.9.2 y se verificaron los requisitos de versiones en
npm. El lockfile recoge las dos actualizaciones y la reorganización de
dependencias transitivas que realiza npm; no cambian endpoints ni esquemas.

Los formularios de decomisos de drogas, armas y municiones declaran por separado
entrada y salida del esquema en `useForm`, de modo que el submit sigue recibiendo
números tras las coerciones. El registro presenta ahora también los errores de
nombre y correo mediante los `helperText` de MUI.

`tests/form-validation.test.mjs` reprodujo el fallo con las versiones anteriores:
tres subcasos de datos inválidos lanzaban `ZodError`; los datos válidos pasaban.
Con las versiones nuevas pasan los seis subcasos de validación, que incluyen
contraseñas distintas, entradas numéricas de texto, conservación de fotos y
formateo de fechas. Junto a las comprobaciones de errores HTTP, `npm test`
informa 13 pruebas satisfactorias, contando los grupos padre.

En Brave con Playwright MCP se verificaron además estos cuatro recorridos:

- Registro vacío: los cuatro mensajes de campo son visibles.
- Contraseñas diferentes: error asociado a la confirmación.
- Corrección del registro: alcanza el servidor simulado.
- Login vacío: errores visibles sin excepción no controlada.

Los 17 recorridos de regresión anteriores se repitieron con las nuevas versiones
y volvieron a pasar sin excepciones no controladas. Se regeneró la caché de Vite
antes de las pruebas para evitar el resolver antiguo precargado.

El fallo de validación local descrito en el hallazgo inicial queda corregido.
La pérdida de valores del registro al pasar por `checking` sigue pendiente; es
un problema independiente del router y no se modificó en este bloque.
