-- ===================================================
-- PHASE 1: AUTH & SETTINGS
-- users + shop_settings
-- ===================================================

CREATE TABLE users (
    id            BIGINT PRIMARY KEY AUTO_INCREMENT,
    username      VARCHAR(50) UNIQUE NOT NULL,
    email         VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(100),
    phone         VARCHAR(20),
    avatar_url    VARCHAR(500),
    role          ENUM('OWNER', 'STAFF') NOT NULL DEFAULT 'OWNER',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by    VARCHAR(100),
    updated_by    VARCHAR(100)
);

CREATE TABLE shop_settings (
    id               BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id          BIGINT UNIQUE NOT NULL,
    shop_name        VARCHAR(200) NOT NULL,
    address          VARCHAR(500),
    phone            VARCHAR(20),
    opening_time     TIME DEFAULT '07:00:00',
    closing_time     TIME DEFAULT '22:00:00',
    logo_url         VARCHAR(500),
    description      TEXT,
    wifi_password    VARCHAR(100),
    social_facebook  VARCHAR(300),
    social_instagram VARCHAR(300),
    currency         VARCHAR(10) NOT NULL DEFAULT 'VND',
    tax_rate         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by       VARCHAR(100),
    updated_by       VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
