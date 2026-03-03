const mysql = require('mysql2');

// MySQL Bağlantı Ayarları (XAMPP Varsayılan)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // XAMPP'ta genelde boştur
  database: 'servis_takip_db'
});

connection.connect(error => {
  if (error) {
    console.error('Veritabanına bağlanırken hata oluştu: ' + error.stack);
    return;
  }
  console.log('Veritabanına başarıyla bağlanıldı! Bağlantı ID: ' + connection.threadId);
});

module.exports = connection;