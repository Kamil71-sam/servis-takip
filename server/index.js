const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

// --- SİSTEM DURUM KONTROLÜ ---
app.get('/', (req, res) => {
  res.send('Kalandar Yazılım Teknik Servis Sunucusu Aktif.');
});

// --- [BÖLÜM 1] MÜŞTERİ KAYDI ---
app.post('/api/yeni-musteri', async (req, res) => {
  const { full_name, phone_number, email, address } = req.body;
  try {
    const query = `INSERT INTO customers (full_name, phone_number, email, address) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [full_name, phone_number, email, address]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Müşteri Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "SQL Müşteri Tablo Hatası" });
  }
});

// --- [BÖLÜM 2] FİRMA KAYDI ---
app.post('/api/save-company', async (req, res) => {
  const { company_name, tax_number, authorized_person, phone_number } = req.body;
  try {
    const query = `INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [company_name, tax_number, authorized_person, phone_number]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Firma Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "SQL Firma Tablo Hatası" });
  }
});

// --- [BÖLÜM 3] SERVİS İŞ KAYDI (TABLO VE SÜTUNLAR DÜZELTİLDİ) ---
app.post('/api/yeni-servis', async (req, res) => {
  const { marka, model, seriNo, not } = req.body;
  try {
    // MÜHÜR: Tablo ismini senin veritabanındaki 'service_orders' yaptık
    const query = `
      INSERT INTO service_orders (
        device_name, device_model, serial_number, description, status
      ) VALUES (?, ?, ?, ?, 'Beklemede')
    `;
    const [result] = await db.query(query, [marka, model, seriNo, not]);
    res.json({ success: true, id: result.insertId }); 
  } catch (err) {
    // Terminalde hata verirse sütun isimlerini kontrol etmek için detaylı log
    console.error("Servis İş Hatası (Sütun İsimlerini Kontrol Et):", err.message);
    res.status(500).json({ success: false, error: "Veritabanı sütun uyumsuzluğu!" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[SİSTEM] Sunucu 5000 portu üzerinden aktif edildi.`);
});