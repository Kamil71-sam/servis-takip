const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Güvenlik Vanası: Web ve Mobil'in bu API'ye ulaşmasına izin ver
app.use(cors());

// Gelen verileri (JSON) okuyabilmek için filtre
app.use(express.json());

// --- İLK BORU HATTI (Giriş Kapısı) ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    
    console.log(`Biri kapıyı çalıyor! Gelen E-Posta: ${email}`);

    // Şimdilik sahte bir kontrol yapıyoruz (İleride SQL veri tabanına bağlanacak)
    if (email === 'admin@kalandar.com' && password === '123456') {
        res.json({ success: true, message: 'Hoş geldin Müdür, kapı açıldı!' });
    } else {
        res.status(401).json({ success: false, message: 'Yanlış şifre veya e-posta. Giremezsin!' });
    }
});

// Motoru Ateşle
app.listen(PORT, () => {
    console.log(`🔥 KALANDAR API MOTORU ÇALIŞIYOR! (Port: ${PORT})`);
});