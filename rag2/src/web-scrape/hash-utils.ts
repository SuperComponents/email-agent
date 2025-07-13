import { createHash } from 'crypto';

export function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex').substring(0, 8);
}

export function createVectorStoreFilename(url: string, content: string): string {
  const hash = generateContentHash(content);
  const sanitizedUrl = url.replace(/[^a-zA-Z0-9-_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return `${hash}-${sanitizedUrl}.md`;
}

export function extractHashFromFilename(filename: string): string {
  const match = filename.match(/^([a-f0-9]{8})-/);
  return match ? match[1] : '';
}

export function extractUrlFromFilename(filename: string): string {
  const match = filename.match(/^[a-f0-9]{8}-(.*)\.md$/);
  return match ? match[1].replace(/_/g, '/') : '';
}