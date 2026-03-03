const express = require('express');
const cors = require('cors');
const db = require('./db'); // Az önce oluşturduğun köprüyü bağladık

const app = express();
const PORT = 5000;

// Middleware (Ara Yazılımlar)
app.use(cors());
app.use(express.json());

// Basit bir test rotası (API çalışıyor mu kontrolü)
app.get('/', (req, res) => {
  res.send('Teknik Servis Takip Sistemi API - ÇALIŞIYOR');
});

// TÜM MÜŞTERİLERİ GETİR (API Testi)
app.get('/api/customers', (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});


// YENİ MÜŞTERİ EKLE (POST)
app.post('/api/customers', (req, res) => {
  const { first_name, last_name, phone, email, customer_type, address } = req.body;
  const query = 'INSERT INTO customers (first_name, last_name, phone, email, customer_type, address) VALUES (?, ?, ?, ?, ?, ?)';
  
  db.query(query, [first_name, last_name, phone, email, customer_type, address], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Müşteri başarıyla eklendi!', id: result.insertId });
  });
});







// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde yola çıktı!`);
});