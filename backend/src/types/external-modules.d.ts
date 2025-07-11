/*
  Ambient type declarations to satisfy TypeScript compiler for third-party
  ESM packages whose type definitions are not shipped in a way that our
  current tsconfig (NodeNext + verbatimModuleSyntax) can automatically pick
  up.  These are intentionally kept very broad (using `any`) so that the
  codebase continues to type-check without blocking on precise type support.

  NOTE: Replace these temporary declarations with the official types once
  they become available / the upstream packages ship stable typings.
*/

declare module 'hono' {
  const value: any
  export = value
}

declare module 'hono/*' {
  const value: any
  export = value
}

declare module '@hono/node-server' {
  const value: any
  export = value
}

// Drizzle ORM core and sub-modules

declare module 'drizzle-orm' {
  const value: any
  export = value
}

declare module 'drizzle-orm/*' {
  const value: any
  export = value
}