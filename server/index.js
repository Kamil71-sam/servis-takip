const express = require('express');
const cors = require('cors');
const db = require('./db'); 

const app = express();
app.use(cors());
app.use(express.json());

// [BÖLÜM 1] Bireysel Müşteri Kaydı
app.post('/api/yeni-musteri', async (req, res) => {
  const { full_name, phone_number, email, address } = req.body;
  try {
    const query = `INSERT INTO customers (full_name, phone_number, email, address) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [full_name, phone_number, email, address]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Müşteri Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "Müşteri kayıt hatası." });
  }
});

// [BÖLÜM 2] Kurumsal Firma Kaydı
app.post('/api/save-company', async (req, res) => {
  const { company_name, tax_number, authorized_person, phone_number } = req.body;
  try {
    const query = `INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) VALUES (?, ?, ?, ?)`;
    const [result] = await db.query(query, [company_name, tax_number, authorized_person, phone_number]);
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Firma Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "Firma kayıt hatası." });
  }
});

// [BÖLÜM 3] Teknik Servis İş Emri Kaydı (Hata Giderilmiş)
app.post('/api/yeni-servis', async (req, res) => {
  const { marka, model, seriNo, not } = req.body;
  try {
    /** * KRİTİK DÜZELTME: Foreign key hatasını önlemek için 
     * veritabanındaki mevcut olan customer_id ve device_id kullanılmalıdır.
     */
    const query = `
      INSERT INTO service_orders (
        customer_id, device_id, status_id, complaint, technician_note
      ) VALUES (
        (SELECT id FROM customers LIMIT 1), 
        (SELECT id FROM devices LIMIT 1), 
        (SELECT id FROM service_statuses LIMIT 1), 
        ?, ?
      )
    `;
    
    const fullDescription = `${marka} ${model} (Seri No: ${seriNo})`;
    const [result] = await db.query(query, [fullDescription, not]);
    
    res.json({ success: true, id: result.insertId }); 
  } catch (err) {
    // Terminalde hatayı detaylı görmek için
    console.error("Servis İş Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "Veritabanı ilişki hatası. Lütfen önce müşteri ve cihaz ekleyin." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portu üzerinden aktif edildi.`);
});