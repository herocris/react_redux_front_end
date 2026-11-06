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
   npm y Google Chrome. Las versiones efectivas están en el lockfile.
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
- Validar con `npm run lint` y `npm run build`. No existe script de tests aún.
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
