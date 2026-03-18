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

// --- MÜŞTERİ İŞLEMLERİ (BİREYSEL) ---
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

export async function updateCustomer(id: number, customerData: any) {
  const response = await fetch(`${API_URL}/customers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customerData),
  });
  return response.json();
}

export async function deleteCustomer(id: number, force: boolean = false) {
  const url = `${API_URL}/customers/${id}${force ? '?force=true' : ''}`;
  const response = await fetch(url, {
    method: "DELETE",
  });
  return response.json();
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

export const updateFirm = async (id: number, firmData: any) => {
  try {
    const response = await fetch(`${API_URL}/api/firm/${id}`, {
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
    const response = await fetch(url, {
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
export const getCustomerDevices = async (id: number, type: string = 'bireysel') => {
  try {
    const response = await fetch(`${API_URL}/devices/customer/${id}?type=${type}`);
    if (!response.ok) throw new Error("Cihaz HTTP Hatası");
    return await response.json();
  } catch (error) {
    console.error("Cihazlar çekilirken hata:", error);
    return [];
  }
};

export const createDevice = async (deviceData: { 
    customer_id?: number | null; 
    firm_id?: number | null;
    customer_type?: string;
    brand: string; 
    model: string; 
    serial_no: string; 
    cihaz_turu?: string; 
    auto_focus?: string; 
    garanti_durumu?: string; 
    muster_notu?: string;
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
    device_id: number; 
    customer_id?: number | null; 
    firm_id?: number | null; // MÜDÜR: FIRMA BORUSU EKLENDİ!
    issue_text: string; 
    atanan_usta?: string; 
    musteri_notu?: string;
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





/*

// MÜDÜR: Buradaki tek hatayı bitiren güncelleme!
export const createServiceRecord = async (serviceData: { 
    device_id: number; 
    customer_id?: number | null; // Boru buraya eklendi!
    issue_text: string; 
    atanan_usta?: string; 
    musteri_notu?: string;
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

*/







// --- MÜDÜR: SERVİS GÜNCELLEME ---
export const updateService = async (id: number, data: any) => {
  try {
    const response = await fetch(`${API_URL}/services/${id}`, {
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
    const response = await fetch(`${API_URL}/services/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error("Silme işlemi başarısız");
    return await response.json();
  } catch (error) {
    console.error("Servis silme API hatası:", error);
    throw error;
  }
};


export const getAppointments = async () => {
  try {
    // MÜDÜR: Tarayıcıda çalışan adresin aynısını buraya çakıyoruz
    const response = await fetch(`${API_URL}/api/appointments/liste/aktif`);
    
    if (!response.ok) throw new Error("Randevu listesi alınamadı");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Randevular çekilirken hata:", error);
    return [];
  }
};



export const cancelAppointment = async (id: number) => {
  try {
    const response = await fetch(`${API_URL}/api/appointments/iptal/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" }
    });

    const text = await response.text(); // Önce ham metni al (Hata sayfasını görmek için)
    
    try {
        const result = JSON.parse(text); // Sonra JSON'a çevirmeyi dene
        if (!response.ok) throw new Error(result.error || "Sunucu hatası");
        return result;
    } catch (e) {
        // Eğer JSON değilse, gelen ham metni terminalde gör
        console.error("Backend'den garip bir şey geldi:", text);
        throw new Error("Sunucudan geçersiz yanıt geldi.");
    }
  } catch (error: any) {
    throw error;
  }
};

