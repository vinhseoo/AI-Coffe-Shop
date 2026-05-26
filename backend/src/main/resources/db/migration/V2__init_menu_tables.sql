
-- ===================================================
-- PHASE 3: MENU MANAGEMENT
-- categories, menu_items, toppings, suppliers, ingredients, recipe_ingredients
-- ===================================================

-- 1. categories
CREATE TABLE categories (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    name           VARCHAR(100) NOT NULL,
    description    VARCHAR(500),
    icon           VARCHAR(50),
    display_order  INT DEFAULT 0,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100)
);

-- 2. toppings
CREATE TABLE toppings (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    name           VARCHAR(100) NOT NULL,
    price          DECIMAL(12,0) NOT NULL,
    is_available   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100)
);

-- 3. suppliers
CREATE TABLE suppliers (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    name           VARCHAR(200) NOT NULL,
    phone          VARCHAR(20),
    email          VARCHAR(100),
    address        VARCHAR(500),
    note           TEXT,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100)
);

-- 4. ingredients
CREATE TABLE ingredients (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    name           VARCHAR(200) NOT NULL,
    unit           VARCHAR(50) NOT NULL,
    current_stock  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    min_stock      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    unit_cost      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    supplier_id    BIGINT,
    expiry_days    INT,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
);

-- 5. menu_items
CREATE TABLE menu_items (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id    BIGINT NOT NULL,
    name           VARCHAR(200) NOT NULL,
    description    TEXT,
    price          DECIMAL(12,0) NOT NULL,
    cost_price     DECIMAL(12,0) NOT NULL DEFAULT 0,
    image_url      VARCHAR(500),
    size           ENUM('S', 'M', 'L') NOT NULL DEFAULT 'M',
    is_available   BOOLEAN NOT NULL DEFAULT TRUE,
    is_bestseller  BOOLEAN NOT NULL DEFAULT FALSE,
    total_sold     INT NOT NULL DEFAULT 0,
    display_order  INT DEFAULT 0,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- 6. recipe_ingredients (junction table)
CREATE TABLE recipe_ingredients (
    id             BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_item_id   BIGINT NOT NULL,
    ingredient_id  BIGINT NOT NULL,
    quantity       DECIMAL(10,2) NOT NULL,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by     VARCHAR(100),
    updated_by     VARCHAR(100),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_recipe (menu_item_id, ingredient_id)
);

-- Indexing for performance
CREATE INDEX idx_menu_items_category ON menu_items(category_id);
CREATE INDEX idx_recipe_ingredients_menu ON recipe_ingredients(menu_item_id);
CREATE INDEX idx_recipe_ingredients_ingredient ON recipe_ingredients(ingredient_id);

-- ===================================================
-- SEED DATA (CATEGORIES & DEFAULT SUPPLIER & INGREDIENTS)
-- ===================================================

-- Seed Categories
INSERT INTO categories (name, description, icon, display_order, is_active, created_by, updated_by) VALUES
('Cà phê', 'Các món cà phê truyền thống và hiện đại', 'Coffee', 1, TRUE, 'system', 'system'),
('Trà', 'Trà trái cây, trà sữa và trà mộc', 'CupSoda', 2, TRUE, 'system', 'system'),
('Đá xay', 'Các món sinh tố và đá xay mát lạnh', 'IceCream', 3, TRUE, 'system', 'system'),
('Nước ép', 'Nước ép trái cây tươi nguyên chất', 'Cherry', 4, TRUE, 'system', 'system'),
('Bánh ngọt', 'Bánh kem, Croissant và bánh ngọt ăn kèm', 'Cake', 5, TRUE, 'system', 'system');

-- Seed Default Supplier
INSERT INTO suppliers (name, phone, email, address, note, created_by, updated_by) VALUES
('Kho Tổng Hợp CaféAI', '0987654321', 'contact@cafeai.com', '123 Đường Cà Phê, Quận 1, TP. HCM', 'Nhà cung cấp nguyên vật liệu mặc định cho hệ thống', 'system', 'system');

-- Seed Ingredients (linked to Supplier id = 1)
INSERT INTO ingredients (name, unit, current_stock, min_stock, unit_cost, supplier_id, expiry_days, is_active, created_by, updated_by) VALUES
('Hạt Cà phê Robusta', 'g', 10000.00, 1000.00, 150.00, 1, 180, TRUE, 'system', 'system'),
('Hạt Cà phê Arabica', 'g', 5000.00, 500.00, 300.00, 1, 180, TRUE, 'system', 'system'),
('Sữa đặc có đường', 'ml', 4000.00, 500.00, 80.00, 1, 90, TRUE, 'system', 'system'),
('Trà đen Lộc Phát', 'g', 2000.00, 200.00, 120.00, 1, 360, TRUE, 'system', 'system'),
('Bột Matcha Nhật Bản', 'g', 1000.00, 100.00, 800.00, 1, 270, TRUE, 'system', 'system'),
('Sữa tươi không đường Barista', 'ml', 10000.00, 1000.00, 30.00, 1, 10, TRUE, 'system', 'system'),
('Đường cát trắng', 'g', 10000.00, 1000.00, 20.00, 1, 360, TRUE, 'system', 'system'),
('Đá viên tinh khiết', 'g', 50000.00, 5000.00, 2.00, 1, 2, TRUE, 'system', 'system'),
('Bột béo thực vật', 'g', 3000.00, 300.00, 90.00, 1, 360, TRUE, 'system', 'system'),
('Siro Đường đen', 'ml', 2000.00, 200.00, 150.00, 1, 180, TRUE, 'system', 'system'),
('Kem whipping cream', 'ml', 3000.00, 300.00, 180.00, 1, 30, TRUE, 'system', 'system');
