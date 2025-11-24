DROP TABLE IF EXISTS idempotency_keys;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price_cents INT NOT NULL CHECK (price_cents >= 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_sku (sku)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    status ENUM('CREATED', 'CONFIRMED', 'CANCELED') NOT NULL DEFAULT 'CREATED',
    total_cents INT NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    canceled_at TIMESTAMP NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    qty INT NOT NULL CHECK (qty > 0),
    unit_price_cents INT NOT NULL CHECK (unit_price_cents >= 0),
    subtotal_cents INT NOT NULL CHECK (subtotal_cents >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE idempotency_keys (
    `key` VARCHAR(255) PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    response_body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    INDEX idx_expires_at (expires_at),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==================== SEED DATA ====================

-- Insert sample customers
INSERT INTO customers (name, email, phone) VALUES
('ACME Corporation', 'ops@acme.com', '+1-555-0100'),
('TechStart Inc', 'contact@techstart.io', '+1-555-0101'),
('Global Traders LLC', 'sales@globaltraders.com', '+1-555-0102'),
('Innovation Labs', 'hello@innovationlabs.com', '+1-555-0103'),
('Enterprise Solutions', 'support@enterprisesolutions.com', '+1-555-0104');

-- Insert sample products
INSERT INTO products (sku, name, price_cents, stock) VALUES
('LAPTOP-PRO-15', 'Laptop Pro 15 inch', 129900, 50),
('LAPTOP-AIR-13', 'Laptop Air 13 inch', 89900, 75),
('MONITOR-4K-27', 'Monitor 4K 27 inch', 45900, 100),
('KEYBOARD-MECH', 'Mechanical Keyboard RGB', 15900, 200),
('MOUSE-WIRELESS', 'Wireless Mouse Ergonomic', 7900, 300),
('HEADSET-PRO', 'Professional Headset with Mic', 12900, 150),
('WEBCAM-HD', 'HD Webcam 1080p', 8900, 180),
('DOCK-USB-C', 'USB-C Docking Station', 25900, 80),
('CHAIR-ERGO', 'Ergonomic Office Chair', 39900, 60),
('DESK-STAND', 'Adjustable Standing Desk', 59900, 40);