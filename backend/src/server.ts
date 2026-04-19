import { handlePostScore, handleGetLeaderboard } from './routes/scores';

const PORT = 3001;
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function serveStaticFile(urlPath: string): Promise<Response> {
  const frontendDist = `${import.meta.dir}/../../frontend/dist`;

  const filePath = urlPath === '/' || urlPath === ''
    ? `${frontendDist}/index.html`
    : `${frontendDist}${urlPath}`;

  const file = Bun.file(filePath);
  if (await file.exists()) {
    return new Response(file);
  }

  return new Response(Bun.file(`${frontendDist}/index.html`));
}

try {
  console.log('Starting server...');

  Bun.serve({
    port: PORT,
    routes: {
      '/api/scores': {
        POST: async (req) => withCors(await handlePostScore(req)),
        OPTIONS: () => withCors(new Response(null, { status: 204 })),
      },
      '/api/leaderboard': {
        GET: async (req) => withCors(await handleGetLeaderboard(req)),
        OPTIONS: () => withCors(new Response(null, { status: 204 })),
      },
    },
    async fetch(req) {
      const url = new URL(req.url);

      if (req.method === 'OPTIONS') {
        return withCors(new Response(null, { status: 204 }));
      }

      return await serveStaticFile(url.pathname);
    },
  });

  console.log(`Server is running on port ${PORT}`);
} catch (error) {
  console.error('Server startup error:', error);
  process.exit(1);
}
