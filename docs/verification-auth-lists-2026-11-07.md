# Conservación de formularios de acceso

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
