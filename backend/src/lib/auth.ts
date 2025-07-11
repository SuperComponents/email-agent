import { SignJWT, jwtVerify } from 'jose';
import { hash, compare } from 'bcrypt';
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN } from '../config/env.js';

const BCRYPT_ROUNDS = 12;

// JWT payload types
export interface AccessTokenPayload {
  userId: number;
  email: string;
  role: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: number;
  type: 'refresh';
}

// Convert secret strings to Uint8Array for jose
const accessSecret = new TextEncoder().encode(JWT_ACCESS_SECRET);
const refreshSecret = new TextEncoder().encode(JWT_REFRESH_SECRET);

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

/**
 * Convert time string to seconds for JWT expiration
 */
function parseExpiration(exp: string): number {
  const match = exp.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiration format: ${exp}`);
  }
  
  const [, value, unit] = match;
  const num = parseInt(value, 10);
  
  switch (unit) {
    case 's': return num;
    case 'm': return num * 60;
    case 'h': return num * 60 * 60;
    case 'd': return num * 60 * 60 * 24;
    default: throw new Error(`Invalid expiration unit: ${unit}`);
  }
}

/**
 * Sign an access token
 */
export async function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): Promise<string> {
  const jwt = new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + parseExpiration(JWT_ACCESS_EXPIRES_IN));
  
  return jwt.sign(accessSecret);
}

/**
 * Sign a refresh token
 */
export async function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): Promise<string> {
  const jwt = new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + parseExpiration(JWT_REFRESH_EXPIRES_IN));
  
  return jwt.sign(refreshSecret);
}

/**
 * Verify an access token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    
    if (payload.type !== 'access') {
      throw new Error('Invalid token type');
    }
    
    return payload as unknown as AccessTokenPayload;
  } catch (error) {
    throw new Error('Invalid access token');
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    
    return payload as unknown as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}

/**
 * Extract bearer token from Authorization header
 */
export function extractBearerToken(authorization: string | undefined): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }
  
  return authorization.slice(7);
}
