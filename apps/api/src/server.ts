import { buildApp } from './app.js';

const port = Number(process.env.SORO_PORT ?? 3000);
const app = await buildApp();
app.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`[soro/api] listening on :${port}`);
});
