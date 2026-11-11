# P02 — Contratos de identificadores (11 de noviembre de 2026)

## Evidencia y alcance

Solo P02. Se conservan los cambios previos del workspace y la migración cerrada.
Backend real `http://localhost/api`, frontend Vite iniciado en 5174; 5173 intacto.
Playwright MCP operativo. Login con el acceso precargado existente y refresh 200;
no se registran credenciales ni cuerpos con datos personales. Lecturas reales sin
interceptaciones, escrituras de entidades ni cambios de asignaciones. No se
crearon fixtures que requieran limpieza.

Swagger UI `/api/documentation` referencia `/api/docs?api-docs.json`:
OpenAPI 3.0.0, respuesta 200. `/api/openapi.json` dio 404; no era la URL del
documento. Se contrastaron schemas de respuestas, relaciones, escrituras y
parámetros de ruta. No se copia la especificación completa al repositorio.

| Frontera | Respuesta real / OpenAPI | Contrato del frontend |
| --- | --- | --- |
| Drogas, armas, municiones, presentaciones, permisos, roles, usuarios, actividad y decomisos | `identificador` integer; las nueve primeras filas observadas contienen números | DTO numérico, entidad `id: number`; sin conversión del número recibido |
| Roles administrativos | `permisos: integer[]`; rol 1 con 73 permisos | Alias público `RolePermission = number`; opciones y RHF numéricos |
| Usuarios administrativos | `roles: integer[]`, `permisos: integer[]`; usuario 1 con rol `[1]` | Alias públicos numéricos; no confundir con sesión |
| Sesión login/refresh | `roles: string[]`, `permissions: string[]`, nombres | Redux conserva nombres; se retiran objetos/IDs especulativos de estos tipos |
| Subdecomisos | ID propio integer; relaciones anidadas con `identificador` integer | DTO con ID obligatorio; service aplana IDs numéricos, conserva nombres |
| Actividad | `id_usuario` integer nullable; primera fila observada null | `number \| null`, sin convertir null en cero |
| Mapa/análisis | OpenAPI mantiene IDs integer, arrays de filtros con IDs de catálogos | `MapItem.id` ya era numérico; filtros aplicados `number[]`, esquemas y claves comprueban IDs |
| Ruta de detalle/edición | OpenAPI define parámetros integer; Router entrega texto | Conversión explícita antes de consultas/services |

Relaciones reales representativas: hijo de droga 1 → decomiso 2252, droga 5,
presentación 1; hijo de arma 1 → decomiso 611, arma 2; hijo de munición 1 →
decomiso 514, munición 4. Los tres coinciden con los objetos de OpenAPI. Se
reutilizan registros existentes únicamente para lectura y selección.

## Implementación y fronteras

- `api/identifiers.ts`: `readId(unknown)` valida número entero positivo seguro,
  sin coerción. Los mapeadores de services validan IDs propios y relaciones;
  el genérico de Axios deja de ser la única garantía para esos campos. Se
  rechazan textos, fracciones, cero, negativos, null e IDs inseguros.
- **La conversión URL → ID ocurre en los consumidores de `useParams`**:
  `EditView` y los tres hooks de subdecomisos llaman a `parseRouteId`. Solo se
  admiten dígitos y un entero positivo seguro. `/007` produce 7; texto vacío,
  `7abc`, notación exponencial y números inseguros se rechazan. La vista separa
  validación y componente con Query: una ruta inválida muestra alerta y regreso,
  sin montar formulario/hijos ni iniciar su HTTP. No se implementa P09.
- Services, mutaciones y claves de detalle/padre reciben números. Las claves
  validan en ejecución y rechazan strings: no guardan paralelamente `7` y
  `"7"`. Las claves de análisis comprueban arrays de IDs antes de publicarlos.
  La invalidación de padres/hijos usa el mismo tipo numérico.
- `types.ts` conserva nombres/exportaciones, campos opcionales de borradores y
  aliases públicos; corrige los tipos falsos, sin ampliar uniones. Se retiran
  `z.custom` y uniones especulativas de relaciones administrativas. Opciones
  compartidas, catálogos, comparaciones y selección del hijo usan números.
- Se elimina `identificador?.toString()` de los formularios de hijos. RHF
  mantiene el ID cargado; sus relaciones y filtros se validan. La coerción
  existente de entradas numéricas de formulario se conserva en su esquema.
- **HTTP conservado**: endpoints, nombres, JSON numérico de relaciones,
  multipart y `_method=PUT`. `FormData` sigue serializando números como texto
  en el transporte; eso no cambia la representación interna ni el JSON.
  Los nombres de permisos de sesión no se convierten a IDs administrativos.

## Verificaciones

- Suite Node/Vite SSR: **213/213**, sin fallos/canceladas/omitidas. Se adaptan
  fixtures de contratos, formularios, consultas, concurrencia e invalidación;
  no se eliminan sus garantías. `identifiers.test.mjs` añade rechazos, relaciones,
  actividad nullable, nombres de sesión, caché compartida lista/URL y separación
  por padre. El transporte de estas pruebas es simulado.
- `npm.cmd run lint -- --max-warnings 0` y `npm.cmd run build`: correctos.
  Sin dependencias nuevas. Artefacto TypeScript generado restaurado.
- Recorrido **real** [identifiers.js](../tests/browser/identifiers.js): seis
  grupos aprobados, cero excepciones de página. Rol del usuario seleccionado,
  permisos de rol seleccionados (73 en la observación), navegación desde fila
  a detalle/edición, droga y presentación existentes seleccionadas, alias de URL
  compartiendo una única clave numérica y URL inválida rechazada sin HTTP con
  recuperación al listado. Peticiones de detalle observadas: `/confiscation/1`
  y `/confiscation/2252`; `/02252` no genera otro detalle mientras está vigente.
  Consola filtrada final: cero errores y advertencias.
- Se actualizan fixtures numéricos, comparaciones y claves de recorridos de
  navegador anteriores. No se declara repetida su batería completa: el recorrido
  nuevo cubre la integración afectada. Su referencia de padre/etiquetas proviene
  de esta auditoría y requiere datos equivalentes si se cambia el dataset.
- Intentos iniciales del recorrido encontraron sincronización del listado y
  selectores de prueba incorrectos; se corrigieron. La prueba de ruta inválida
  detectó además un acento corrompido en el texto recién introducido, corregido
  antes del recorrido final. Esos intentos no se cuentan como aprobados.

## Documentación de librerías y límites

Versiones resueltas: React Router 7.18.5, TanStack Query 5.107.1, Zod 4.6.7,
MUI 6.4.7. Context7 consultado para claves, parámetros y validación; cubre Zod
4.6.7, pero no enumera las versiones instaladas de Router/Query. Se contrastó
Router con [su documentación oficial 7.18.5](https://reactrouter.com/7.18.5/api/hooks/useParams)
y Query con [su guía oficial v5 de claves](https://tanstack.com/query/v5/docs/framework/react/guides/query-keys),
esta última sin fijación al parche instalado. Sin cambios de API de MUI.

Esta validación se centra en identificadores, no en validar todos los campos de
cada respuesta. Se conserva la respuesta alternativa histórica de registro;
no se prueba registro real ni se afirma que OpenAPI la documente. La autorización
de escrituras reales sigue acreditada por P01; aquí se prueban contratos de
escritura con transporte simulado. No se modifican backend, imágenes, metadatos
de paginación ni controles visuales de permisos. P06/P07 y la política del
operador siguen pendientes. P03 es la siguiente tarea disponible.
