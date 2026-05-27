-- ===================================================
-- PHASE 6: CUSTOMER & LOYALTY MODULE
-- ===================================================

CREATE TABLE customers (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) NOT NULL UNIQUE,
    email           VARCHAR(100),
    birthday        DATE,
    total_orders    INT NOT NULL DEFAULT 0,
    total_spent     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    loyalty_points  INT NOT NULL DEFAULT 0,
    tier            VARCHAR(20) NOT NULL DEFAULT 'NORMAL', -- NORMAL, SILVER, GOLD, PLATINUM
    note            TEXT,
    last_visit_at   TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE TABLE loyalty_transactions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id     BIGINT NOT NULL,
    order_id        BIGINT,
    points          INT NOT NULL,
    action          VARCHAR(20) NOT NULL, -- EARN, REDEEM, BONUS, EXPIRE
    description     VARCHAR(500),
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

-- Indexing for speed
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_tier ON customers(tier);
CREATE INDEX idx_loyalty_transactions_customer ON loyalty_transactions(customer_id);

-- Alter orders table to add foreign key to customers
ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
