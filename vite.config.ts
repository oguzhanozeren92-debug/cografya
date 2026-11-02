
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';

// StackBlitz onizlemesinde Vercel API proxy'sine gerek kalmaz.
// Mevcut oyun sunucusu ve lisansli fotograflar yerel olarak kullanilir.
// Bu middleware yalnizca gelistirme sunucusunda calisir.
function globrivaLocalGameApi(): Plugin {
  return {
    name: 'globriva-local-game-api',
    configureServer(server) {
      // Gelistirme ortamina ozel gecici oturum anahtari.
      if (!process.env.STREET_SESSION_SECRET ||
          process.env.STREET_SESSION_SECRET.length < 32) {
        process.env.STREET_SESSION_SECRET =
          randomBytes(32).toString('hex');
      }
      process.env.STREET_R2_PUBLIC_BASE_URL ||=
        'https://atlas-arena-tau.vercel.app';

      type ApiRequest = IncomingMessage & {
        body?: unknown;
        query?: Record<string, string>;
      };

      type ApiResponse = ServerResponse & {
        status: (status: number) => ApiResponse;
        json: (payload: unknown) => ApiResponse;
      };

      type Handler = (
        req: ApiRequest,
        res: ApiResponse
      ) => void | Promise<void>;

      const getHandler = async (path: string): Promise<Handler> => {
        const url = pathToFileURL(resolve(process.cwd(), path)).href;
        const module = await import(/* @vite-ignore */ url);

        if (typeof module.default !== 'function') {
          throw new Error(`API işleyicisi yok: ${path}`);
        }
        return module.default as Handler;
      };

      const handlers = Promise.all([
        getHandler('api/street/session.js'),
        getHandler('api/street/guess.js'),
        getHandler('api/street/hint.js'),
        getHandler('api/heritage/panorama.js'),
      ]);

      const droneMedia = Promise.all([
        import(
          /* @vite-ignore */
          pathToFileURL(resolve(
            process.cwd(), 'server/drone/approved.mjs'
          )).href
        ),
        import(
          /* @vite-ignore */
          pathToFileURL(resolve(
            process.cwd(), 'server/drone/photo-ready.mjs'
          )).href
        ),
      ]);

      server.middlewares.use(async (req, res, next) => {
        const requestUrl = new URL(req.url || '/', 'http://localhost');
        const pathname = requestUrl.pathname;

        const supported = [
          '/api/drone/session',
          '/api/street/session',
          '/api/street/guess',
          '/api/street/hint',
          '/api/heritage/panorama',
        ];
        if (!supported.includes(pathname)) return next();

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');

        const send = (status: number, data: unknown) => {
          if (res.writableEnded) return;
          res.statusCode = status;
          res.end(JSON.stringify(data));
        };

        try {
          if (pathname === '/api/drone/session') {
            if (req.method !== 'GET') {
              return send(405, { error: 'Yalnızca GET desteklenir.' });
            }

            const [catalogue, ready] = await droneMedia;
            const ids = new Set<string>(ready.readyDronePhotoIds);

            const media = catalogue.approvedDroneMedia
              .filter((row: { id: string }) => ids.has(row.id))
              .map((row: { id: string; multires: object }) => ({
                id: row.id,
                media: {
                  mode: 'multires',
                  base: `/drone-photos/${row.id}`,
                  staticBase: `/drone-photos/${row.id}`,
                  config: row.multires,
                },
              }));

            if (media.length < 5) {
              return send(503, {
                error: 'Yerel Drone arşivinde beş onaylı panorama bulunamadı.',
              });
            }

            return send(200, {
              media,
              origin: 'local-preview',
            });
          }

          const [session, guess, hint, heritage] = await handlers;

          const handler = pathname === '/api/street/session'
            ? session
            : pathname === '/api/street/guess'
              ? guess
              : pathname === '/api/heritage/panorama'
                ? heritage
                : hint;

          const request = req as ApiRequest;
          request.query = Object.fromEntries(requestUrl.searchParams);

          if (req.method === 'POST') {
            let raw = '';
            for await (const part of req) {
              raw += part.toString();
              if (raw.length > 16384) {
                return send(413, { error: 'İstek çok büyük.' });
              }
            }

            try {
              request.body = JSON.parse(raw);
            } catch {
              return send(400, {
                error: 'İstek JSON biçiminde değil.',
              });
            }
          }

          const response = res as ApiResponse;
          response.status = function status(code) {
            this.statusCode = code;
            return this;
          };
          response.json = function json(data) {
            this.end(JSON.stringify(data));
            return this;
          };

          await handler(request, response);
        } catch (error) {
          const reason = error instanceof Error
            ? error.message
            : String(error);

          console.error('[Globriva dev API]', pathname, error);
          send(500, {
            error: `Yerel oyun servisi açılamadı: ${reason}`,
          });
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), globrivaLocalGameApi()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
