-- ===================================================
-- PHASE 3 REFACTOR: MENU ITEM VARIANTS
-- ===================================================

-- 1. Alter menu_items to remove columns size, price, cost_price
ALTER TABLE menu_items DROP COLUMN price;
ALTER TABLE menu_items DROP COLUMN cost_price;
ALTER TABLE menu_items DROP COLUMN size;

-- 2. Create menu_item_variants table
CREATE TABLE menu_item_variants (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_item_id   BIGINT NOT NULL,
    size           ENUM('S', 'M', 'L') NOT NULL DEFAULT 'M',
    price          DECIMAL(12,0) NOT NULL,
    cost_price     DECIMAL(12,0) NOT NULL DEFAULT 0,
    is_available   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    UNIQUE KEY uk_menu_item_size (menu_item_id, size)
);

-- Indexing for performance
CREATE INDEX idx_menu_item_variants_item ON menu_item_variants(menu_item_id);

-- 3. Re-create recipe_ingredients table mapped to variants
DROP TABLE IF EXISTS recipe_ingredients;

CREATE TABLE recipe_ingredients (
    id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_item_variant_id  BIGINT NOT NULL,
    ingredient_id         BIGINT NOT NULL,
    quantity              DECIMAL(10,2) NOT NULL,
    created_at            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by            VARCHAR(100),
    updated_by            VARCHAR(100),
    FOREIGN KEY (menu_item_variant_id) REFERENCES menu_item_variants(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_recipe (menu_item_variant_id, ingredient_id)
);

-- Indexing for performance
CREATE INDEX idx_recipe_ingredients_variant ON recipe_ingredients(menu_item_variant_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);
