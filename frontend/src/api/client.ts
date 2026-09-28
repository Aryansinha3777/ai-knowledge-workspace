import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || '';
    const isConnectionIssue =
      !error.response ||
      message.toLowerCase().includes("can't reach database") ||
      message.toLowerCase().includes('connection');

    if (isConnectionIssue) {
      error.friendlyMessage =
        "The server is waking up after a period of inactivity. Please try again in a few seconds.";
    }

    return Promise.reject(error);
  }
);


export function warmUpServer() {
  const root = API_URL.replace(/\/api\/?$/, '');
  fetch(`${root}/health`, { mode: 'no-cors' }).catch(() => {});
}

export default api;