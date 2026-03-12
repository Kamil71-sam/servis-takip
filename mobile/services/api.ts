
export const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  console.error("⚠️ HATA: .env dosyasında EXPO_PUBLIC_API_URL bulunamadı!");
}




// --- LOGIN ---
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// --- MÜŞTERİ İŞLEMLERİ ---
export async function createCustomer(name: string, phone: string, fax: string, email: string, address: string) {
  const response = await fetch(`${API_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, fax, email, address }),
  });
  return response.json();
}

export async function getCustomers() {
  try {
    const response = await fetch(`${API_URL}/customers`);
    if (!response.ok) throw new Error("Müşteri HTTP Hatası");
    return await response.json();
  } catch (error) {
    console.error("Müşteriler çekilirken hata:", error);
    return [];
  }
}


// --- FİRMA İŞLEMLERİ ---
export const getFirms = async () => {
  try {
    const response = await fetch(`${API_URL}/api/firm/all`);
    if (!response.ok) throw new Error("Firma listesi alınamadı");
    return await response.json();
  } catch (error) {
    return [];
  }
};

// MÜDÜR: İsimleri backend ile (firma_adi, telefon vb.) birebir eşitledim
export const createFirm = async (firmData: any) => {
  try {
    const response = await fetch(`${API_URL}/api/firm/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firmData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Kayıt başarısız");
    return result;
  } catch (error: any) {
    throw error;
  }
};






















/*


// --- FİRMA İŞLEMLERİ ---

// 1. Firmaları Listele
export const getFirms = async () => {
  try {
    const response = await fetch(`${API_URL}/api/firm/all`);
    if (!response.ok) throw new Error("Firma HTTP Hatası");
    return await response.json();
  } catch (error) {
    console.error("Firmalar çekilirken hata:", error);
    return []; 
  }
};

// 2. Yeni Firma Ekle (MÜDÜR: Backend'deki /add ve isimlerle tam uyumlu!)
export const createFirm = async (firmData: { 
  firma_adi: string; 
  yetkili_ad_soyad?: string; 
  telefon?: string; 
  faks?: string; 
  vergi_no?: string; 
  eposta?: string; 
  adres?: string 
}) => {
  try {
    const response = await fetch(`${API_URL}/api/firm/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firmData),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Firma Kayıt Hatası");
    
    return result; 
  } catch (error: any) {
    console.error("Firma eklenirken hata:", error);
    throw error;
  }
};

*/




// --- SERVİS KAYITLARI (MÜDÜR: TAM İSABET AYAR) ---
export const getServices = async () => {
  try {
    const response = await fetch(`${API_URL}/services/all`);
    
    if (!response.ok) {
        const altResponse = await fetch(`${API_URL}/services`);
        if (!altResponse.ok) throw new Error("Servis HTTP Hatası");
        return await altResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    console.error("Servisler çekilirken hata:", error);
    return []; 
  }
};

// --- CİHAZ VE SERVİS KABLOLARI ---

export const getCustomerDevices = async (customerId: number) => {
  try {
    const response = await fetch(`${API_URL}/devices/customer/${customerId}`);
    if (!response.ok) throw new Error("Cihaz HTTP Hatası");
    return await response.json();
  } catch (error) {
    console.error("Cihazlar çekilirken hata:", error);
    return [];
  }
};

export const createDevice = async (deviceData: { 
    customer_id: number; brand: string; model: string; serial_no: string; cihaz_turu?: string; garanti_durumu?: string; muster_notu?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deviceData),
    });
    return await response.json();
  } catch (error) {
    console.error("Cihaz eklenirken hata:", error);
    throw error;
  }
};

export const createServiceRecord = async (serviceData: { 
    device_id: number; issue_text: string; atanan_usta?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    return await response.json();
  } catch (error) {
    console.error("Servis açılırken hata:", error);
    throw error;
  }
};