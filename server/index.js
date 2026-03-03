const express = require('express');
const cors = require('cors');
const db = require('./db'); // Veritabanı bağlantısı

const app = express();
app.use(cors());
app.use(express.json());

// --- YENİ SERVİS KAYDI (Müdürün Geniş Formu) ---
app.post('/api/yeni-servis', async (req, res) => {
  // Mobil uygulamadan gelen tüm paketleri burada karşılıyoruz
  const { 
    adSoyad, tel, email, adres, faks, 
    marka, model, seriNo, garanti, aksesuar, 
    gorunum, not, personel, randevuTarihi, randevuDurumu 
  } = req.body;

  try {
    // SQL'deki o yeni açtığımız raflara (kolonlara) verileri diziyoruz
    const query = `
      INSERT INTO service_jobs (
        firma_adi, customer_id, service_type, status,
        faks, marka, model, seri_no, 
        garanti_durumu, aksesuar_durumu, gorunum_detayi, 
        kullanici_notu, yonlendirilen_personel, randevu_tarihi, 
        randevu_durumu, gelis_tarihi
      ) VALUES (?, 1, 'Dükkan', 'Cihaz Alındı', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;

    const values = [
      adSoyad, faks, marka, model, seriNo, 
      garanti, aksesuar, gorunum, 
      not, personel, randevuTarihi || null, 
      randevuDurumu || 'Beklemede'
    ];

    const [result] = await db.query(query, values);
    
    // SQL'in otomatik verdiği 'id' artık bizim 'Takip No'muz oluyor
    res.json({ success: true, id: result.insertId }); 
  } catch (err) {
    console.error("SQL Hatası:", err.message);
    res.status(500).json({ error: "Kayıt mühürlenemedi!" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Motor ${PORT} portunda gürlüyor kaptan!`);
});