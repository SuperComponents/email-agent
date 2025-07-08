import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: ['http://localhost:5173', 'http://localhost:3001'], // Frontend dev server ports
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'X-Request-ID'],
  maxAge: 86400,
  credentials: true,
})