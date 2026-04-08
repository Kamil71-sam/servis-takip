



import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // MÜDÜR: Kartı cebimizden çıkarmak için
import { API_URL as GLOBAL_API_URL } from './api'; // MÜDÜR: Ana merkezdeki güncel (1.50) adresi buraya bağladık!

// MÜDÜR: Artık eski 1.39 IP'si ile uğraşmıyoruz, tek merkezden (api.ts) alıyoruz.
const API_URL = `${GLOBAL_API_URL}/api/material`;

// --- MÜDÜR: AXIOS İÇİN AKILLI KART OKUYUCU ---
// Her axios isteğinde cebimizden kartı çıkarıp zarfa ekleyeceğiz
const getAuthConfig = async () => {
  const token = await AsyncStorage.getItem('userToken');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ''
    }
  };
};

// --- 1. USTANIN MALZEME TALEBİ GÖNDERMESİ ---
export const sendMaterialRequest = async (data: {
  service_id: number;
  usta_email: string;
  part_name: string;
  quantity: number;
  description: string;
}) => {
  try {
    const config = await getAuthConfig(); // Kartı hazırladık
    const response = await axios.post(`${API_URL}/add`, data, config);
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
    const config = await getAuthConfig(); // Kartı hazırladık
    const response = await axios.get(`${API_URL}/all`, config);
    
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
    const config = await getAuthConfig(); // Kartı hazırladık
    // Hem durumu (Geldi) hem de işlemi yapanı (Kemal Müdür) paketleyip yolluyoruz
    const response = await axios.put(`${API_URL}/update-status/${id}`, { 
      status, 
      user_name 
    }, config);
    return response.data;
  } catch (error: any) {
    const errorMsg = error.response?.data?.error || error.message;
    console.error("MÜDÜR - Durum güncelleme hatası:", errorMsg);
    throw error;
  }
};
