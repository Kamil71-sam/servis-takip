import axios from 'axios';

// MÜDÜR: Yeni IP adresiyle (192.168.1.39) bağlantıyı tazeledik
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.39:3000';
const API_URL = `${BASE_URL}/api/material`;

// --- 1. USTANIN MALZEME TALEBİ GÖNDERMESİ ---
export const sendMaterialRequest = async (data: {
  service_id: number;
  usta_email: string;
  part_name: string;
  quantity: number;
  description: string;
}) => {
  try {
    const response = await axios.post(`${API_URL}/add`, data);
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error("MÜDÜR - Malzeme talebi hatası:", errorMsg);
    throw error;
  }
};

// --- 2. BANKO İÇİN TÜM TALEPLERİ ÇEKME ---
export const getAllMaterialRequests = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`);
    
    // PostgreSQL'den gelen datayı kontrol edip sarmallıyoruz
    if (response.data && response.data.success) {
        return response.data;
    }
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error("MÜDÜR - Talepler çekilirken hata:", errorMsg);
    throw error;
  }
};

// --- 3. AKILLI DURUM GÜNCELLEME (LOGLU) ---
// Müdür: Burası artık 3. parametre olan 'user_name'i de kabul ediyor
export const updateMaterialStatus = async (id: number, status: string, user_name: string) => {
  try {
    // Hem durumu (Geldi) hem de işlemi yapanı (Kemal Müdür) paketleyip yolluyoruz
    const response = await axios.put(`${API_URL}/update-status/${id}`, { 
      status, 
      user_name 
    });
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error("MÜDÜR - Durum güncelleme hatası:", errorMsg);
    throw error;
  }
};