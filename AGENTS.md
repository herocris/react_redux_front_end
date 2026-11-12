# Guía para agentes

## Objetivo

Refactorizar y mejorar la app progresivamente, preservando flujos y contratos con
el backend. Mantener los cambios dentro de la tarea solicitada.

## Continuidad entre conversaciones

- Leer [el plan](docs/refactor-plan.md) y [el progreso](docs/refactor-progress.md)
  antes de ejecutar un paso. Este archivo contiene las instrucciones comunes;
  el usuario no necesita volver a pegarlas en cada conversación.
- Implementar únicamente el paso solicitado. Contrastar los documentos con el
  código y `git status`; conservar cambios anteriores del workspace. No avanzar
  a otro paso ni rehacer trabajo completado sin una necesidad concreta.
- Actualizar el progreso al terminar: cambios, comprobaciones, decisiones y
  pendientes. Mantener el plan si cambia el alcance acordado. No marcar como
  completada una verificación no realizada ni confundir preparación con migración.
- Los resultados previos pueden reutilizarse si corresponden al mismo código y
  escenario; repetirlos cuando haya cambios relevantes, fallos o incertidumbres.
- Entregar un resumen breve de cambios, verificación y pendientes, con enlaces a
  los documentos. Guardar diagnósticos extensos fuera de la respuesta.

## Arquitectura objetivo y transición

- La migración acordada usa TanStack Query para datos remotos y conserva Redux
  Toolkit para sesión y filtros aplicados compartidos entre mapas y gráficos.
  Su incorporación se realiza por pasos; no instalar ni migrar todo por leer
  esta guía. Consultar el progreso para conocer el estado real.
- Services por dominio: acceso HTTP, parámetros, payloads JSON/multipart y
  adaptación de respuestas. Independientes de React, Redux y TanStack Query;
  devuelven datos tipados, propagan rechazos y aceptan AbortSignal cuando proceda.
  No administran caché, navegación, diálogos ni mensajes visuales. El servicio
  externo de geocodificación conserva su separación de credenciales del backend.
- TanStack Query consume directamente los services. Sus consultas/mutaciones
  administran resultados, carga, errores, vigencia e invalidación. Las claves
  incluyen los argumentos que cambian la respuesta y el padre en listas anidadas.
- Los thunks que permanecen consumen services y coordinan procesos globales,
  especialmente autenticación. Los slices administran sus transiciones. Los
  módulos antiguos conservan temporalmente su implementación hasta migrarse.
- Un propietario por estado: evitar duplicar resultados de consultas en Redux
  y mantener la sesión en Redux sin otra copia independiente en la caché.
  React Hook Form administra edición/validación; los hooks de pantalla coordinan
  acciones y navegación; diálogos y controles exclusivos de una vista son locales.
- Redux recibe filtros compartidos al pulsar Aplicar; la edición pendiente del
  formulario permanece separada. Sus valores son serializables. Los resultados
  remotos y archivos no pertenecen a ese slice.
- Coordinar cancelación y limpieza de datos de sesión al salir/cambiar de usuario,
  evitando respuestas tardías de una sesión anterior. No asumir que introducir
  una librería reproduce automáticamente la política de cancelación existente.
- Extraer services al trabajar cada módulo, sin interponer thunks entre TanStack
  Query y los services ni construir una capa manual destinada a desaparecer.
  Retirar implementaciones anteriores solo cuando no tengan consumidores.
- Preservar tipos y contratos públicos durante la transición; introducir DTO,
  entidad, formulario y mapeadores cuando clarifiquen fronteras. No cambiar
  identificadores o relaciones por deducción ni usar un genérico como validación.
- Al extraer un dominio, ubicar su acceso HTTP en `services/` y las futuras
  consultas/mutaciones en `queries/` dentro del módulo; conservar `types.ts`
  como contrato público compatible. Los mapeadores pertenecen a la frontera
  de datos, no a componentes ni reducers. No crear carpetas o capas vacías.
- Centralizar las claves de consultas por dominio y distinguir listas, detalles
  y opciones. Incluir página, tamaño, orden, filtros y padre cuando afecten la
  respuesta; derivar opciones de datos consultados sin otra copia en Redux.
  Verificar que su fuente entregue el catálogo completo. Definir vigencia,
  reintentos y recargas en el paso 6; no asumir defaults como política acordada.
- Tras una escritura exitosa, las mutaciones invalidan listas, detalles y
  opciones afectados según el contrato. Resolver totales y página vacía tras
  borrar conservando orden/filtros; no dar por coherente una lista paginada
  solo por insertar o quitar una fila local. No invalidar como si hubiera éxito
  cuando falla la escritura ni cerrar el formulario antes de su resultado.
- En módulos migrados, consulta y mutación poseen sus estados remotos; los hooks
  de pantalla coordinan selección local, diálogos, mensajes y navegación. La
  tabla recibe datos y callbacks explícitos, con un único propietario de página,
  orden y filtros de lista en el consumidor. Mantener la edición en RHF y separar
  carga inicial, recarga y envío para conservar campos/archivos ante fallos y
  evitar que una recarga sobrescriba cambios. Los slices restantes mantienen
  transiciones puras de sesión/filtros, sin HTTP ni efectos visuales.
- Conservar las correcciones de errores, formularios, accesibilidad, geocodificación
  y carga diferida. Borradores por pasos, lotes y exportaciones son ampliaciones
  posteriores; no forman parte de esta migración.

### Convivencia y retirada

- Desde el paso 15, Redux contiene únicamente `auth` y `analysisFilters`.
  Los dominios remotos usan Query; se retiraron los slices/thunks sustituidos,
  `LegacyEntityList`, `useEntityList` y `createLatestListRequest` sin consumidores.
  Las reglas de convivencia siguientes explican la transición histórica; no
  reintroducir esas piezas. Se conserva el dispatch ligado a sesión para auth.
- La arquitectura anterior describe el destino; el estado implementado está en
  [el progreso](docs/refactor-progress.md). Los módulos aún no migrados conservan
  HTTP en thunks y datos en slices. El paso 7 permite que los thunks de permisos
  consuman su service antes de migrar la pantalla en el paso 9; no extender esa
  adaptación temporal a módulos fuera del paso solicitado.
- Migrar coordinadamente pantallas y consumidores de opciones, incluidos los
  de `resouce`. Mantener los demás dominios antiguos funcionando. Adaptar
  `EntityList` mediante una compatibilidad pequeña en el paso 8; no añadir
  variantes por banderas ni duplicar propietarios para soportar ambos modelos.
- Retirar un thunk, slice remoto, export o adaptador solo tras buscar todos sus
  consumidores en aplicación, store y pruebas, migrarlos y verificar las mismas
  garantías con el nuevo propietario. Trasladar cobertura de contratos a services
  y de concurrencia/invalidación a consultas; conservar pruebas de transiciones
  Redux que sigan vigentes. No retirar `createLatestListRequest` mientras exista
  algún listado antiguo que lo use ni eliminar Redux de sesión/filtros.
- La cancelación actual de `src/api/latestListRequest.ts` mantiene una petición
  vigente por dominio/store, aborta la anterior y enlaza la señal del efecto de
  lista; sus consumidores protegen publicación de datos y fin de carga. Esto no
  prueba caché por argumentos ni aislamiento de sesión. Al migrar, pasar la señal
  de consulta al service y comprobar cambios rápidos de argumentos, desmontaje
  y respuestas tardías. Distintas claves pueden coexistir en caché: no trasladar
  sin revisión la exclusividad global del listado antiguo.
- En el paso 6, verificar cancelación y limpieza de datos al salir/cambiar de
  usuario, incluidas respuestas tardías de lecturas y escrituras. Revisar también
  los módulos antiguos que convivan: el logout actual solo reinicia auth y no
  acredita limpieza global. Cancelar una petición no demuestra que el servidor
  haya deshecho una escritura. Esta política debe probarse antes de considerarla
  implementada; no introducir una segunda copia de sesión para resolverla.
- Infraestructura del paso 6: `queries/queryClient.ts` crea el cliente único;
  `sessionMiddleware` cancela/limpia Query y retira la señal de transporte al
  recibir `onLogin`, `onLogout` u `onChecking`. El reducer raíz reinicia los
  dominios antiguos y el dispatch de sus thunks queda ligado a esa sesión.
  No guardar identidad ni credenciales en `sessionScope`. Las consultas futuras
  pasan su `signal` al service; las mutaciones usan `sessionMutationOptions`
  creado en el consumidor autenticado, con invalidación y efectos en sus
  callbacks protegidos, no en callbacks por llamada a `mutate`. Si un callback
  espera trabajo adicional, comprobar de nuevo la señal de sesión tras el await
  antes de publicar efectos. Limpiar la caché no cancela una escritura del servidor.

## Stack y estructura

- SPA con React 19, TypeScript estricto y Vite; no es Next.js.
- Redux Toolkit y React Redux; React Router; MUI y Emotion; React Hook Form,
  Zod y resolvers; Axios; Day.js; Recharts; React Leaflet, Leaflet y leaflet.heat.
- Verificar versiones resueltas en `package-lock.json`, no solo los rangos de
  `package.json`.
- `src/modules/<dominio>/`: componentes, hooks, slices, thunks, rutas, vistas,
  validadores y `types.ts` según las necesidades del módulo.
- `src/store/store.ts`: reducers, `RootState` y `AppDispatch`.
- `src/hooks/hooks.ts`: `useAppDispatch` y `useAppSelector` tipados.
- `src/api/graphdataApi.ts`: cliente Axios compartido, `VITE_API_URL` y cookies.
- `src/router`, `src/shared`, `src/theme`, `src/helpers`: navegación, elementos
  compartidos, tema y utilidades.
- Conservar nombres actuales como `resouce` y `rol` salvo migración explícita.

## Skills y documentación

- Leer `.agents/skills/vercel-react-best-practices/SKILL.md` para cambios React,
  rendimiento y carga de datos; consultar solo las reglas relevantes.
- Leer `.agents/skills/vercel-composition-patterns/SKILL.md` para rediseñar APIs
  de componentes, composición y responsabilidades del estado.
- Aplicar criterios compatibles con esta SPA. No introducir APIs Next.js, RSC,
  Server Actions, SWR u otras dependencias solo porque aparezcan en las skills.
- Consultar Context7 para verificar APIs y configuración de las librerías
  afectadas, indicando su versión instalada. Si no está disponible o no cubre esa
  versión, consultar documentación oficial y comunicar la limitación.
- Contrastar recomendaciones con el código y los requisitos. No copiar las guías
  completas de las skills a este archivo.

## Convenciones de refactorización

- Autorización visual: `auth/access.ts` define permisos y dependencias; `useAccess`
  los consulta desde la sesión Redux. Los guards se sitúan antes de montar vistas
  con consultas. No inferir acceso por roles ni duplicar permisos en Query/contextos.
  El backend conserva la decisión efectiva; los rechazos no se tratan como éxito.
- P10: el panel de inicio es navegación sin consultas ni métricas. Requiere
  `dashboard.view`; cada acceso visible comprueba sus propios permisos y
  dependencias. No reintroducir las dependencias globales del antiguo demo.
- Revalidación en vivo (P05): usar `refreshAuthorization` y el `/refresh` existente,
  sin otra sesión en Query. `onSessionRefreshed` conserva filtros para la misma
  cuenta; cambios de roles/permisos o fallos de comprobación retiran transporte,
  cachés y consumidores mediante `authorizationRevision`. Un refresh idéntico
  conserva formularios. `onLogin` sigue siendo una frontera completa de sesión.
  El 403 agrupa una comprobación limitada, sin repetir la operación; excluir
  endpoints auth y respuestas retiradas. Política, tiempos y límites en el
  [informe de autorización](docs/verification-access-control-2026-11-10.md).
- PascalCase para componentes y tipos, `useX` para hooks y camelCase para
  funciones y variables. Respetar el formato local, sin reformateos masivos.
- Componentes para presentación/formularios y hooks para coordinación. Aplicar
  la arquitectura objetivo por pasos; conservar thunks y slices antiguos hasta
  migrar sus consumidores, sin extender el patrón antiguo innecesariamente.
- Usar hooks Redux tipados y el cliente HTTP compartido. Preservar campos,
  endpoints y tratamiento de credenciales del backend.
- El interceptor conserva los rechazos y entrega el cuerpo del error HTTP cuando
  existe. Usar `src/api/apiErrors.ts` para mensajes de UI; los thunks que rechazan
  conservan la causa y sus consumidores manejan el rechazo sin cerrar por éxito.
- Tipar props, formularios y respuestas; preferir `unknown` y narrowing a `any`.
- IDs del backend y relaciones administrativas: números enteros positivos
  seguros, validados en services; opciones y claves Query usan números. Convertir
  parámetros de `useParams` con `parseRouteId` antes de consultar. Los roles y
  permisos de sesión son nombres string, separados de los IDs administrativos.
- Si un esquema transforma valores, distinguir `z.input` de `z.output` en los
  genéricos de `useForm`; el submit recibe los valores ya validados y convertidos.
- Mantener carga, éxito, error y vacío coherentes, también ante fallos. Evitar
  peticiones duplicadas y actualizaciones obsoletas.
- En el modelo antiguo, los callbacks de carga de `EntityList` son estables y
  aceptan un `AbortSignal` opcional. Sus thunks usan `createLatestListRequest`
  para publicar datos y fin de carga solo para la petición vigente. Al migrar,
  conservar estas garantías y retirar el mecanismo solo sin consumidores.
- Efectos para sincronización externa, con dependencias correctas y limpieza.
  Derivar valores durante render y manejar acciones de usuario en sus eventos.
- Componer cuando simplifique el uso. No añadir contextos, abstracciones o
  memoización sin necesidad concreta. Medir antes de optimizar.
- Priorizar peticiones independientes concurrentes, suscripciones precisas y
  carga bajo demanda de vistas pesadas cuando proceda.
- Reutilizar MUI y el tema. Preservar accesibilidad y validación. Limpiar capas y
  listeners Leaflet al desmontar o actualizar mapas.
- No hacer migraciones generales ni actualizar dependencias ajenas a la tarea.
  Actualizar esta guía cuando se establezca una convención para el proyecto.

## Validación

- `npm ci`: instalación; `npm run dev`: desarrollo; `npm run lint`: ESLint;
  `npm run build`: TypeScript y build; `npm run preview`: revisar producción.
  En PowerShell usar `npm.cmd` si se bloquea el archivo `.ps1`.
- `npm test`: pruebas de comportamiento con Node y el cargador SSR de Vite, sin
  backend real. Añadir cobertura cuando la complejidad del cambio lo justifique.
- Para cambios de código ejecutar lint y build. Distinguir fallos previos de los
  introducidos y describir las comprobaciones pendientes.
- Verificar con Playwright MCP los cambios visuales y flujos que necesiten
  navegador, usando recorridos breves en los hitos del plan. No repetir una
  batería completa por cada extracción, tipo o módulo equivalente. Consultar
  consola/red relevantes. Usar Chrome DevTools y herramientas React disponibles
  cuando una investigación de componentes o rendimiento lo requiera.
- Mantener React DevTools solo en desarrollo y registrarlo antes de cargar React.
- No afirmar que un MCP funciona solo por figurar en la configuración. Si no está
  activo en la sesión, comunicar la limitación.
- No guardar secretos en Git ni enviar datos privados a documentación externa.
  Puesta en marcha del entorno: `docs/ai-tooling.md`.

## Uso eficiente del navegador

- Ejecutar primero las pruebas automatizadas aplicables. Usar Playwright MCP para
  explorar y verificar los flujos afectados, ampliando solo ante fallos o cambios
  relevantes. Pruebas de contrato en services, caché e invalidación en consultas y
  transiciones globales en Redux; no añadir pruebas que solo reflejen detalles
  de implementación. Preferir Playwright Test para una futura suite E2E repetible;
  no es requisito inicial ni se instala solo por esta recomendación. Actualmente
  solo está instalado el runner de Node.
- Reutilizar la sesión y la página cuando no haga falta aislar el escenario;
  evitar navegaciones, snapshots y consultas de consola/red repetidos sin motivo.
- Buscar elementos con `browser_find` y `maxResults` antes de pedir el árbol
  completo. Si hace falta contexto, usar `browser_snapshot` con `target` y `depth`.
  Ampliar el snapshot solo si la vista parcial no permite continuar.
- Conservar scripts de recorridos repetidos y usar `filename` cuando la
  herramienta lo admita. Agrupar pasos conocidos en bloques breves con aserciones;
  devolver casos aprobados/fallidos, mensajes de error y rutas de artefactos.
- No devolver HTML, árboles, estados Redux, cuerpos HTTP ni código fuente completos
  si bastan conteos o campos concretos. Guardar diagnósticos extensos en archivos
  y leer solo la parte necesaria cuando falle una comprobación.
- Tomar capturas solo cuando se necesite verificar el aspecto visual. Preferir
  consola filtrada y peticiones relevantes para depurar; usar Chrome DevTools MCP
  para React y perfiles en vez de habilitar capacidades extra de Playwright.
- Liberar respuestas interceptadas en `finally` y retirar rutas simuladas al acabar.
  Si una prueba deja interceptaciones pendientes, cerrar ese contexto antes de
  repetir; no esperar indefinidamente con `unrouteAll({ behavior: 'wait' })`.
- El lanzador usa `--snapshot-mode none` y `--codegen none`: pedir explícitamente
  la información necesaria, sin suponer que la respuesta a cada acción trae DOM.
