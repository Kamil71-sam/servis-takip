-- Veritabanını sıfırdan oluştur
DROP DATABASE IF EXISTS servis_takip_db;
CREATE DATABASE servis_takip_db;
USE servis_takip_db;

-- Kullanıcılar (4 Rol: Admin, Resepsiyon, Teknisyen, Müşteri)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('Admin', 'User', 'Technician', 'Customer') NOT NULL,
    pincode VARCHAR(6) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İlk Admin Kaydı
INSERT INTO users (name, email, role, pincode) 
VALUES ('Kemal', 'kemal@servis.com', 'Admin', '123456');

-- Servis Durumları (12 Kritik Aşama)
CREATE TABLE service_statuses (
    id INT PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL
);

INSERT INTO service_statuses (id, status_name) VALUES
(1, 'Teslim Alındı'), (2, 'İncelemede'), (3, 'Teklif Hazır'),
(4, 'Onay Bekliyor'), (5, 'Onaylandı'), (6, 'Tamirde'),
(7, 'Parça Bekliyor'), (8, 'Hazır'), (9, 'Teslim Edilecek'),
(10, 'Teslim Edildi'), (11, 'Onay Verilmedi'), (12, 'İadeye Düştü');