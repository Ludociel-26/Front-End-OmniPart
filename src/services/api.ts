import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si la API responde que no estamos autorizados (cookie borrada o expirada)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Disparamos un evento global que nuestro AppContext va a escuchar
      window.dispatchEvent(
        new CustomEvent('auth-error', {
          detail: { status: error.response.status },
        }),
      );
    }
    return Promise.reject(error);
  },
);

export default api;
