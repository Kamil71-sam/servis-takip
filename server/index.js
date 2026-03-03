const express = require('express');
const cors = require('cors');
const db = require('./db'); // Az önce yaptığımız db.js'i çağırıyoruz

const app = express();
app.use(cors());
app.use(express.json()); // Dashboard ve Mobil'den gelen veriyi anlaması için

// --- TEST ROTASI: Sistem çalışıyor mu? ---
app.get('/', (req, res) => {
  res.send('Kalandar Yazılım Teknik Servis Sunucusu Aktif! ana2 Zırhı Devrede.');
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

// --- YENİ SERVİS KAYDI (ana2 Kurumsal Kayıt Kapısı) ---
app.post('/api/yeni-servis', async (req, res) => {
  // Mobil formdan (YeniKayitFormu.tsx) gelen tüm paketleri açıyoruz
  const { 
    adSoyad, tel, email, adres, faks, 
    marka, model, seriNo, garanti, aksesuar, 
    gorunum, not, personel, randevuTarihi, randevuDurumu 
  } = req.body;

  try {
    // SQL sorgusunu yeni eklediğimiz kolonlara göre diziyoruz
    const query = `
      INSERT INTO service_jobs (
        firma_adi, customer_id, service_type, status,
        faks, marka, model, seri_no, 
        garanti_durumu, aksesuar_durumu, gorunum_detayi, 
        kullanici_notu, yonlendirilen_personel, randevu_tarihi, 
        randevu_durumu, gelis_tarihi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    // Verileri SQL raflarına sırasıyla yerleştiriyoruz
    const values = [
      adSoyad,           // Firma adı / Müşteri adı
      1,                 // Şimdilik varsayılan customer_id
      'Dükkan',          // Servis tipi
      'Cihaz Alındı',    // Başlangıç statüsü
      faks, 
      marka, 
      model, 
      seriNo, 
      garanti, 
      aksesuar, 
      gorunum, 
      not, 
      personel, 
      randevuTarihi || null, // Boşsa hata vermesin
      randevuDurumu || 'Beklemede'
    ];

    const [result] = await db.query(query, values);
    
    // result.insertId = SQL'in verdiği otomatik Takip Numarası
    res.json({ success: true, id: result.insertId }); 
  } catch (err) {
    console.error("SQL Hatası Müdür:", err.message);
    res.status(500).json({ error: "Kayıt mühürlenirken SQL motoru tekledi!" });
  }
});

// MOTORU ÇALIŞTIR (Port 5000 üzerinden)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Motor ${PORT} portunda gürlüyor kaptan! ana2 Zırhı kilitlendi.`);
});
