const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Bağlantı Ayarları
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // XAMPP varsayılan kullanıcı
    password: '',      // XAMPP varsayılan şifre boştur
    database: 'servis-takip'
});

// Veritabanına Bağlan
db.connect((err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu bro: ', err);
        return;
    }
    console.log('MySQL Veritabanına başarıyla bağlandık, yolumuz açık olsun!');
});

// Test Rotası (Tarayıcıdan kontrol etmek için)
app.get('/', (req, res) => {
    res.send('Teknik Servis API Sistemi Çalışıyor!');
});

const PORT = 5000;


// GİRİŞ (LOGIN) API'Sİ
app.post('/api/login', (req, res) => {
    const { pincode } = req.body; // Mobilden gelen 6 haneli pin

    // Veritabanında pin kodunu kontrol et
    const sql = "SELECT id, name, role FROM users WHERE pincode = ?";
    
    db.query(sql, [pincode], (err, results) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Sunucu hatası!" });
        }

        if (results.length > 0) {
            // Pin doğru, kullanıcıyı bulduk
            res.json({
                success: true,
                message: "Giriş başarılı!",
                user: results[0] // id, name ve role (Admin/Technician vb.) bilgilerini döner
            });
        } else {
            // Pin yanlış
            res.status(401).json({
                success: false,
                message: "Hatalı pin kodu girdin bro!"
            });
        }
    });
});



// YENİ SERVİS KAYDI OLUŞTURMA (İŞ EMRİ)
app.post('/api/service-orders', (req, res) => {
    const { customer_name, customer_phone, device_model, complaint, barcode_no } = req.body;

    const sql = `INSERT INTO service_orders 
                (customer_name, customer_phone, device_model, complaint, barcode_no) 
                VALUES (?, ?, ?, ?, ?)`;

    const values = [customer_name, customer_phone, device_model, complaint, barcode_no];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Kayıt hatası bro: ", err);
            return res.status(500).json({ success: false, message: "Kayıt oluşturulamadı!" });
        }
        res.json({ 
            success: true, 
            message: "Servis kaydı başarıyla oluşturuldu kadasını aldığım!",
            orderId: result.insertId 
        });
    });
});






// YENİ SERVİS KAYDI (İŞ EMRİ) OLUŞTURMA
app.post('/api/service-orders', (req, res) => {
    // Mobilden gelecek veriler: Müşteri adı, tel, cihaz modeli, şikayet ve barkod
    const { customer_name, customer_phone, device_model, complaint, barcode_no } = req.body;

    const sql = `INSERT INTO service_orders 
                (customer_name, customer_phone, device_model, complaint, barcode_no) 
                VALUES (?, ?, ?, ?, ?)`;

    const values = [customer_name, customer_phone, device_model, complaint, barcode_no];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Kayıt hatası bro: ", err);
            return res.status(500).json({ success: false, message: "Kayıt oluşturulamadı!" });
        }
        
        res.json({ 
            success: true, 
            message: "Servis kaydı başarıyla oluşturuldu kadasını aldığım!",
            orderId: result.insertId // MySQL'in otomatik verdiği benzersiz ID
        });
    });
});








app.listen(PORT, () => {
    console.log(`Sunucumuz ${PORT} portunda hazır ve nazır.`);
});