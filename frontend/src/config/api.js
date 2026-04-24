/**
 * API base URL.
 * - Dev: leave unset — Vite proxies /api to the backend (vite.config.js).
 * - Prod: set VITE_API_URL in .env (e.g. https://your-api.com or https://your-api.com/api)
 *
 * Paths are written as /api/... so they work with the Vite proxy. If VITE_API_URL already
 * ends with /api, a leading /api on the path is stripped to avoid /api/api/...
 */
export function apiUrl(path) {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  let p = path.startsWith('/') ? path : `/${path}`;
  if (!base) return p;
  if (/\/api$/i.test(base) && p.startsWith('/api/')) {
    p = p.slice(4); // '/api' + remainder → '/auth/login', '/notes', ...
  }
  return `${base}${p}`;
}

/** Full URL for static files served by the API (e.g. /uploads/avatars/...). */
export function assetUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl;
  return apiUrl(pathOrUrl);
}
