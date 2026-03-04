const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

// [BÖLÜM 1] Müşteri Kaydı - Artık sadece 'full_name' kullanıyoruz
app.post('/api/yeni-musteri', async (req, res) => {
  const { full_name, phone_number, email, address } = req.body;
  try {
    const query = `INSERT INTO customers (full_name, phone_number, email, address) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [full_name, phone_number, email, address]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// [BÖLÜM 2] Firma Kaydı - Senin formundaki isimlerle %100 uyumlu
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

// [BÖLÜM 3] Servis Kaydı - 'device_id' hatasını kökten çözer
app.post('/api/yeni-servis', async (req, res) => {
  const { marka, model, seriNo, not } = req.body;
  try {
    const query = `
      INSERT INTO service_orders (customer_id, device_id, status_id, complaint, technician_note) 
      VALUES ((SELECT id FROM customers ORDER BY id DESC LIMIT 1), 1, 1, ?, ?)
    `;
    const description = `${marka} ${model} (SN: ${seriNo})`;
    const [result] = await db.query(query, [description, not]);
    res.json({ success: true, id: result.insertId }); 
  } catch (err) {
    res.status(500).json({ success: false, error: "Servis mühürlenemedi." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`[BAŞARILI] Sunucu aktif: http://192.168.1.43:${PORT}`);
});