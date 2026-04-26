import AsyncStorage from '@react-native-async-storage/async-storage'; // MÜDÜR: Yaka kartını cebinden çıkarmak için ekledik

export const API_URL = process.env.EXPO_PUBLIC_API_URL;
if (!API_URL) {
  console.error("⚠️ HATA: .env dosyasında EXPO_PUBLIC_API_URL bulunamadı!");
}

// --- MÜDÜRÜN AKILLI POSTACISI ---
// Bu fonksiyon standart 'fetch' yerine geçecek. Her mektupta cebindeki kartı (token) zorla zarfın üstüne yapıştıracak.
async function fetchWithAuth(url: string, options: any = {}) {
  // 1. Cebine bak, kart var mı?
  const token = await AsyncStorage.getItem('userToken');
  
  // 2. Eğer options.headers yoksa boş bir obje oluştur ki hata vermesin
  const headers = options.headers || {};
  
  // 3. Eğer kart varsa, mektubun gizli cebine (Authorization) yapıştır
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // 4. Mektubu yolla gitsin
  options.headers = headers;
  return fetch(url, options);
}


// --- LOGIN (BURASI KARTSIZ GİRİŞ KAPISI OLDUĞU İÇİN NORMAL FETCH KULLANIR) ---
export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return response.json();
}

// --- MÜŞTERİ İŞLEMLERİ (BİREYSEL) ---
export async function createCustomer(name: string, phone: string, fax: string, email: string, address: string) {
  const response = await fetchWithAuth(`${API_URL}/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, fax, email, address }),
  });
  return response.json();
}

export async function getCustomers() {
  try {
    const response = await fetchWithAuth(`${API_URL}/customers`);
    if (!response.ok) throw new Error("Müşteri HTTP Hatası");
    return await response.json();
  } catch (error) {
    console.error("Müşteriler çekilirken hata:", error);
    return [];
  }
}

export async function updateCustomer(id: number, customerData: any) {
  const response = await fetchWithAuth(`${API_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  return response.json();
}

export async function deleteCustomer(id: number, force: boolean = false) {
  const url = `${API_URL}/customers/${id}${force ? '?force=true' : ''}`;
  const response = await fetchWithAuth(url, {
    method: "DELETE",
  });
  return response.json();
}

// --- FİRMA İŞLEMLERİ ---
export const getFirms = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/firm/all`);
    if (!response.ok) throw new Error("Firma listesi alınamadı");
    return await response.json();
  } catch (error) {
    return [];
  }
};

export const createFirm = async (firmData: any) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/firm/add`, {
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

export const updateFirm = async (id: number, firmData: any) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/firm/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(firmData),
    });
    return await response.json();
  } catch (error) {
    console.error("Firma güncellenirken hata:", error);
    throw error;
  }
};

export const deleteFirm = async (id: number, force: boolean = false) => {
  try {
    const url = `${API_URL}/api/firm/${id}${force ? '?force=true' : ''}`;
    const response = await fetchWithAuth(url, {
      method: "DELETE",
    });
    return await response.json();
  } catch (error) {
    console.error("Firma silinirken hata:", error);
    throw error;
  }
};

// --- SERVİS KAYITLARI ---
export const getServices = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/services/all`);
    if (!response.ok) {
        const altResponse = await fetchWithAuth(`${API_URL}/services`);
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
export const getCustomerDevices = async (id: number, type: string = 'bireysel') => {
  try {
    const response = await fetchWithAuth(`${API_URL}/devices/customer/${id}?type=${type}`);
    if (!response.ok) throw new Error("Cihaz HTTP Hatası");
    return await response.json();
  } catch (error) {
    console.error("Cihazlar çekilirken hata:", error);
    return [];
  }
};

export const createDevice = async (deviceData: any) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/devices`, {
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

export const createServiceRecord = async (serviceData: any) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/services`, {
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

// --- MÜDÜR: SERVİS GÜNCELLEME ---
export const updateService = async (id: number, data: any) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Güncelleme işlemi başarısız");
    return await response.json();
  } catch (error) {
    console.error("Servis güncelleme API hatası:", error);
    throw error;
  }
};

export const deleteService = async (id: number) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/services/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Silme işlemi başarısız");
    return await response.json();
  } catch (error) {
    console.error("Servis silme API hatası:", error);
    throw error;
  }
};

// --- RANDEVU İŞLEMLERİ ---

export const getAppointments = async () => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/appointments/liste/aktif`);
    if (!response.ok) throw new Error("Randevu listesi alınamadı");
    return await response.json();
  } catch (error) {
    console.error("Randevular çekilirken hata:", error);
    return [];
  }
};

// MÜDÜR: RANDEVU EKLEME BORUSU BURADA!
export const createAppointment = async (appointmentData: any) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/appointments/ekle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointmentData),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Randevu oluşturulamadı");
    return result;
  } catch (error) {
    console.error("Randevu ekleme hatası:", error);
    throw error;
  }
};

// MÜDÜR: ÇAKIŞMA KONTROLÜ (İptal olanları boş sayar)
export const checkAppointmentCollision = async (date: string, time: string) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/appointments/check-conflict?date=${date}&time=${time}`);
    if (!response.ok) throw new Error("Çakışma kontrolü başarısız");
    const result = await response.json();
    return result.isOccupied; // Backend'den true/false gelir
  } catch (error) {
    console.error("Çakışma kontrolü hatası:", error);
    return false;
  }
};

export const cancelAppointment = async (id: number) => {
  try {
    const response = await fetchWithAuth(`${API_URL}/api/appointments/iptal/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });
    const text = await response.text();
    try {
        const result = JSON.parse(text);
        if (!response.ok) throw new Error(result.error || "Sunucu hatası");
        return result;
    } catch (e) {
        console.error("Backend'den garip bir şey geldi:", text);
        throw new Error("Sunucudan geçersiz yanıt geldi.");
    }
  } catch (error: any) {
    throw error;
  }
};

// --- MÜDÜR: DİĞER İSTASYONLARIN KULLANMASI İÇİN POSTACIYI DIŞARI AÇIYORUZ ---
export { fetchWithAuth };