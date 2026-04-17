// src/api/config.ts
const rawApiBase =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "";

const defaultApiBase = import.meta.env.PROD ? "/bff" : "http://localhost:5000";
const isInsecureHttp = /^http:\/\//i.test(rawApiBase);

// In production we proxy all backend calls through the Vercel /bff rewrite so
// the HTTPS frontend never issues mixed-content requests to the insecure
// backend. If an env var accidentally points at an http:// origin in prod we
// coerce it to /bff instead of leaking plaintext URLs to the browser.
export const API_BASE_URL =
  rawApiBase.trim().length === 0
    ? defaultApiBase
    : import.meta.env.PROD && isInsecureHttp
      ? "/bff"
      : rawApiBase;

export const REQUEST_TIMEOUT = 30000;

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  getAuthToken,
  getAuthHeaders,
};
