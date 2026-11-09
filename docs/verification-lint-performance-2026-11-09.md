# Mantenimiento de lint y rendimiento — 9 de noviembre de 2026

Trabajo posterior al plan, solicitado expresamente por el usuario. El cierre del
paso 16 quedó guardado en `97a1d0a`. No se inicia otro paso de migración ni la
validación contra backend real, que queda para un trabajo posterior.

## Deuda de lint

Referencia del paso 16: 10 errores y 9 advertencias. Resultado final:
`npm.cmd run lint -- --max-warnings 0`, salida 0, sin errores ni advertencias.
No se deshabilitan reglas ni se añaden exclusiones o comentarios de supresión.

- Callbacks explícitos en AddFloatingButton; PasswordField genérico con
  `FieldPath`/`UseFormRegister` del formulario consumidor.
- Props de FieldsForm con tipos RHF y separación de entrada/salida del esquema,
  incluidos handleSubmit, register, errores y Control. Sin cambios en validación,
  valores enviados, archivos ni servicios.
- Retirada de una expresión sin efecto en getEnvVariables y simplificación de
  timeout constante en AuthLayout, manteniendo 1.000 ms.
- Índices sin JSX de auth, confiscation, drug y router renombrados de `.tsx` a
  `.ts`, conservando sus exports. Contexto/hook del tema en `themeState.ts`;
  ThemeContext.tsx conserva el componente proveedor. Se actualiza su consumidor
  y se conserva el export del hook en el índice del tema.
- Datos de demostración de mapas tipados como MapItem[]. Se completa únicamente
  la muestra local con `presentacion: 0`, sin relación seleccionada, que no se usa
  en sus tarjetas. No se deduce un ID real ni se cambian respuestas del backend.
  El primer build detectó el campo obligatorio ausente y los campos adicionales
  del fixture; se conservaron estos últimos mediante inferencia estructural.

## Bundle: medición antes y después

Builds con manifiesto, misma configuración y dependencias. Referencia anterior a
los cambios de rendimiento, con la corrección de lint ya aplicada. Se recorren
dependencias estáticas del manifiesto y se suman bytes y gzip por archivo; para
cada vista se excluyen los recursos del arranque. No son tiempos de descarga ni
bytes transferidos por un servidor configurado con compresión.

| JavaScript | Antes, bytes / gzip | Después, bytes / gzip |
| --- | --- | --- |
| Arranque | 697.899 / 221.448 | 698.013 / 221.490 |
| Adicional de gráficos | 976.485 / 284.103 | 597.025 / 175.156 |
| Adicional de mapas | 831.897 / 245.301 | 447.780 / 134.399 |

Los formularios de análisis importaban controles desde el índice común, que
también exporta EntityList. Sustituir esos dos imports por los archivos de los
controles separa DataGrid del grafo estático de mapas/gráficos. No se añaden
chunks manuales, dependencias ni otra frontera asíncrona en la UI.

GraphLayout pasa de un chunk compartido de 655.967 a 271.845 bytes; DataGrid queda
en otro compartido de 379.936 bytes. El mayor chunk final queda por debajo de
500 kB: el build final ya no emite ese aviso. El CSS inicial sigue en 40 bytes /
gzip 48. Las librerías pesadas y el CSS Leaflet permanecen fuera del arranque.

[audit-bundle.mjs](../scripts/audit-bundle.mjs) incorpora una comprobación de que
DataGrid no está entre las dependencias estáticas de las dos vistas y muestra sus
bytes adicionales. Si cambia el agrupamiento/nombre de la entrada `map` o los
marcadores de librerías, el script exige revisar su detección.

## Perfil de React y remontajes

Chrome DevTools MCP y las herramientas React se comprobaron operativos en Vite
4177, vista de usuarios con diez filas y auth/HTTP simulados mediante un adapter
Axios instalado solo en la página. Se perfilaron tres cambios de tema antes y
después, misma vista y navegador, sin limitación artificial de CPU/red.

DrawerHeader se creaba con styled dentro de GrapLayout en cada render. Se movió
su definición al nivel de módulo. Se contaron **3 reemplazos de su nodo DOM antes
y 0 después**. Los tres commits de tema se conservan; cambiar el tema sigue
requiriendo actualizar MUI y DataGrid. No se aplica memoización generalizada.

Duración de render de los commits en desarrollo: antes 145,5 / 121,8 / 107,7 ms;
después 173,1 / 134,5 / 109,5 ms. La muestra no demuestra una reducción de tiempo:
se acredita la eliminación del remontaje, sin atribuirle una mejora de velocidad.
Los perfiles se consultaron en memoria; no se entrega un archivo de traza. No se
miden aquí LCP/INP/CLS de producción ni rendimiento de backend o datos reales.

## Verificación final

- Suite completa final: **208 aprobadas**, sin fallos, omitidas o canceladas.
- Lint final con máximo cero advertencias: correcto. Build final: correcto.
  `tsconfig.app.tsbuildinfo` restaurado a sus bytes iniciales tras cada build.
- Auditoría del bundle final: correcta, incluidos los dos nuevos límites de ruta.
- Playwright, HTTP/auth simulados: auth-service, **dos grupos**, login y registro
  con fallo/reintento y conservación; confiscation-save, **siete grupos**, carga,
  edición/alta principal y tres hijos, archivos y errores; cero mensajes inesperados.
- Producción en preview 4178: lazy-routes, **seis grupos**; login, carga diferida,
  usuarios, análisis, atrás y CSS/mapa de formulario. Cero excepciones o mensajes
  inesperados. Se excluyen los avisos Canvas conocidos en auth-service.
- [analysis-bundle.js](../tests/browser/analysis-bundle.js), **cuatro grupos**:
  entrada directa a gráficos/mapas sin descargar scripts con DataGrid y dos
  cambios de tema por vista conservando cabecera y formulario. Cero excepciones
  o mensajes inesperados. Aserciones sobre los cuerpos de scripts de producción,
  además del manifiesto; rutas y listeners retirados en finally.
- `git diff --check`: correcto. Sin cambios de dependencias, contratos HTTP o
  configuración del bundler/lint. No hay rediseño visual que requiera capturas.

El servidor previo de 4175 conservó referencias de módulos a los índices `.tsx`
renombrados; se usó un servidor nuevo 4177 y se solicitó el reinicio automático
de Vite actualizando solo la fecha de modificación de su configuración. No se
contaron los intentos con imports obsoletos como recorridos aprobados.
Comprobada después la carga de login en el servidor original 4175, con refresh
simulado como 401 y sin excepciones. Servidores temporales 4177/4178 detenidos y
páginas de medición cerradas o devueltas a blanco al terminar.

Logs locales: `%TEMP%/graphdata-postplan-tests-final.txt`,
`graphdata-postplan-lint-final.txt`, `graphdata-postplan-build-final.txt`,
`graphdata-postplan-bundle-before.json`, `graphdata-postplan-bundle-final.json`
y `graphdata-postplan-manifest-before.json`. Los scripts anteriores se ejecutaron
con copias locales en `.playwright-mcp/` que solo ajustan los puertos.

Skills React/composición del proyecto aplicadas al tipado de formularios y
propietarios existentes; reglas relevantes de imports directos y componentes
estáticos para rendimiento. Context7 consultado: RHF 7.55.0 no tiene versión
exacta disponible, contrastado con `dist/types/form.d.ts` instalado; React 19.3.1
figura en el catálogo, y se usa la documentación pública general para identidad
de componentes y significado de las duraciones. Referencias oficiales:
[RHF TypeScript](https://react-hook-form.com/ts),
[identidad de componentes](https://react.dev/learn/preserving-and-resetting-state)
y [Profiler](https://react.dev/reference/react/Profiler).

Pendiente: validar sesión/cookies, permisos efectivos, relaciones y persistencia
contra backend real. Medir con datos, dispositivos y cargas representativos si se
buscan más optimizaciones; no hay una regresión de tiempo demostrada que justifique
otra intervención en este trabajo.
