-- ===================================================
-- PHASE 7: AI MARKETING ASSISTANT MODULE
-- ===================================================

CREATE TABLE promotions (
    id                BIGINT PRIMARY KEY AUTO_INCREMENT,
    name              VARCHAR(255) NOT NULL,
    description       TEXT,
    type              VARCHAR(50) NOT NULL, -- PERCENT, FIXED_AMOUNT, BUY_X_GET_Y, FREE_TOPPING
    value             DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    min_order_value   DECIMAL(12,2) DEFAULT 0.00,
    max_discount      DECIMAL(12,2),
    applicable_items  TEXT, -- Store JSON list of variant IDs or menu item IDs
    start_date        TIMESTAMP NULL,
    end_date          TIMESTAMP NULL,
    usage_limit       INT,
    used_count        INT NOT NULL DEFAULT 0,
    is_active         BOOLEAN NOT NULL DEFAULT TRUE,
    is_ai_suggested   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by        VARCHAR(100),
    updated_by        VARCHAR(100)
);

-- Indexing for speed
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);

-- Link orders.promotion_id column to promotions.id
ALTER TABLE orders ADD CONSTRAINT fk_orders_promotion FOREIGN KEY (promotion_id) REFERENCES promotions(id) ON DELETE SET NULL;
