import axios from 'axios';

// 🚨 MÜDÜR: '/api' takıntısını sildik ve adresini direkt 3000'e sabitledik!
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_URL, // <-- BURADAKİ '/api' UÇTU!
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Yalan Makinesi (Aynı kalıyor)
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    const msg = (data?.message || "").toLowerCase();

    if (
      msg.includes("foreign") || 
      msg.includes("key") || 
      msg.includes("constraint") || 
      msg.includes("hata") || 
      msg.includes("error") ||
      data?.success === false
    ) {
        return Promise.reject(data);
    }

    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;