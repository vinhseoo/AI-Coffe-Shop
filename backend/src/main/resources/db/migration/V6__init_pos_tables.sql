-- ===================================================
-- PHASE 4: POS MODULE — ORDERS, ITEMS & TOPPINGS
-- ===================================================

CREATE TABLE orders (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code      VARCHAR(50) NOT NULL UNIQUE,
    order_type      VARCHAR(20) NOT NULL, -- DINE_IN, TAKEAWAY, ONLINE
    status          VARCHAR(20) NOT NULL, -- PENDING, PREPARING, COMPLETED, CANCELLED
    table_number    VARCHAR(50),
    subtotal        DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount    DECIMAL(12,2) NOT NULL,
    payment_method  VARCHAR(20), -- CASH, TRANSFER, MOMO, ZALOPAY
    payment_status  VARCHAR(20) NOT NULL, -- UNPAID, PAID
    note            TEXT,
    promotion_id    BIGINT,
    customer_id     BIGINT,
    completed_at    TIMESTAMP NULL,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by      VARCHAR(100),
    updated_by      VARCHAR(100)
);

CREATE TABLE order_items (
    id                      BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id                BIGINT NOT NULL,
    menu_item_variant_id    BIGINT NOT NULL,
    quantity                INT NOT NULL,
    unit_price              DECIMAL(12,2) NOT NULL,
    subtotal                DECIMAL(12,2) NOT NULL,
    note                    VARCHAR(500),
    created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by              VARCHAR(100),
    updated_by              VARCHAR(100),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_variant_id) REFERENCES menu_item_variants(id)
);

CREATE TABLE order_item_toppings (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_item_id  BIGINT NOT NULL,
    topping_id     BIGINT NOT NULL,
    quantity       INT NOT NULL DEFAULT 1,
    unit_price     DECIMAL(12,2) NOT NULL,
    subtotal       DECIMAL(12,2) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (topping_id) REFERENCES toppings(id)
);

-- Indexing for lookup speed
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_item_toppings_item ON order_item_toppings(order_item_id);
