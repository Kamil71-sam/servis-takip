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
    res.status(500).json({ success: false, error: err.message });
  }
});



// [BÖLÜM 2] Kurumsal Firma Kaydı
app.post('/api/save-company', async (req, res) => {
  const { company_name, tax_number, authorized_person, phone_number } = req.body;
  
  try {
    const query = `
      INSERT INTO companies (company_name, tax_number, authorized_person, phone_number) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [company_name, tax_number, authorized_person, phone_number]);
    
    // Mobil tarafa 'success' ve yeni 'id' bilgisini gönderiyoruz
    res.status(200).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("Firma Kayıt Hatası:", err.message);
    res.status(500).json({ success: false, error: "Sunucu SQL hatası verdi." });
  }
});






// [BÖLÜM 3] Teknik Servis İş Emri Kaydı
app.post('/api/yeni-servis', async (req, res) => {
  const { marka, model, seriNo, not } = req.body;
  try {
    // FOREIGN KEY hatasını önlemek için mevcut olan ID'leri dinamik çeker
    const query = `
      INSERT INTO service_orders (
        customer_id, device_id, status_id, complaint, technician_note
      ) VALUES (
        (SELECT id FROM customers ORDER BY id ASC LIMIT 1), 
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