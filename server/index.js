const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

// [MÜHÜRLEME MERKEZİ] Hem Müşteri Hem Servis Kaydı
app.post('/api/yeni-servis', async (req, res) => {
  // Mobil taraftan gelebilecek tüm ihtimalleri karşılıyoruz
  const data = req.body;
  const isim = data.musterıAdı || data.full_name || 'Bilinmeyen Müşteri';
  const tel = data.telefon || data.phone_number || '000';
  const cihaz = `${data.marka || ''} ${data.model || ''} (SN: ${data.serıNo || ''})`.trim();
  const not = data.arızaNotu || data.technician_note || 'Not yok';

  try {
    // 1. Müşteriyi mühürle
    const [custRes] = await db.query(
      `INSERT INTO customers (full_name, phone_number) VALUES (?, ?)`, 
      [isim, tel]
    );
    const yeniMusteriId = custRes.insertId;

    // 2. Servis kaydını o müşteriye bağla
    const [servRes] = await db.query(
      `INSERT INTO service_orders (customer_id, device_id, status_id, complaint, technician_note) VALUES (?, 1, 1, ?, ?)`,
      [yeniMusteriId, cihaz, not]
    );
    
    // 3. Kayıt No'yu gönder
    res.json({ success: true, id: servRes.insertId }); 
  } catch (err) {
    console.error("Hata:", err.message);
    res.status(500).json({ success: false, error: "Kayıt mühürlenemedi!" });
  }
});

// Firma kaydını da bozmadan ekliyoruz
app.post('/api/save-company', async (req, res) => {
  const { company_name, tax_number, authorized_person, phone_number } = req.body;
  try {
    const query = `INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [company_name, tax_number, authorized_person, phone_number]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[BAŞARILI] Sunucu aktif: http://192.168.1.39:${PORT}`);
});