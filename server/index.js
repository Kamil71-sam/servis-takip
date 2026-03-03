const express = require('express');
const cors = require('cors');
const db = require('./db'); // Veritabanı bağlantısı (db.js dosyandan geliyor)

const app = express();
app.use(cors());
app.use(express.json()); // Mobil formdan gelen JSON paketini anlaması için şart

// --- TEST ROTASI: Motor çalışıyor mu? ---
app.get('/', (req, res) => {
  res.send('Kalandar Yazılım Teknik Servis Sunucusu Aktif! FORM1 Mühürlü.');
});

// --- YENİ SERVİS KAYDI (Müdürün FORM1 Taslağı) ---
app.post('/api/yeni-servis', async (req, res) => {
  // Mobil uygulamadan gelen tüm FORM1 verilerini burada karşılıyoruz
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

    // Verileri SQL kolon sırasına göre mühürlüyoruz
    const values = [
      adSoyad,      // firma_adi kolonuna gider
      faks,         // faks kolonuna gider
      marka,        // marka kolonuna gider
      model,        // model kolonuna gider
      seriNo,       // seri_no kolonuna gider
      garanti || 'Garantisiz', 
      aksesuar,     // aksesuar_durumu kolonuna gider
      gorunum,      // gorunum_detayi kolonuna gider
      not,          // kullanici_notu kolonuna gider
      personel,     // yonlendirilen_personel kolonuna gider
      randevuTarihi || null, 
      randevuDurumu || 'Beklemede'
    ];

    // Sorguyu mutfağa (SQL) gönderiyoruz
    const [result] = await db.query(query, values);
    
    // SQL'in otomatik verdiği 'id' artık bizim 'Takip No'muz oluyor
    // Mobil tarafa "İşlem Başarılı" ve "Numaran Budur" mesajını uçuruyoruz
    res.json({ 
      success: true, 
      id: result.insertId // İşte o beklediğimiz Takip Numarası!
    }); 

  } catch (err) {
    console.error("SQL Hatası Müdür:", err.message);
    res.status(500).json({ success: false, error: "Kayıt mühürlenemedi!" });
  }
});

// MOTORU ATEŞLE (Port 5000 üzerinden)
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Motor ${PORT} portunda gürlüyor kaptan! FORM1 mühürlendi.`);
});