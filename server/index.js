const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

/**
 * [BÖLÜM 1] Bireysel Müşteri Kaydı
 * Ad ve Soyadı SQL'deki first_name ve last_name sütunlarına ayırır.
 */
app.post('/api/yeni-musteri', async (req, res) => {
  const { full_name, phone_number, email, address } = req.body;
  
  // İsmi boşluktan bölerek ilk ismi ve geri kalanını (soyadı) ayırır
  const nameParts = (full_name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    const query = `
      INSERT INTO customers (first_name, last_name, phone, email, address, customer_type) 
      VALUES (?, ?, ?, ?, ?, 'Müşteri')
    `;
    const [result] = await db.query(query, [firstName, lastName, phone_number, email, address]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Müşteri Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * [BÖLÜM 2] Kurumsal Firma Kaydı
 * DİKKAT: Mobil taraftaki state isimlerini (firmaAdi, vergiNo vb.) karşılar.
 */
app.post('/api/save-company', async (req, res) => {
  // YeniFirmaFormu.tsx içindeki state isimleriyle tam uyum sağlandı.
  const { firmaAdi, vergiNo, yetkili, telefon } = req.body;
  
  try {
    const query = `
      INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) 
      VALUES (?, ?, ?, ?)
    `;
    // Gelen verileri SQL tablosundaki sütunlara (company_name, tax_number vb.) mühürler
    const [result] = await db.query(query, [firmaAdi, vergiNo, yetkili, telefon]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Firma Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "Firma kaydı veritabanına işlenemedi." });
  }
});

/**
 * [BÖLÜM 3] Teknik Servis İş Emri Kaydı
 * Foreign key hatalarını önlemek için dinamik ID çekme yapısı
 */
app.post('/api/yeni-servis', async (req, res) => {
  const { marka, model, seriNo, not } = req.body;
  try {
    const query = `
      INSERT INTO service_orders (
        customer_id, device_id, status_id, complaint, technician_note
      ) VALUES (
        (SELECT id FROM customers ORDER BY id DESC LIMIT 1), 
        (SELECT id FROM devices ORDER BY id ASC LIMIT 1), 
        (SELECT id FROM service_statuses ORDER BY id ASC LIMIT 1), 
        ?, ?
      )
    `;
    const fullDescription = `${marka || ''} ${model || ''} (SN: ${seriNo || ''})`.trim();
    const [result] = await db.query(query, [fullDescription, not || 'Not yok']);
    res.json({ success: true, id: result.insertId }); 
  } catch (err) {
    console.error("Servis İş Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "Veritabanı ilişki hatası." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Sunucu aktif: http://192.168.1.43:${PORT}`);
});