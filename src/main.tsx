// Register before importing any module that loads React or React DOM.
async function bootstrap() {
  if (import.meta.env.DEV) {
    await import('react-devtools-cdt-mcp/register')
  }

  await import('./bootstrap')
}

void bootstrap().catch((error: unknown) => {
  console.error('No se pudo iniciar la aplicación', error)
})
