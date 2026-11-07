# Guía para agentes

## Objetivo

Refactorizar y mejorar la app progresivamente, preservando flujos y contratos con
el backend. Mantener los cambios dentro de la tarea solicitada.

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

- PascalCase para componentes y tipos, `useX` para hooks y camelCase para
  funciones y variables. Respetar el formato local, sin reformateos masivos.
- Componentes para presentación; hooks para coordinar estado y acciones; thunks
  para operaciones asíncronas; slices para transiciones de estado.
- Usar hooks Redux tipados y el cliente HTTP compartido. Preservar campos,
  endpoints y tratamiento de credenciales del backend.
- El interceptor conserva los rechazos y entrega el cuerpo del error HTTP cuando
  existe. Usar `src/api/apiErrors.ts` para mensajes de UI; los thunks que rechazan
  conservan la causa y sus consumidores manejan el rechazo sin cerrar por éxito.
- Tipar props, formularios y respuestas; preferir `unknown` y narrowing a `any`.
- Si un esquema transforma valores, distinguir `z.input` de `z.output` en los
  genéricos de `useForm`; el submit recibe los valores ya validados y convertidos.
- Mantener carga, éxito, error y vacío coherentes, también ante fallos. Evitar
  peticiones duplicadas y actualizaciones obsoletas.
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
- Verificar cambios visuales y flujos con Playwright MCP, consola y red. Usar
  Chrome DevTools MCP y sus herramientas React para componentes y perfiles.
- Mantener React DevTools solo en desarrollo y registrarlo antes de cargar React.
- No afirmar que un MCP funciona solo por figurar en la configuración. Si no está
  activo en la sesión, comunicar la limitación.
- No guardar secretos en Git ni enviar datos privados a documentación externa.
  Puesta en marcha del entorno: `docs/ai-tooling.md`.
