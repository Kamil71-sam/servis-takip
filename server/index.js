const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

/**
 * [BÖLÜM 1] Tekil Müşteri Kaydı
 * Sadece bireysel müşteri kaydı için kullanılır.
 */
app.post('/api/yeni-musteri', async (req, res) => {
  const { full_name, phone_number, email, address } = req.body;
  try {
    const query = `INSERT INTO customers (full_name, phone_number, email, address) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [full_name, phone_number, email, address]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Müşteri Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * [BÖLÜM 2] Kurumsal Firma Kaydı
 * YeniFirmaFormu.tsx içindeki JSON paketini (company_name, tax_number vb.) tam karşılar.
 */
app.post('/api/save-company', async (req, res) => {
  // Senin formundan gelen isimlerle tam uyum sağlandı
  const { company_name, tax_number, authorized_person, phone_number } = req.body;
  try {
    const query = `
      INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [company_name, tax_number, authorized_person, phone_number]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Firma Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "Firma mühürlenemedi." });
  }
});

/**
 * [BÖLÜM 3] Profesyonel Servis ve Müşteri Kaydı (Hibrit Yapı)
 * Bu bölüm hem müşteriyi 'customers' tablosuna yazar hem de servis kaydını ona bağlar.
 */
app.post('/api/yeni-servis', async (req, res) => {
  // Mobil uygulamadan gelen ham veriler
  const { full_name, phone_number, marka, model, seriNo, not } = req.body;

  try {
    // 1. Önce müşteriyi customers tablosuna mühürle
    const customerQuery = `INSERT INTO customers (full_name, phone_number) VALUES (?, ?)`;
    const [customerResult] = await db.query(customerQuery, [full_name, phone_number]);
    const yeniMusteriId = customerResult.insertId;

    // 2. Oluşan müşteri ID'si ile servis kaydını mühürle
    // device_id ve status_id NULL kalmasın diye varsayılan 1 değerini basıyoruz
    const serviceQuery = `
      INSERT INTO service_orders (customer_id, device_id, status_id, complaint, technician_note) 
      VALUES (?, 1, 1, ?, ?)
    `;
    const fullDesc = `${marka} ${model} (SN: ${seriNo})`;
    const [serviceResult] = await db.query(serviceQuery, [yeniMusteriId, fullDesc, not || '']);
    
    // 3. Mobil uygulamaya yeni Kayıt No'yu (ID) geri gönder
    res.json({ 
      success: true, 
      id: serviceResult.insertId, // Ekranda görünecek servis numaranız
      customer_id: yeniMusteriId 
    }); 
  } catch (err) {
    console.error("Servis Mühürleme Hatası:", err.message);
    res.status(500).json({ success: false, error: "Teknik hata: Kayıt oluşturulamadı." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[BAŞARILI] Sunucu 5000 portunda aktif.`);
  console.log(`[ADRES] http://192.168.1.43:${PORT}`);
});