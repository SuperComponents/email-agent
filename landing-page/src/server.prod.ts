import { serve } from 'bun';
import { join } from 'path';

const PORT = process.env.PORT || 3001;

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Remove leading ./ if present
    if (pathname.startsWith('./')) {
      pathname = pathname.slice(2);
    }

    // Serve index.html for root and any non-file routes
    if (pathname === '/' || pathname === '') {
      pathname = 'index.html';
    }

    // Remove leading slash if present
    if (pathname.startsWith('/')) {
      pathname = pathname.slice(1);
    }

    // Construct file path
    const filePath = join(import.meta.dir, '..', 'dist', pathname);

    try {
      const file = Bun.file(filePath);

      // Check if file exists
      if (await file.exists()) {
        // Set appropriate content-type
        const headers = new Headers();
        if (filePath.endsWith('.html')) {
          headers.set('Content-Type', 'text/html; charset=utf-8');
        } else if (filePath.endsWith('.js')) {
          headers.set('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
          headers.set('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.svg')) {
          headers.set('Content-Type', 'image/svg+xml');
        }

        return new Response(file, { headers });
      }
    } catch (error) {
      console.error('Error serving file:', error);
    }

    // 404 fallback - serve index.html for client-side routing
    const indexPath = join(import.meta.dir, '..', 'dist', 'index.html');
    const indexFile = Bun.file(indexPath);

    if (await indexFile.exists()) {
      return new Response(indexFile, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`🚀 Production server running at http://localhost:${PORT}`);
