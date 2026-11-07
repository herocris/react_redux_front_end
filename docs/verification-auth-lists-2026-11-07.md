# Autenticación y carga de listados

Verificación realizada el 7 de noviembre de 2026, con React 19.3.1,
React Hook Form 7.55.0, Axios 1.21.0, Redux Toolkit 2.6.1 y MUI Data Grid 7.27.3.

## Conservación de formularios de acceso

Login y registro dejan de activar `checking` al enviar. Ese estado se mantiene
para el arranque de sesión, sin cambiar las rutas protegidas. Cada formulario
espera la promesa del hook y usa `isSubmitting` para mostrar carga y deshabilitar
sus controles mediante un `fieldset`. No se añade estado global duplicado.

En Brave con Playwright MCP, para ambas vistas se verificó:

- La petición se mantiene pendiente con una respuesta simulada controlada.
- El nodo del formulario no se desmonta durante la espera.
- Los controles y el botón quedan deshabilitados; Enter no duplica la petición.
- Tras el error se conservan los campos, incluidas las contraseñas y confirmación.
- Se puede reintentar sin volver a introducir los datos.
- No aparecen excepciones no controladas.

La prueba automatizada también comprueba que el estado público se mantiene
mientras la petición está pendiente y cambia a autenticado tras el éxito.
No se alteraron endpoints, cookies ni campos de login/registro.

## Dependencias y carga de los nueve listados

Módulos: usuarios, municiones, drogas, armas, presentaciones de drogas, roles,
permisos, actividades y decomisos.

`useEntityList` depende de los valores efectivos de página, orden y filtro, y del
callback estable de carga. Pasar un nuevo objeto con los mismos parámetros no
repite la petición. El filtro numérico cero se conserva como `"0"`.

El efecto entrega una señal de cancelación y aborta al cambiar parámetros o
desmontar. Cada thunk usa `createLatestListRequest`: una petición nueva cancela
la anterior del mismo listado y store. Solo la vigente publica resultados,
paginación y fin de carga. Las cancelaciones intencionadas no publican errores.
La coordinación es independiente entre listados y stores y libera las referencias
al terminar. No se modifica el estado Redux para guardar controladores.

La pequeña utilidad compartida evita repetir la misma coordinación en los nueve
thunks. No se añadieron dependencias ni se migraron los thunks a otra API.

## Comprobaciones

`npm test` informa 60 pruebas satisfactorias, contando los grupos de Node.
La nueva cobertura ejecuta cuatro escenarios sobre cada uno de los nueve módulos:

1. La respuesta antigua termina antes, pero no apaga la carga de la más reciente.
2. La respuesta antigua llega después, pero no reemplaza los resultados recientes.
3. Cancelar al desmontar termina carga sin publicar error ni resultados.
4. Dos stores independientes no cancelan sus peticiones entre sí.

Se usan los reducers y el cliente Axios reales con transporte simulado. Se
comprueban también los endpoints existentes, cookies y el mapeo `identificador`.

Playwright MCP con Brave confirmó:

- Una sola petición inicial en cada uno de los nueve listados.
- Ninguna recarga por un render sin cambios o por objetos equivalentes de
  paginación/filtro en el hook compartido.
- Conservación del filtro cero, cambio de página correcto y limpieza del efecto.
- En el grid de usuarios, dos clics rápidos generan orden ascendente y descendente;
  se mantiene la carga mientras llega el segundo resultado y una respuesta vieja
  posterior no cambia la fila visible. Al terminar desaparece el indicador.
- Ausencia de excepciones no controladas en esos recorridos.

La prueba inicial del grid leía un store distinto al montado debido a módulos
versionados por HMR. Se corrigió la comprobación para usar filas e indicador
visibles. También se cerró un contexto con respuestas simuladas pendientes antes
de repetirla; el resultado indicado corresponde a la repetición satisfactoria.

Lint global: 139 errores y 37 advertencias, frente a 146 y 40 al inicio de estos
dos bloques. El build pasa y conserva el aviso previo de bundle grande.

## Documentación y límites

Se consultaron las skills Vercel React Best Practices y Composition Patterns y
Context7. Context7 cubre React 19.3.1; para React Hook Form 7.55.0 y Axios 1.21.0
se contrastó la documentación oficial general con los tipos instalados, al faltar
esas versiones exactas en su catálogo. No se añadieron contextos ni memoización
ajena a la estabilidad necesaria de los callbacks.

Las pruebas HTTP están simuladas: no acreditan autenticación, cookies ni
persistencia contra un backend real. Los errores y cargas de las operaciones de
escritura de otros módulos conservan su tratamiento anterior. No se hizo un
perfil de rendimiento ni se modificó geocodificación; ese es el siguiente bloque
de la tabla priorizada.
