/**
 * Cloudflare Worker that proxies to OpenAI's chat completions endpoint and streams
 * the response back to the widget.
 *
 * Environment variable required:
 *   - OPENAI_API_KEY
 */
export interface Env {
  OPENAI_API_KEY: string;
}

const CORS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS pre-flight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
          ...CORS,
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // Chat endpoint
    if (request.method === "POST" && url.pathname === "/api/chat") {
      const incoming = await request.json();

      // Extract OpenAI-compatible fields
      const {
        messages = [],
        model = "gpt-4o-mini",
        temperature,
      } = incoming;

      const openaiResp = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          stream: true,
          messages,
          ...(typeof temperature === "number" ? { temperature } : {}),
        }),
      });

      if (!openaiResp.ok) {
        const errorText = await openaiResp.text();
        return new Response(`OpenAI error: ${errorText}`, {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
            ...CORS,
          },
        });
      }

      // Stream OpenAI chunks straight back to the client
      return new Response(openaiResp.body, {
        headers: {
          "Content-Type": "text/plain",
          "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
          ...CORS,
        },
      });
    }

    return new Response("Not found", { status: 404 });
  },
}; 