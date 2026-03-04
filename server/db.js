const mysql = require('mysql2');

// Veritabanı bağlantı ayarları
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      // Genelde root olur
  password: '',      // Şifren varsa buraya yaz
  database: 'teknik_takip_db', // Veritabanı adın
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();