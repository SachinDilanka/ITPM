/**
 * API base URL.
 * - Dev: leave unset — Vite proxies /api to the backend (vite.config.js).
 * - Prod: set VITE_API_URL in .env (e.g. https://your-api.com)
 */
export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  return `${base}${p}`;
}

/** Full URL for static files served by the API (e.g. /uploads/avatars/...). */
export function assetUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  return apiUrl(pathOrUrl);
}
