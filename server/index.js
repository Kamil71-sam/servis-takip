const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

// [BÖLÜM 1] KURUMSAL FİRMA KAYDI
app.post('/api/save-company', async (req, res) => {
  const { company_name, tax_number, authorized_person, phone_number } = req.body;
  try {
    const query = `INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [company_name, tax_number, authorized_person, phone_number]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: "Firma mühürlenemedi." });
  }
});

// [BÖLÜM 2] TEKNİK SERVİS VE MÜŞTERİ KAYDI (TÜM KUTULARI DOLDURUR)
app.post('/api/yeni-servis', async (req, res) => {
  // Mobil formdan gelen Türkçe isimleri yakalıyoruz
  const { musterıAdı, telefon, marka, model, serıNo, arızaNotu } = req.body;

  try {
    // 1. ADIM: Müşteriyi 'customers' tablosuna yaz
    const [custRes] = await db.query(
      `INSERT INTO customers (full_name, phone_number) VALUES (?, ?)`, 
      [musterıAdı, telefon]
    );
    const yeniMusteriId = custRes.insertId;

    // 2. ADIM: Servis detaylarını 'service_orders' tablosuna yaz ve müşteriye bağla
    const cihazBilgisi = `${marka} ${model} (SN: ${serıNo})`;
    const [servRes] = await db.query(
      `INSERT INTO service_orders (customer_id, device_id, status_id, complaint, technician_note) VALUES (?, 1, 1, ?, ?)`,
      [yeniMusteriId, cihazBilgisi, arızaNotu]
    );
    
    // 3. ADIM: Uygulamaya 'Kayıt No'yu (Servis ID) gönder
    res.json({ success: true, id: servRes.insertId }); 
  } catch (err) {
    console.error("Mühürleme Hatası:", err.message);
    res.status(500).json({ success: false, error: "Veriler kutulara sığmadı!" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[BAŞARILI] Sunucu aktif: http://192.168.1.43:${PORT}`);
});