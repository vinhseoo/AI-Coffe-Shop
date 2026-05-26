-- ===================================================
-- PHASE 5: INVENTORY MANAGEMENT — INVENTORY LOGS
-- ===================================================

CREATE TABLE inventory_logs (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id  BIGINT NOT NULL,
    action         ENUM('IMPORT', 'EXPORT', 'ADJUST', 'AUTO_DEDUCT') NOT NULL,
    quantity       DECIMAL(12,2) NOT NULL,
    unit_cost      DECIMAL(12,2) DEFAULT 0.00,
    total_cost     DECIMAL(12,2) DEFAULT 0.00,
    note           TEXT,
    reference_id   BIGINT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT
);

-- Indexing for performance
CREATE INDEX idx_inventory_logs_ingredient ON inventory_logs(ingredient_id);
CREATE INDEX idx_inventory_logs_action ON inventory_logs(action);
CREATE INDEX idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX idx_inventory_logs_ingredient_created ON inventory_logs(ingredient_id, created_at);
