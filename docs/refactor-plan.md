# Plan de refactorización

Los 16 pasos de este plan están cerrados según el progreso. Las tareas posteriores
de autorización, integración y presentación para reclutadores tienen prompts
independientes en [el plan de portafolio](portfolio-plan.md), con su
[progreso](portfolio-progress.md). No se reabren los pasos cerrados por leerlos.

## Cómo usar este documento

La decisión acordada es usar **TanStack Query** para los datos remotos,
**Redux Toolkit** para sesión y filtros aplicados compartidos, y **services**
por dominio como acceso al backend. Redux se conserva intencionadamente.
Esta documentación no instala dependencias ni implementa la migración.

Las instrucciones comunes están en [AGENTS.md](../AGENTS.md). El estado y las
verificaciones están en [refactor-progress.md](refactor-progress.md). Leer los
tres archivos al comenzar cada conversación y contrastarlos con el código.

Prompt breve para una conversación nueva (reemplazar N):

```text
Lee AGENTS.md, docs/refactor-plan.md y docs/refactor-progress.md.

Implementa únicamente el paso N de docs/refactor-plan.md usando su prompt.
Contrasta el progreso con el código actual y conserva los cambios existentes.
Aplica la verificación selectiva con Playwright MCP definida en AGENTS.md.

Al terminar actualiza docs/refactor-progress.md con cambios, decisiones,
comprobaciones y pendientes. No avances al siguiente paso.
```

## Arquitectura y alcance

| Capa | Responsabilidad |
| --- | --- |
| Axios compartido | URL base, cookies e interceptores existentes. |
| Services | Endpoints, parámetros, serialización y adaptación de respuestas; datos tipados o rechazos. |
| TanStack Query | Resultados remotos, caché, carga, errores, vigencia e invalidación. |
| Thunks Redux | Coordinación de sesión y otros procesos globales justificados; consumen services. |
| Slices y selectores Redux | Transiciones y lectura de sesión/filtros aplicados serializables. |
| React Hook Form | Valores en edición, validación y envío del formulario. |
| Hooks y componentes de pantalla | Diálogos, acciones, navegación y presentación. |

No hay una cadena consulta → thunk → service: consultas y thunks son
consumidores independientes de los services según la responsabilidad.
No es necesario que cada función del service tenga ambos consumidores.

La sesión tiene un único propietario en Redux. Los resultados remotos no se
copian a sus slices antiguos. Los filtros compartidos se aplican explícitamente;
su edición y las preferencias exclusivas de una vista permanecen separadas.
Se conservan endpoints, campos, identificadores, cookies, JSON, multipart,
`_method=PUT` y formatos de relaciones existentes.

Conservar las mejoras anteriores de formularios, accesibilidad, errores,
cancelación, geocodificación y carga diferida. Se sustituye progresivamente
su coordinación manual de datos, no sus garantías. Borradores por pasos,
operaciones por lotes y exportaciones quedan fuera del alcance inicial.

## Secuencia y prompts

Ejecutar en este orden. Cada paso termina actualizando el progreso. Si un
prerrequisito falta, documentarlo y completar solo lo necesario para el paso;
no hacer una migración general ni repetir trabajo ya vigente.

### 1. Consolidar el estado actual

Resultado: referencia verificable de código, contratos y deuda previa. La
preparación del 8 de noviembre ya aporta checks; validar su vigencia antes de
repetirlos.

```text
Ejecuta el paso 1: consolidar el punto de partida.

Revisa git status, AGENTS.md, los informes de docs/verification*, las pruebas
y los módulos afectados. Identifica refactors implementados y pendientes
reales; descarta referencias antiguas a problemas ya corregidos.

Contrasta la referencia de tests, lint y build de docs/refactor-progress.md
con el código actual. Reutiliza resultados vigentes y ejecuta lo que falte
o haya quedado invalidado por cambios. Registra conteos y límites reales.

Actualiza docs/refactor-progress.md. No refactorices código ni repitas
Playwright sin una necesidad concreta.
```

### 2. Corregir guardado y conservación de formularios

Resultado: fallos y reintentos conservan la edición; guardar no desmonta el
formulario ni lo cierra antes del resultado.

```text
Ejecuta el paso 2: corregir los flujos pendientes de guardado en
confiscaciones y subdecomisos.

Revisa los formularios de confiscaciones, drogas, armas y municiones
decomisadas. Espera las operaciones antes de cerrar. Conserva campos,
archivos y contexto ante fallos; muestra errores y permite reintentar.

Separa carga inicial y guardado para evitar desmontar formularios durante
el envío. Bloquea envíos duplicados y acciones incompatibles pendientes.
Conserva las causas de los rechazos.

No migres aún estos módulos a TanStack Query. Añade pruebas justificadas y
un recorrido breve de navegador para los cambios de interacción, cubriendo
variantes necesarias sin repetir escenarios equivalentes.
```

### 3. Corregir validación de archivos

Resultado: límites efectivos con compatibilidad de imágenes existentes.

```text
Ejecuta el paso 3: corregir la validación de archivos.

Revisa esquemas con condiciones de tamaño ineficaces. Aplica el límite
existente, distinguiendo archivo nuevo y referencia de imagen existente.
Revisa archivos vacíos según los requisitos actuales; no inventes
restricciones de formato ni cambies el umbral sin evidencia.

Conserva payloads multipart. Prueba límites y conservación de imágenes.
Extrae una regla común solo cuando las reglas coincidan realmente.
Usa pruebas automatizadas; navegador solo si cambias la interacción.
```

### 4. Consolidar convenciones de arquitectura

Resultado: guía coherente con la transición y con las decisiones del piloto.
La guía inicial ya está preparada; no reescribirla por rutina.

```text
Ejecuta el paso 4: consolidar la arquitectura objetivo.

Contrasta AGENTS.md y docs/refactor-progress.md con el código y el plan.
Completa las convenciones de services, consultas/mutaciones, thunks,
slices, hooks y componentes sin duplicar innecesariamente los documentos.

Documenta convivencia de módulos antiguos y migrados, propietarios del
estado y criterios para retirar infraestructura. Distingue cancelación
actual y política por verificar al migrar.

Mantén la política selectiva de Playwright. Reutiliza lo ya documentado;
no instales infraestructura ni dependencias en este paso.
```

### 5. Separar y mejorar autenticación

Resultado: authService y Redux con una responsabilidad de sesión explícita.

```text
Ejecuta el paso 5: separar HTTP y coordinación de autenticación.

Crea authService para login, registro, comprobación de sesión y logout,
conservando endpoints, payloads y cookies.

Mantén thunks y sesión en Redux Toolkit. Mejora tipos de estados, errores,
respuestas y selectores. Separa usuario de sesión y usuario administrativo.
Evita copias independientes de sesión.

Preserva formularios visibles y valores ante fallos; distingue comprobación
inicial y envío. Prueba contratos en el service y transiciones Redux.
Deja identificada la limpieza de caché a completar en el paso 6.
```

### 6. Incorporar infraestructura de TanStack Query

Resultado: cliente estable y coordinación segura con la sesión.

```text
Ejecuta el paso 6: incorporar TanStack Query.

Verifica versiones resueltas y documentación. Instala una versión estable
compatible de @tanstack/react-query sin actualizar dependencias ajenas.
Configura un QueryClient estable y su proveedor, sin migrar aún los CRUD.

Define vigencia, reintentos y actualización. Respeta los rechazos Axios;
el interceptor puede entregar el cuerpo HTTP y no un AxiosError.

Coordina cancelación y limpieza de consultas de sesión al salir/cambiar
de usuario, evitando resultados tardíos y dependencias circulares.
Añade pruebas pertinentes y conserva los módulos antiguos funcionando.
```

### 7. Preparar el service de permisos

Resultado: frontera de datos tipada con consumidores antiguos compatibles.

```text
Ejecuta el paso 7: preparar permisos como referencia de services.

Separa contratos de respuesta, entidad, formulario y parámetros conservando
campos y compatibilidad con sus consumidores.

Crea permissionService para listado, creación, actualización y borrado.
Centraliza parámetros, adaptación de identificador y respuestas.
Acepta AbortSignal donde corresponda y propaga fallos.

Mantén temporalmente los thunks coordinando Redux y consumiendo el service.
Traslada contratos HTTP a pruebas del service y conserva las garantías
necesarias de los thunks. No cambies identificadores ni relaciones por
deducción. No migres todavía la pantalla a TanStack Query.
```

### 8. Adaptar EntityList

Resultado: tabla controlada y reutilizable con transición compatible.

```text
Ejecuta el paso 8: adaptar progresivamente EntityList.

Tipa filas, columnas y eventos. Permite controlar página, orden y filtros
desde el consumidor, con una única fuente de estado.

Separa presentación del protocolo de carga y de los diálogos. Las acciones
comunican fila o identificador mediante callbacks explícitos.
Conserva compatibilidad temporal con consumidores antiguos mediante una
adaptación pequeña, evitando una migración masiva o variantes por banderas.

Preserva CRUD y solo lectura. Prueba consumidores representativos y usa
un recorrido breve de navegador si cambia su interacción.
```

### 9. Completar el piloto de permisos

Resultado: CRUD y opciones coherentes sin duplicación de estado remoto.

```text
Ejecuta el paso 9: migrar permisos a TanStack Query.

Implementa consultas/mutaciones que consuman permissionService. Incluye
página, tamaño, orden y filtros en las claves. Migra su consumo como
opciones donde sea necesario; verifica si el endpoint devuelve el catálogo
completo en lugar de asumirlo.

Invalida listas y opciones tras éxito. Resuelve totales y páginas vacías
tras borrar, preservando filtros y orden. Conserva formularios y diálogos
ante fallos. Retira estado/thunks anteriores solo sin consumidores.

Prueba contratos, concurrencia e invalidación. Ejecuta un recorrido breve
de CRUD, fallo/reintento, paginación y actualización de opciones.
```

### 10. Consolidar componentes compartidos

Resultado: reutilización con contratos precisos y campos específicos.

```text
Ejecuta el paso 10: consolidar componentes compartidos.

Contrasta implementaciones y extrae alertas, confirmaciones y estructura
de formularios mediante composición, conservando campos por dominio.
Mejora tipos de selectores, fechas y fotos con React Hook Form.
Elimina estados visuales duplicados que puedan desincronizarse.

Para errores del servidor, usa campos admitidos explícitamente y presenta
claves desconocidas como mensajes generales.

Evita formularios universales y contextos innecesarios. Prueba consumidores
representativos; Playwright solo para interacción o aspecto modificados.
```

### 11. Migrar catálogos, opciones y actividad

Resultado: patrón extendido respetando contratos de cada dominio.

```text
Ejecuta el paso 11: migrar los restantes catálogos y actividad.

Migra presentaciones, armas, municiones y drogas; después roles y usuarios.
Crea services por módulo y conecta consultas/mutaciones directamente.
Migra opciones de resouce coordinadamente con sus consumidores.

Conserva JSON/multipart, identificadores, relaciones e imágenes. Revisa
validación permisiva de relaciones contra el contrato disponible, sin
transformar formatos por suposición. Actividad es solo lectura.

Retira piezas antiguas solo sin consumidores. Prueba cada módulo y la
integración. Usa navegador para variantes relevantes; evita repetir
recorridos equivalentes de todos los catálogos.
```

### 12. Completar confiscaciones y subdecomisos

Resultado: consultas anidadas y edición compatibles con fallos y recargas.

```text
Ejecuta el paso 12: migrar confiscaciones y subdecomisos.

Crea sus services con serialización multipart y adaptación de relaciones.
Migra detalle, listas y mutaciones; distingue en las claves el decomiso
padre y los parámetros de consulta.

Conserva fechas, coordenadas, archivos y contratos. Evita que recargas
sobrescriban la edición; inicializa o restablece el formulario mediante
decisiones explícitas. Preserva guardado corregido y geocodificación.

Prueba concurrencia, errores y relaciones. Ejecuta un recorrido acotado
de los flujos particulares que necesiten navegador.
```

### 13. Añadir filtros compartidos en Redux

Resultado: estado aplicado serializable, separado de resultados y edición.

```text
Ejecuta el paso 13: añadir filtros aplicados compartidos en Redux.

Revisa qué filtros comparten realmente mapas y gráficos. Crea un slice
con acciones/selectores tipados y valores serializables, conservando los
formatos aceptados por el backend.

React Hook Form mantiene la edición y Redux recibe valores al pulsar
Aplicar. Define defaults y restablecimiento al cambiar de sesión.
Mantén opciones exclusivas locales y resultados remotos fuera del slice.

Prueba transiciones/selectores y documenta la conexión del paso 14.
```

### 14. Conectar mapas y gráficos

Resultado: análisis con services, consultas y contexto compartido.

```text
Ejecuta el paso 14: conectar mapas y gráficos.

Extrae peticiones a services. Usa TanStack Query con los filtros aplicados
de Redux e incluye en las claves los parámetros que cambien la respuesta.
Conserva ese contexto al navegar entre ambas vistas.

Completa tipos, carga/error/vacío y limpieza de capas/listeners.
Mantén locales los controles exclusivamente visuales y evita consultar
por cambios todavía no aplicados del formulario.

Prueba argumentos/concurrencia y un recorrido breve de navegación,
filtros compartidos y recuperación ante errores.
```

### 15. Retirar infraestructura anterior y revisar rendimiento

Resultado: código sin propietarios duplicados y mejoras justificadas.

```text
Ejecuta el paso 15: limpiar lo sustituido y revisar rendimiento.

Busca consumidores antes de eliminar slices remotos, thunks, acciones y
utilidades. Retira createLatestListRequest solo sin usos. Conserva Redux
para sesión y filtros compartidos.

Revisa imports/código compartido pesado manteniendo carga diferida.
Mide antes de optimizar; evita memoización generalizada. Si no hay
herramientas para un perfil, documenta el límite sin inventar resultados.

Comprueba contratos y ausencia de carga anticipada de módulos pesados.
Ejecuta regresión pertinente y registra mediciones y deuda restante.
```

### 16. Cerrar integración y documentación

Resultado: migración verificada, límites y pendientes explícitos.

```text
Ejecuta el paso 16: cerrar la integración.

Contrasta código y progreso. Comprueba propietarios claros del estado,
ausencia de implementaciones duplicadas y consumidores de piezas retiradas.

Ejecuta suite completa, lint y build; distingue deuda previa y errores
nuevos. Adapta pruebas de implementaciones eliminadas conservando garantías.

Haz regresión breve de navegador de puntos de integración y flujos sin
cobertura vigente, sin repetir escenarios aprobados sin cambios relevantes.
Documenta decisiones, comprobaciones, límites y pendientes. Distingue
HTTP simulado de comprobaciones reales contra el backend.
```

## Verificación proporcional y consumo de tokens

- Ejecutar pruebas relevantes, lint y build al cerrar bloques de código; suite
  completa en hitos de integración. No instalar otro runner solo para empezar.
- Services: contratos HTTP, parámetros, payloads, mapeo y rechazos. Consultas:
  claves, concurrencia, invalidación y sesión. Redux: transiciones/selectores.
  Conservar garantías al sustituir pruebas ligadas a thunks/reducers antiguos.
- Usar Playwright MCP para flujos que necesitan navegador: formularios corregidos,
  piloto, componentes compartidos y particularidades de confiscaciones/filtros.
  Cubrir variantes distintas, no cada módulo equivalente tras cada extracción.
- Reutilizar scripts, sesión y resultados vigentes. No reutilizar un contexto con
  interceptaciones pendientes; liberar recursos en finally.
- Mostrar aserciones aprobadas/fallidas, errores relevantes y rutas de artefactos.
  Snapshots acotados o capturas solo cuando se necesiten. Guardar diagnósticos
  extensos en archivos locales ignorados, sin datos privados.
- Consultar consola/red filtradas y usar herramientas React/perfiles solo para
  investigaciones concretas, verificando disponibilidad real de los MCP.

## Continuidad

La preparación documental no completa automáticamente los pasos 1 o 4.
Reutilizar lo preparado y completar únicamente los criterios que falten.
Los commits son puntos de referencia del código; estos documentos conservan
las decisiones necesarias entre conversaciones.
