// Keep stdout exclusively for the MCP protocol.
import { spawn } from 'node:child_process'

const servers = {
  chrome_devtools: [
    'chrome-devtools-mcp@1.12.0',
    '--category-experimental-third-party',
    '--no-usage-statistics',
  ],
  playwright: ['@playwright/mcp@0.0.84'],
}

const server = process.argv[2]
if (!Object.hasOwn(servers, server)) {
  console.error('Usage: node scripts/run-mcp.mjs <chrome_devtools|playwright>')
  process.exit(1)
}

// Windows cannot spawn .cmd directly. Shell arguments come from the fixed
// allowlist above, never from user input.
const child = process.platform === 'win32'
  ? spawn(process.env.ComSpec || 'cmd.exe', [
      '/d', '/s', '/c', `npx --yes ${servers[server].join(' ')}`,
    ], { stdio: 'inherit', windowsHide: true })
  : spawn('npx', ['--yes', ...servers[server]], { stdio: 'inherit' })

child.on('error', (error) => {
  console.error(`Unable to start ${server}: ${error.message}`)
  process.exitCode = 1
})
child.on('exit', (code) => { process.exitCode = code ?? 1 })
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal))
}
