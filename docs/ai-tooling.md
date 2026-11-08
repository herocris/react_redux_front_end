# Entorno de refactorización con IA

## Contenido versionado

- `AGENTS.md`: arquitectura y reglas de este repositorio.
- `.agents/skills/`: copias de Vercel React Best Practices y Composition Patterns.
  `skills-lock.json` registra origen y hashes; no requieren una instalación global.
- `.codex/config.toml`: MCP por proyecto para Codex.
- `.vscode/mcp.json`: configuración equivalente para VS Code/Copilot.
- `scripts/run-mcp.mjs`: lanzador Windows/macOS/Linux con versiones fijas de
  Chrome DevTools MCP (1.12.0) y Playwright MCP (0.0.84).
- Context7 usa su endpoint remoto; no se instala como dependencia de la app.
- `react-devtools-cdt-mcp` (0.1.0) es una dependencia de desarrollo. Se registra
  desde `src/main.tsx` antes de importar `src/bootstrap.tsx`, que monta la app.
  Vite elimina ese registro del build de producción.

## Montarlo en otro equipo

1. Instalar Node.js compatible con el campo `engines` de Vite y los MCP
   (recomendado Node 22.12+ dentro de la rama 22 o una LTS posterior compatible),
   npm y Google Chrome o Brave. Las versiones efectivas están en el lockfile.
2. Clonar el repo, ejecutar `npm ci` y configurar localmente `VITE_API_URL` en
   `.env` para apuntar al backend. No guardar credenciales en Git.
3. Abrir el repositorio como carpeta raíz en Codex y marcarlo como proyecto de
   confianza cuando lo solicite. Reiniciar la sesión/extensión para cargar los MCP.
   Las skills estarán disponibles en el siguiente turno con un cliente compatible.
4. En Codex comprobar `/mcp` o ejecutar `codex mcp list`. En VS Code/Copilot usar
   `MCP: List Servers` y arrancar los servidores del workspace. Son configuraciones
   para clientes distintos: activar solo la que se esté utilizando.
5. Ejecutar `npm run dev` y pedir al agente que abra la URL que imprime Vite.
   Chrome DevTools descubre las herramientas React de la página de desarrollo;
   Playwright permite verificar navegación, formularios y flujos completos.

En PowerShell usar `npm.cmd` y `npx.cmd` si la política de scripts bloquea `.ps1`.
Los MCP locales se descargan con `npx` en el primer arranque de cada equipo:
necesitan red y permisos para la caché de npm. No se instalan globalmente ni se
añaden a las dependencias de la aplicación.

### Brave en Windows

El lanzador detecta Brave en
`C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe`.
Si existe, Chrome DevTools MCP lo recibe con `--executablePath` y Playwright MCP
con `--executable-path`; en otros equipos se conserva la búsqueda de Chrome.
Ambos usan `--isolated` para crear perfiles de pruebas temporales, sin utilizar
el perfil personal de Brave. No hace falta instalar Chrome en esta configuración.
En Windows se invoca `npx-cli.js` con Node para conservar completa la ruta con
espacios; no se interpone `cmd.exe` ni se añaden comillas al argumento de la ruta.

Después de modificar el lanzador, reiniciar ambos servidores MCP o la sesión de
Codex y comprobar que abren Brave. Los procesos ya iniciados conservan los
argumentos anteriores. La detección del ejecutable no garantiza por sí sola que
las herramientas React experimentales funcionen con Brave.

### Respuestas breves de Playwright MCP

El lanzador fija Playwright MCP 0.0.84 con estas opciones, verificadas para esa
versión en Context7 y su documentación oficial:

| Opción | Efecto |
| --- | --- |
| `--snapshot-mode none` | Evita snapshots automáticos en las respuestas de las acciones. |
| `--codegen none` | Evita devolver el código generado junto a cada operación. |
| `--console-level warning` | Limita el nivel automático de consola a advertencias y errores. |
| `--no-webmcp` | No descubre herramientas WebMCP de las páginas en Playwright. |

Las herramientas explícitas de búsqueda, snapshot, consola, red y capturas siguen
disponibles. No se habilitan capacidades adicionales con `--caps`. Las capturas
visuales se solicitan solo cuando son útiles; no se bloquean sus imágenes.
Chrome DevTools mantiene la configuración para las herramientas React.

Para localizar un control, comenzar con una búsqueda acotada:

```json
{"text":"Guardar","maxResults":3}
```

Si se necesita contexto de un formulario, pedir un snapshot explícito limitado:

```json
{"target":"form","depth":3}
```

`maxResults` pertenece a `browser_find`; `target` y `depth` pertenecen a
`browser_snapshot`, no a una configuración global del servidor. Si un árbol es
grande, usar `filename` y leer solo el fragmento necesario. En recorridos conocidos,
reutilizar scripts y devolver resúmenes de aserciones en vez de transcripciones.
Una acción correcta puede devolver texto vacío con estas opciones; confirmar su
resultado con una aserción o búsqueda dirigida, sin pedir un árbol completo por
rutina.

Para regresiones repetibles, ejecutar primero `npm test`. La aplicación utiliza
Node y Vite para sus pruebas actuales; todavía no incluye Playwright Test, Vitest
ni React Testing Library. Una futura suite E2E debe usar Playwright Test y mostrar
al agente el resultado final y los fallos, reservando MCP para exploración y
verificación interactiva. Este ajuste no instala un nuevo runner.

Reiniciar Playwright MCP después de cambiar el lanzador. Un proceso ya iniciado
conserva la configuración anterior. Estas opciones reducen información devuelta;
no representan una medición ni una garantía de ahorro fijo de tokens.

Comprobación local con Brave y dos procesos MCP nuevos: en una página sintética
de 300 filas, la respuesta de `browser_run_code_unsafe` pasó de 514 a 39
caracteres y la de un clic de 181 a 0. Se verificó que el clic ya no añadía
snapshot automático y que `browser_find` y el snapshot explícito del formulario
seguían funcionando. Es una comparación de caracteres de ese caso, no de tokens.

Referencia: [Playwright MCP 0.0.84](https://github.com/microsoft/playwright-mcp/blob/v0.0.84/README.md).

## Context7 y credenciales

La configuración compartida no incluye claves. Si el servicio requiere autenticación
o se alcanzan sus límites, configurar una API key en el entorno local del cliente.
En Codex se puede añadir a la sección existente, sin guardar el valor de la clave:

```toml
bearer_token_env_var = "CONTEXT7_API_KEY"
```

Definir esa variable antes de abrir Codex; un `.env` de Vite no se carga
automáticamente en el proceso del agente. Consultar las instrucciones oficiales
para autenticación en otros clientes. No sustituir el endpoint por claves en URLs.

## Uso y mantenimiento

- Pedir cambios concretos: el agente consulta las skills pertinentes y Context7,
  modifica el módulo afectado y comprueba el resultado.
- React DevTools para agentes es experimental. El servidor real es Chrome
  DevTools MCP, configurado con `--category-experimental-third-party`.
- Chrome DevTools y Playwright abren perfiles independientes: no comparten
  automáticamente el login del navegador habitual ni sus sesiones entre sí.
- Validar con `npm run lint`, `npm run build` y `npm test`. Las pruebas de errores
  HTTP usan un transporte simulado y no necesitan acceso al backend.
- No confundir configuración con conexión: comprobar los servidores después de
  reiniciar el cliente y verificar los flujos con el backend disponible.
- Para actualizar las skills, revisar cambios y ejecutar desde la raíz:

```sh
npx --yes skills add vercel-labs/agent-skills --skill vercel-react-best-practices vercel-composition-patterns --agent codex --copy --yes
```

Revisar y versionar los cambios de las skills y del lockfile. Los MCP se actualizan
cambiando sus versiones en el lanzador después de verificar compatibilidad.

## Referencias oficiales

- [Vercel Agent Skills](https://github.com/vercel-labs/agent-skills)
- [Codex MCP](https://developers.openai.com/codex/mcp)
- [Context7](https://github.com/upstash/context7)
- [React DevTools para agentes](https://react.dev/reference/dev-tools/react-devtools-cdt-mcp)
- [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
