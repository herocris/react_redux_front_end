# Tipado y composición CRUD: armas — 2026-11-07

Bloque limitado a `src/modules/weapon`, siguiendo `drugPresentation`. Se revisaron
AGENTS.md, los cuatro informes anteriores y el estado inicial de Git. Se conservan
los cambios pendientes anteriores sin modificarlos.

## Cambios

- Props y callbacks explícitos, errores `ApiErrorMessage`, respuestas HTTP tipadas
  e identificador obligatorio para editar y borrar.
- Los cuatro thunks limpian errores anteriores y conservan la causa del rechazo.
  Ante fallos permanecen los datos y la selección; se conserva la coordinación de
  cancelación y respuestas obsoletas de los listados.
- El formulario maneja el rechazo en el submit y aplica errores solo a campos
  conocidos. Conserva texto y archivo para reintentar y bloquea campos y cierre
  durante el envío. Los títulos y guardar tienen nombres accesibles.
- Borrado compuesto con elementos MUI: muestra errores, conserva diálogo y fila
  ante fallos, y limpia la selección al cancelar. Se corrige la referencia anterior
  a municiones. `WeaponError` presenta errores en las tres superficies del módulo.

Se mantienen endpoints, cookies, campos, creación multipart y edición mediante
POST multipart con `_method=PUT`. Solo se envía logo al editar si es un archivo
nuevo. Sin dependencias nuevas, componentes CRUD globales ni cambios de esquema.

## Documentación

Versiones comprobadas en package-lock.json: React 19.3.1, React Hook Form 7.55.0,
resolvers 5.9.2, Zod 4.6.7, Redux Toolkit 2.6.1, Axios 1.21.0 y MUI 6.4.7.
Se consultaron las skills Vercel sobre eventos y composición con children.
Context7 confirmó manejo de rechazos con handleSubmit/setError; no ofrece el
parche 7.55.0. Se contrastaron la documentación oficial de
[handleSubmit](https://react-hook-form.com/docs/useform/handlesubmit) y
[Dialog MUI v6](https://v6.mui.com/material-ui/react-dialog/), junto con la
compilación con las versiones instaladas.

## Verificación

- `npm test`: 77 pruebas aprobadas. `tests/weapon.test.mjs` comprueba los cuatro
  thunks ante errores, conservación de causa/datos/selección, limpieza de errores,
  identificadores, creación, edición con y sin archivo y borrado tras éxito.
- `npm run build`: correcto; persiste el aviso de chunk compartido grande.
- `npm run lint`: 122 errores y 35 advertencias frente a 128 y 36 del informe
  anterior. Lint específico de armas y sus dos scripts de pruebas: correcto.
- `git diff --check -- src/modules/weapon`: correcto. El diff global conserva
  espacios finales previos en DrugPresentationFormModal.tsx.
- Playwright MCP activo y Brave confirmado mediante `chrome://version`, con
  ejecutable BraveSoftware/Brave-Browser/Application/brave.exe.
- `tests/browser/weapon.js`: siete comprobaciones aprobadas sobre el build servido
  por el preview existente en 127.0.0.1:4175. Cancelar borrado limpia selección;
  crear con 422 conserva texto/imagen y marca el campo; bloquea envío y Escape;
  reintentar añade la fila; editar con desconexión conserva formulario; el éxito
  actualiza fila y mantiene el contrato multipart; borrar con 500 conserva fila
  y diálogo, y reintentar los elimina. Dos intentos por operación.
- Cero excepciones de página y cero mensajes inesperados en consola. Tres errores
  de red deliberados: 422, desconexión y 500. Se inspeccionó visualmente el modal
  de creación en `.playwright-mcp/weapon-form.png`, sin recortes de controles.
- Chrome DevTools MCP responde a list_pages; su página está en about:blank y no
  expone herramientas React. No se realizó perfil de componentes o rendimiento.

Las respuestas HTTP y las imágenes se simulan. No se acredita persistencia real,
permisos del servidor ni procesamiento de archivos. La validación previa de tamaño
de archivos sigue pendiente de un bloque específico, como en drugPresentation.
El siguiente catálogo puede seguir este patrón tras revisar su contrato concreto.
