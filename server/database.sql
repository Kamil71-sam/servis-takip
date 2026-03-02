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



-- 6. Müşteriler Tablosu (Bireysel ve Kurumsal/Bayi ayrımıyla)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100),
    customer_type ENUM('Müşteri', 'Bayi') DEFAULT 'Müşteri',
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Cihazlar Tablosu (Müşteriye bağlı)
CREATE TABLE IF NOT EXISTS devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    brand VARCHAR(50) NOT NULL, -- Marka
    model VARCHAR(50) NOT NULL, -- Model
    serial_number VARCHAR(100), -- Seri No
    device_type VARCHAR(50), -- Telefon, Tablet, Laptop vb.
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);


-- 8. Servis Kayıtları (Projenin Ana Tablosu)
CREATE TABLE IF NOT EXISTS service_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    device_id INT,
    status_id INT DEFAULT 1, -- Varsayılan: Teslim Alındı
    complaint TEXT, -- Müşteri Şikayeti
    technician_note TEXT, -- Teknisyen Notu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (device_id) REFERENCES devices(id),
    FOREIGN KEY (status_id) REFERENCES service_statuses(id)
);

-- 9. Teklifler Tablosu (3 Gün Kuralı Burada İşleyecek)
CREATE TABLE IF NOT EXISTS offers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_order_id INT,
    price DECIMAL(10,2) NOT NULL,
    offer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expire_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL 3 DAY), -- 3 GÜN KURALI
    is_accepted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (service_order_id) REFERENCES service_orders(id) ON DELETE CASCADE
);