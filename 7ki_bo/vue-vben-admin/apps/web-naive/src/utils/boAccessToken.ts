/**
 * BO must only keep admin access JWTs (role/username).
 * Player JWTs ({ account }) cause 403 on every admin route + dashboard SSE.
 */

export type BoJwtClaims = {
  account?: string;
  exp?: number;
  id?: string;
  role?: string;
  username?: string;
};

export function decodeJwtClaims(token: string): BoJwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as BoJwtClaims;
  } catch {
    return null;
  }
}

/** True when JWT looks like a backoffice admin access token. */
export function isBoAdminAccessToken(token: unknown): token is string {
  if (typeof token !== 'string' || token.length < 20) return false;
  const claims = decodeJwtClaims(token);
  if (!claims) return false;
  // Player tokens always carry `account`; admin tokens carry role and/or username.
  if (claims.account && !claims.role && !claims.username) return false;
  return !!(claims.role || claims.username);
}

export function isAccessTokenExpired(token: string, skewSec = 30): boolean {
  const claims = decodeJwtClaims(token);
  if (!claims?.exp || typeof claims.exp !== 'number') return true;
  return claims.exp * 1000 <= Date.now() + skewSec * 1000;
}
