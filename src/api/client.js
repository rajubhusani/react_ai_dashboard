import axios from 'axios';

// Configure your backend API URL here
const API_BASE_URL = import.meta.env.VITE_API_URL;

console.log('🔧 API Client Configuration:');
console.log('   Base URL:', API_BASE_URL);
console.log('   Environment:', import.meta.env.MODE);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management: fetch from OAuth and cache in memory with refresh before expiry
let cachedToken = null; // { access_token: string, expires_at: number }
let tokenPromise = null; // coalesce concurrent requests

const TOKEN_SKEW_MS = 60_000; // refresh 1 minute before expiry
const TOKEN_DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes default validity

async function fetchToken() {
  const TOKEN_API_URL = import.meta.env.VITE_TOKEN_API_URL;
  if (!TOKEN_API_URL) {
    console.error('❌ TOKEN_API_URL is not set in environment');
    throw new Error('TOKEN_API_URL missing');
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expires_at - TOKEN_SKEW_MS > now) {
    return cachedToken.access_token;
  }

  if (tokenPromise) {
    return tokenPromise;
  }

  tokenPromise = (async () => {
    try {
      const body = {
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        grant_type: 'client_credentials',
      };

      const resp = await axios.post(TOKEN_API_URL, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      const { access_token, expires_in } = resp.data || {};
      if (!access_token) {
        throw new Error('Token endpoint did not return access_token');
      }

      const ttlMs = typeof expires_in === 'number' && expires_in > 0
        ? expires_in * 1000
        : TOKEN_DEFAULT_TTL_MS;

      cachedToken = {
        access_token,
        expires_at: Date.now() + ttlMs,
      };
      console.log('🔑 Obtained new OAuth token');
      return access_token;
    } catch (e) {
      console.error('❌ Failed to fetch OAuth token', e);
      throw e;
    }
  })();

  try {
    return await tokenPromise;
  } finally {
    tokenPromise = null;
  }
}

// Add request interceptor for auth token and logging
apiClient.interceptors.request.use(
  async (config) => {
    // Attach OAuth token
    const token = await fetchToken();

    // Axios v1: headers can be AxiosHeaders or a plain object; set safely without type errors
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      };
    }

    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params);
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
apiClient.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default apiClient;

