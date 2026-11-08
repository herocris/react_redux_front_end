// Keep stdout exclusively for the MCP protocol.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { delimiter, join } from 'node:path'

// Use the installed Brave on this Windows setup; other machines keep Chrome.
const bravePath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
const useBrave = process.platform === 'win32' && existsSync(bravePath)

const servers = {
  chrome_devtools: [
    'chrome-devtools-mcp@1.12.0',
    '--category-experimental-third-party',
    '--no-usage-statistics',
    '--isolated',
    ...(useBrave ? ['--executablePath', bravePath] : []),
  ],
  playwright: [
    '@playwright/mcp@0.0.84',
    '--isolated',
    '--snapshot-mode', 'none',
    '--codegen', 'none',
    '--console-level', 'warning',
    '--no-webmcp',
    ...(useBrave ? ['--executable-path', bravePath] : []),
  ],
}

const server = process.argv[2]
if (!Object.hasOwn(servers, server)) {
  console.error('Usage: node scripts/run-mcp.mjs <chrome_devtools|playwright>')
  process.exit(1)
}

// Run npx through Node on Windows to preserve paths containing spaces without
// passing arguments through cmd.exe's quoting rules.
const npxCli = process.platform === 'win32'
  ? (process.env.PATH || '').split(delimiter)
      .map(directory => join(directory, 'node_modules', 'npm', 'bin', 'npx-cli.js'))
      .find(path => existsSync(path))
  : undefined
if (process.platform === 'win32' && !npxCli) {
  console.error('Unable to locate npm/bin/npx-cli.js on PATH')
  process.exit(1)
}
const child = process.platform === 'win32'
  ? spawn(process.execPath, [npxCli, '--yes', ...servers[server]],
    { stdio: 'inherit', windowsHide: true })
  : spawn('npx', ['--yes', ...servers[server]], { stdio: 'inherit' })

child.on('error', (error) => {
  console.error(`Unable to start ${server}: ${error.message}`)
  process.exitCode = 1
})
child.on('exit', (code) => { process.exitCode = code ?? 1 })
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
