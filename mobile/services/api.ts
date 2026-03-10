const API_URL = "http://192.168.1.44:3000";

// LOGIN
export async function login(email: string, password: string) {
  const response = await fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return response.json();
}

// MÜŞTERİ EKLE
export async function createCustomer(
  name: string,
  phone: string,
  fax: string,
  email: string,
  address: string
) {
  const response = await fetch(API_URL + "/customers", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      phone,
      fax,
      email,
      address,
    }),
  });

  return response.json();
}

// MÜŞTERİLERİ LİSTELE
export async function getCustomers() {
  const response = await fetch(API_URL + "/customers");
  return response.json();
}


// --- YENİ EKLENEN CİHAZ VE SERVİS KABLOLARI (GÜNCELLENDİ) ---

// 1. Seçilen müşterinin cihazlarını getirir
export const getCustomerDevices = async (customerId: number) => {
  try {
    const response = await fetch(`${API_URL}/devices/customer/${customerId}`);
    return await response.json();
  } catch (error) {
    console.error("Cihazlar çekilirken hata:", error);
    throw error;
  }
};

// 2. Yeni cihaz ekler (MÜDÜR: Buraya yeni kolonları ekledik!)
export const createDevice = async (deviceData: { 
    customer_id: number; 
    brand: string; 
    model: string; 
    serial_no: string;
    cihaz_turu?: string;       // YENİ
    garanti_durumu?: string;   // YENİ
    muster_notu?: string;      // YENİ
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

// 3. Yeni servis kaydı açar (MÜDÜR: Usta artık ayrı gidiyor!)
export const createServiceRecord = async (serviceData: { 
    device_id: number; 
    issue_text: string;
    atanan_usta?: string;      // YENİ
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