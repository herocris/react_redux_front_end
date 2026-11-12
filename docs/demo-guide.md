# Guía de demostración

## Estado preparado el 12 de noviembre de 2026

Decomisos permite gestionar registros y consultar cantidades y ubicaciones.
El acceso precargado del login es una decisión intencional del propietario
para los visitantes de la demo. Basta pulsar **Iniciar sesión**. Los valores
siguen en el formulario existente. Esta guía conserva esa cuenta y sus
asignaciones.

La preparación P12 se realizó en `http://localhost:5174`, con API
`http://localhost/api` y medios `http://localhost/storage`. En P14 el propietario
confirmó que aún carece de producción. La verificación pública queda pendiente.
El candidato `crisdemo.xyz`, enlazado desde el login para documentación API,
rechazó las conexiones HTTP/HTTPS durante la comprobación. Configuración de
build, fallback SPA, resultados y matriz pública pendientes en la
[guía de despliegue P14](deployment-guide.md).

Se añadieron **12 registros persistentes nuevos**, identificados con
`DEMO_P12_V1`. Cuatro catálogos propios, dos decomisos y tres hijos de cada
decomiso. Sus nombres, cantidades, observaciones y escenarios son ficticios.
Las coordenadas aproximadas representan puntos de demostración. Las diez
imágenes PNG contienen el texto «DEMO / Imagen ficticia» y se generaron con
canvas. Los registros anteriores conservan su contenido y sus relaciones.
Su procedencia permanece sin acreditar.

La definición reproducible está en [demo-data-p12.json](demo-data-p12.json).
El [inventario local](demo-inventory-p12-local-2026-11-12.json) guarda los IDs
devueltos por esta API y las referencias de los diez medios. Los IDs se
resuelven de nuevo al preparar otro entorno.

| Escenario | Fecha | Decomiso local | Droga / peso | Armas | Municiones |
| --- | --- | --- | --- | --- | --- |
| A, Distrito Central | 03/11/2026 | 5028 | 2 / 1 | 1 | 10 |
| B, San Pedro Sula | 10/11/2026 | 5029 | 3 / 2 | 2 | 20 |

El peso conserva la magnitud del contrato existente. La API de gráficos
devuelve cantidades 5, 3 y 30 para estos catálogos en noviembre de 2026.
Son resultados de estos escenarios ficticios.

## Recorrido para el reclutador, unos cuatro minutos

1. Abrir la aplicación y pulsar **Iniciar sesión** con los campos precargados.
   El panel presenta accesos a las herramientas disponibles.
2. Pulsar **Abrir decomisos**. En escritorio, pulsar dos veces la cabecera
   `id` hasta ordenar de mayor a menor. Los escenarios B y A aparecen al
   principio en el estado preparado. Abrir **Ver detalle** en B y desplegar
   **Drugs**, **Weapons** y **Ammunitions** para consultar sus registros e imágenes.
   Esas tres etiquetas son las que muestra actualmente la interfaz.
   En móvil se puede abrir directamente `/confiscation/detail/5029` en este
   entorno local. Consultar el inventario del entorno para obtener el ID vigente.
3. Desde el menú, abrir **Gráficos**. Mantener periodo **Meses**, tipo **Drogas**
   y **Barra**. Introducir fechas inicial `01/11/2026` y final `30/11/2026`.
   Seleccionar únicamente `DEMO_P12_V1 Sustancia A ficticia` en Drogas y pulsar
   **Aplicar filtros**. El resultado es 5. Abrir **Ver datos del gráfico**
   para consultar el mismo resultado en una tabla.
4. Abrir **Mapa** desde el menú en la misma sesión. Los filtros aplicados se
   comparten con gráficos. Se obtienen los dos puntos de demostración.
   Explorar un marcador y volver al panel mediante el menú.
5. Opcionalmente consultar los catálogos. Finalizar con **Cerrar sesión**.

Para mostrar armas o municiones, cambiar el tipo en gráficos y seleccionar
solo su catálogo `DEMO_P12_V1`. En el mapa conviene conservar exclusivamente
los IDs de demostración en los selectores utilizados. Una consulta amplia
puede incluir registros anteriores. Fechas de otro mes pueden producir vacío.

## Funciones disponibles con el acceso actual

El login real devolvió rol `administrador` y **73 permisos efectivos**.
Los **48 permisos del proyecto** cubren lectura, alta, edición y borrado de
usuarios, roles, permisos, drogas, presentaciones, armas, municiones,
decomisos y sus tres tipos de hijos. Incluyen lectura de actividad, panel,
gráficos y mapa. Otros 25 permisos históricos permanecen en la sesión.
La interfaz interpreta los permisos efectivos recibidos según `auth/access.ts`.

El acceso de demostración permite también las pantallas administrativas.
El recorrido propuesto usa consultas. La cuenta compartida puede efectuar
escrituras autorizadas por el backend, por lo que sus cambios pueden ser
visibles para otros visitantes. P12 verificó navegación de esos módulos y
creación de los datos propios. La matriz funcional exhaustiva sigue en los
informes P01/P04/P05. Sus asignaciones se conservaron.

## Fixtures y datos persistentes

| Uso | Ubicación e identificación | Ciclo de vida |
| --- | --- | --- |
| Definición de demo | `docs/demo-data-p12.json`, prefijo `DEMO_P12_V1` | Se mantiene para visitas y se registra en inventario por entorno. |
| Preparación de demo | `scripts/prepare-demo-p12.js` | Crea exclusivamente registros nuevos y conserva los resultados tras éxito. |
| Verificación P12 | `tests/browser/demo-p12.js` | Consultas, login/logout y rechazo de credenciales ficticias. |
| Fixtures históricos | `tests/browser/`, prefijos `PORTFOLIO_*` y datos interceptados de P10/P11 | Se limpian al terminar cada prueba según su recorrido. |

La suite `npm test` usa el cargador SSR y transporte simulado. Es independiente
de estos datos persistentes. Los resultados simulados anteriores mantienen
su alcance registrado. La demo se prepara expresamente con la API real.

## Preparación y restablecimiento

Para preparar un entorno con el frontend de desarrollo autenticado, usar
Playwright MCP `browser_run_code_unsafe` con
`filename: "scripts/prepare-demo-p12.js"`. El script importa la definición
y los services de la app. Requiere permisos de lectura, alta y borrado en los
ocho dominios implicados para poder revertir una preparación fallida.

Antes de escribir busca el prefijo en los cinco dominios principales y detiene
la ejecución si ya existe. Conserva unos 1,4 segundos entre operaciones y
evita reintentar escrituras automáticamente. Guarda cada ID confirmado en
`sessionStorage`, clave `demo-p12-preparation`, y devuelve el inventario.
Guardar esa respuesta saneada en un archivo por entorno antes de cerrar la
pestaña. Una ejecución completa deja doce registros y seis lecturas de hijos
confirmadas. Recargar las vistas después para consultar los datos recién creados.

Si falla a mitad, intenta borrar únicamente los IDs confirmados de esa ejecución
en orden inverso y devuelve el resultado por registro. Una respuesta de escritura
perdida requiere comprobar el prefijo y las relaciones en la API antes de repetir.
La clave de sesión sirve de apoyo para recuperar el inventario en esa pestaña.

Para volver al estado base después de modificaciones, revisar primero el
inventario del entorno y comparar cada registro con la definición.
La limpieza se limita a los registros creados para la demo y acreditados
por ese inventario. Cualquier hijo nuevo debe identificarse y documentarse
antes de decidir su tratamiento.

1. Leer los tres listados de hijos de cada padre y confirmar IDs, relaciones
   y catálogos. Registrar cualquier diferencia respecto al inventario.
2. Borrar por sus IDs los hijos de drogas, armas y municiones del inventario.
   Releer las tres sublistas y comprobar que los hijos inventariados desaparecieron.
3. Con las relaciones revisadas, borrar los dos padres inventariados.
4. Comprobar que los cuatro catálogos propios carecen de referencias adicionales.
   Borrarlos por sus IDs si siguen correspondiendo al inventario.
5. Buscar `DEMO_P12_V1` en los cinco dominios principales y acreditar total cero.
   Ante un rechazo o una respuesta perdida, releer antes de continuar.
6. Ejecutar la preparación, guardar el nuevo inventario y repetir el recorrido.
   Los nuevos IDs pueden cambiar. Conservar el inventario anterior como histórico.

Las rutas API son `DELETE /api/<dominio>/<id>` y los hijos se consultan con
`GET /api/<dominio>/<padre>/confiscation`, usando los dominios del inventario.
Aplicar el mismo control de frecuencia que al preparar. La limpieza del
inventario evita cambiar usuarios, credenciales, roles, asignaciones y otros
registros. La auditoría generada por las operaciones se conserva.

**Estado de esta ejecución.** La preparación y las lecturas se ejecutaron.
Los doce registros permanecen disponibles en la API local. El restablecimiento
completo por borrado/recreación es un procedimiento documentado pendiente de
ensayo. La protección frente a una segunda preparación se comprueba por separado.

## Límites y pendientes backend

- El workspace contiene el frontend. Transportar la definición al entorno
  público requiere ejecutar su preparación contra esa API o implementar en
  Laravel un seeder acotado a este conjunto, resolviendo IDs por creación y
  manteniendo las cuentas/asignaciones existentes. Quedan pendientes esa
  preparación pública y su nuevo inventario.
- Falta acreditar y gestionar la eliminación física de imágenes. P07 comprobó
  que un PNG seguía público tras borrar su registro. El inventario P12 incluye
  las diez referencias para que el backend pueda revisar sus archivos y
  referencias antes de retirarlos. El backend debe ofrecer un procedimiento
  acotado de eliminación de medios huérfanos de la demo y comprobarlo con GET.
- Falta una operación backend de restablecimiento conjunto si se necesita
  atomicidad o reinicio automático. El procedimiento actual usa escrituras
  individuales y requiere reconciliar fallos. P12 prepara datos mediante los
  endpoints disponibles.
- Se conservan los límites P06 de paginación vacía, P07 de medios y el ajuste
  P05 para autenticación anónima sin `Accept: application/json`.
  Teselas y geocodificación dependen de servicios externos. La persistencia
  local acreditada no confirma el despliegue público.

Las verificaciones de esta ejecución y sus incidencias están en
[el informe P12](verification-demo-p12-2026-11-12.md).
