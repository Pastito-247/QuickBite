// Prefer runtime-injected value (window.__REACT_APP_API_URL) for no-rebuild deployments.
const RUNTIME_API = typeof window !== 'undefined' && window.__REACT_APP_API_URL ? window.__REACT_APP_API_URL : null;
const BUILD_API = process.env.REACT_APP_API_URL || '';

// Fallback to localhost to avoid producing malformed URLs like "http://:8080"
const API_BASE = RUNTIME_API || BUILD_API || 'http://localhost:8080';

const apiURL = (path) => {
  if (!path) return API_BASE;
  if (!API_BASE) return path;
  const base = API_BASE.replace(/\/$/, '');
  return path.startsWith('/') ? base + path : base + '/' + path;
};

export default apiURL;
