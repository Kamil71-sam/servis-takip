const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

/**
 * [KRİTİK BÖLÜM] Teknik Servis ve Müşteri Kaydı
 * YeniKayitFormu.tsx'den gelen değişken isimleriyle tam uyumlu hale getirildi.
 */
app.post('/api/yeni-servis', async (req, res) => {
  // Mobil formdaki JSON paketinden gelen isimler:
  const { adSoyad, tel, email, adres, marka, model, seriNo, not, personel } = req.body;

  try {
    // 1. ADIM: Müşteriyi 'customers' tablosuna mühürle
    const customerQuery = `INSERT INTO customers (full_name, phone_number, email, address) VALUES (?, ?, ?, ?)`;
    const [custRes] = await db.query(customerQuery, [adSoyad, tel, email, adres]);
    const yeniMusteriId = custRes.insertId;

    // 2. ADIM: Servis kaydını aç ve cihaz bilgilerini mühürle
    // Cihaz detayı marka, model ve seri no birleştirilerek kaydedilir.
    const fullDesc = `${marka} ${model} (SN: ${seriNo})`;
    const techNote = `Personel: ${personel} | Not: ${not}`;
    
    const serviceQuery = `
      INSERT INTO service_orders (customer_id, device_id, status_id, complaint, technician_note) 
      VALUES (?, 1, 1, ?, ?)
    `;
    const [servRes] = await db.query(serviceQuery, [yeniMusteriId, fullDesc, techNote]);
    
    // 3. ADIM: Mobil uygulamaya "Sistem Takip No"yu geri gönder
    res.json({ 
      success: true, 
      id: servRes.insertId, 
      customer_id: yeniMusteriId 
    }); 
  } catch (err) {
    console.error("Mühürleme Hatası:", err.message);
    res.status(500).json({ success: false, error: "Veritabanı bağlantı hatası." });
  }
});

// [FİRMA KAYDI] Mevcut yapıyı koruyoruz
app.post('/api/save-company', async (req, res) => {
  const { company_name, tax_number, authorized_person, phone_number } = req.body;
  try {
    const query = `INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [company_name, tax_number, authorized_person, phone_number]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: "Firma kaydı başarısız." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[BAŞARILI] Sunucu aktif: http://192.168.1.39:${PORT}`);
});