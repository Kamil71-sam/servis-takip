import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚨 MÜDÜRÜN YALAN MAKİNESİ (Sarı Uyarılar Temizlendi)
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    const msg = (data?.message || "").toLowerCase();

    // 🔍 KONTROL: Mesajda "key", "constraint", "hata" geçiyorsa veya success false ise ÇÖK!
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