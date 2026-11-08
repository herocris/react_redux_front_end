# Progreso de la refactorización

## Estado al 8 de noviembre de 2026

Se consolidaron los cambios anteriores en 12 commits locales y se prepararon
las instrucciones para continuar en conversaciones independientes.
**La migración a TanStack Query todavía no ha comenzado.** No se instalaron
dependencias ni se crearon services nuevos en esta preparación.

Leer [AGENTS.md](../AGENTS.md) y [el plan con sus prompts](refactor-plan.md)
antes de ejecutar un paso. Siguiente paso: **1, consolidar/confirmar la referencia**.
Reutilizar las comprobaciones siguientes si siguen correspondiendo al código.

## Decisiones acordadas

- TanStack Query para datos remotos; Redux Toolkit se conserva para sesión y
  filtros aplicados compartidos entre mapas y gráficos.
- Services por dominio como acceso común para consultas/mutaciones y thunks
  restantes. Axios compartido mantiene URL, cookies e interceptor.
- React Hook Form para edición; estado local para diálogos y controles de vista.
- Migración por módulo, sin copiar resultados a Redux ni añadir thunks entre
  consultas y services. Conservar compatibilidad hasta migrar consumidores.
- El usuario desea un uso significativo de Redux en el proyecto; su eliminación
  completa no forma parte del objetivo.
- Playwright MCP selectivo para controlar consumo de tokens. Sin instalación
  obligatoria de Playwright Test, Vitest u otra herramienta adicional.
- No añadir formularios por pasos, lotes ni exportaciones en esta migración.

## Commits de consolidación anteriores al plan

Base previa: `f89dc60`, estabilización/cancelación de listados.

| Commit | Alcance |
| --- | --- |
| `71c25d1` | Plantilla de entorno con prefijo /api. |
| `b18ab3c` | Salida breve de Playwright, guía de uso y artefactos locales ignorados. |
| `8a5ed40` | Geocodificación inversa separada y cancelable, pruebas e informe. |
| `e7ee7e3` | Rutas protegidas diferidas e imports directos de reducers. |
| `59af2ed` | CRUD de presentaciones tipado, errores/reintentos y pruebas. |
| `260085f` | CRUD de armas tipado, errores/reintentos y pruebas. |
| `179db25` | CRUD de municiones tipado, errores/reintentos y pruebas. |
| `fcd69c3` | CRUD de drogas tipado, errores/reintentos y pruebas. |
| `3258f98` | CRUD de roles, relaciones, errores/reintentos y pruebas. |
| `16ba1f3` | CRUD de permisos, errores/reintentos y pruebas. |
| `1f68200` | CRUD de usuarios, relaciones, errores/reintentos y pruebas. |
| `abd2d36` | Auditoría tipada, errores, reintentos y pruebas. |

Se conservaron los cambios anteriores. Solo se eliminó un espacio final en el
formulario de presentaciones al preparar su commit. Capturas y logs permanecen
localmente en `.playwright-mcp/`, ahora ignorado; no se borraron ni versionaron.

## Referencia automatizada de esta preparación

Los comandos se ejecutaron sobre el código consolidado; los cambios posteriores
de esta preparación son documentos y limpieza de espacios sin cambio funcional.

| Comprobación | Resultado |
| --- | --- |
| `npm.cmd test` | 109 pruebas, 109 aprobadas, 0 fallos, 0 omitidas/canceladas. |
| `npm.cmd run lint -- --format json --output-file ...` | Falla: 91 errores y 26 advertencias de deuda previa; coincide con el último informe de actividad. |
| `npm.cmd run build` | Correcto; persiste aviso de chunks mayores de 500 kB. |
| `git diff --cached --check` | Correcto en cada commit de consolidación. |

Logs locales de esta ejecución (temporales, no versionados):
- `%TEMP%/graphdata-checkpoint-tests.txt`
- `%TEMP%/graphdata-checkpoint-lint.json`
- `%TEMP%/graphdata-checkpoint-build.txt`

Se restauró el contenido previo de `tsconfig.app.tsbuildinfo` después del build
para evitar incluir un artefacto incidental. No se modificó configuración de
TypeScript ni se corrigió deuda funcional fuera del alcance.

No se repitieron recorridos de navegador en esta preparación: no hubo cambios
de comportamiento. Existen scripts en `tests/browser/` e informes anteriores
con HTTP/autenticación simulados. No se comprobó disponibilidad de MCP en esta
ejecución ni se hicieron perfiles React, pruebas con backend real o mediciones
de ahorro de tokens. Los informes históricos no acreditan disponibilidad actual.

## Estado de los pasos

| Paso | Estado | Nota |
| --- | --- | --- |
| 1. Consolidar referencia | Pendiente | Baseline preliminar y commits disponibles; reconciliar contratos y vigencia al comenzar. |
| 2. Guardado de formularios | Pendiente | Revisar cierre anticipado y desmontaje durante envío. |
| 3. Archivos | Pendiente | Condiciones actuales no aplican correctamente el límite de tamaño. |
| 4. Convenciones | Pendiente | Guía y plan iniciales preparados; consolidar sin repetir lo vigente. |
| 5. Autenticación | Pendiente | Thunks/slice actuales; falta authService y mejora de tipos. |
| 6. TanStack Query | Pendiente | No instalado ni configurado. |
| 7. Service de permisos | Pendiente | HTTP todavía dentro de thunks. |
| 8. EntityList | Pendiente | Sigue usando callback de carga y contratos compartidos amplios. |
| 9. Piloto de permisos | Pendiente | CRUD y opciones aún usan Redux manual. |
| 10. Componentes comunes | Pendiente | Hay alertas/confirmaciones repetidas y campos con tipos amplios. |
| 11. Catálogos y actividad | Pendiente | Refactors previos conservados; migración de datos no iniciada. |
| 12. Confiscaciones | Pendiente | Mantener geocodificación y completar flujos, tipos y datos. |
| 13. Filtros Redux | Pendiente | Aún no hay slice de filtros aplicados compartidos. |
| 14. Mapas y gráficos | Pendiente | Mantienen flujos actuales y datos remotos en slices. |
| 15. Limpieza/rendimiento | Pendiente | No retirar todavía infraestructura con consumidores. |
| 16. Integración | Pendiente | Ejecutar al completar los pasos anteriores. |

## Contratos y pendientes que deben contrastarse

- Endpoints y credenciales actuales; los CRUD de permisos/roles/usuarios usan
  JSON y los catálogos con imágenes mantienen multipart y sus métodos actuales.
- `identificador` recibido se adapta a `id` en varios listados; los esquemas
  también conservan `identificador`. No eliminar ni reinterpretar campos por
  deducción. Mantener nombres públicos `rol` y `resouce`.
- Relaciones de roles/usuarios admiten identificadores y objetos heredados.
  `z.custom<T>()` sin predicado no valida esos elementos; revisar contra evidencia
  del contrato antes de endurecer o normalizar sus formatos.
- El interceptor conserva rechazos y puede entregar el cuerpo HTTP. Evitar
  asumir AxiosError/status disponibles en todos los casos.
- Conservar cancelación/protección de respuestas obsoletas. Sus pruebas actuales
  se centran en una petición vigente por listado/store; verificar la política
  deseada al introducir caché por argumentos.
- Las escrituras de permisos modifican filas locales sin reconstruir totales y
  paginación. El piloto debe resolver coherencia de lista, opciones y páginas.
- `resouce` mantiene cargas/errores anteriores y copias separadas de catálogos.
  Verificar si los endpoints usados en selectores devuelven todas las opciones.
- Los formularios de subdecomisos llaman al guardado y cierran sin esperarlo;
  `EditView` condiciona el montaje del formulario a loading compartido con guardado.
  Hallazgos de lectura: reproducir de forma acotada al ejecutar el paso 2.
- `file.size !== 0 || file.size <= 5000000` no impone un máximo efectivo.
  Corregir límites conservando imágenes existentes en el paso 3.
- La carga diferida ya está implementada; el coste de código compartido y los
  renders requieren medición. No repetir la separación de rutas por rutina.

## Evidencia anterior

- [Autenticación y listados](verification-auth-lists-2026-11-07.md).
- [Geocodificación](verification-geocoding-2026-11-07.md).
- [Carga diferida](verification-lazy-routes-2026-11-07.md).
- [Presentaciones](verification-drug-presentation-2026-11-07.md),
  [armas](verification-weapon-2026-11-07.md),
  [municiones](verification-ammunition-2026-11-07.md),
  [drogas](verification-drug-2026-11-07.md).
- [Roles](verification-rol-2026-11-08.md),
  [permisos](verification-permission-2026-11-08.md),
  [usuarios](verification-user-2026-11-08.md),
  [actividad](verification-activity-2026-11-08.md).

## Registro de próximos pasos

Al terminar cada paso, actualizar su fila y añadir una entrada con:
fecha, alcance, archivos/commits si existen, contratos conservados, decisiones,
pruebas y resultados reales, navegador utilizado y motivo (o por qué no fue
necesario), límites, pendientes y siguiente paso. No copiar logs completos ni
considerar una verificación histórica equivalente a una ejecución nueva.
