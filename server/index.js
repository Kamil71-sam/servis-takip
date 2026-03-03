const express = require('express');
const cors = require('cors');
const db = require('./db'); // Az önce yaptığımız db.js'i çağırıyoruz

const app = express();
app.use(cors());
app.use(express.json()); // Dashboard'dan gelen veriyi anlaması için

// --- TEST ROTASI: Sistem çalışıyor mu? ---
app.get('/', (req, res) => {
  res.send('Kalandar Yazılım Teknik Servis Sunucusu Aktif!');
});

// --- STOK TAKİBİ: Kritik stokları Dashboard'a yollar ---
app.get('/api/stok-ikaz', async (req, res) => {
  try {
    // Senin istediğin o 2cm+3mm yukarıdaki barı besleyecek veri
    const [rows] = await db.query('SELECT * FROM inventory WHERE stock_count <= critical_limit');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- RANDEVU OLUŞTUR: Resepsiyonist kayıt açtığında burası çalışır ---
app.post('/api/yeni-servis', async (req, res) => {
  const { customer_id, expert_id, type } = req.body; // Ev, İş veya Dükkan
  try {
    const [result] = await db.query(
      'INSERT INTO service_jobs (customer_id, assigned_expert_id, service_type) VALUES (?, ?, ?)',
      [customer_id, expert_id, type]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MOTORU ÇALIŞTIR (Port 5000 üzerinden)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Motor ${PORT} portunda gürlüyor kaptan!`);
});