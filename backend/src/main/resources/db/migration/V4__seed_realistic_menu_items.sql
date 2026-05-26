-- ===================================================
-- SEED DATA: ADDITIONAL INGREDIENTS
-- ===================================================
INSERT INTO ingredients (name, unit, current_stock, min_stock, unit_cost, supplier_id, expiry_days, is_active, created_by, updated_by) VALUES
('Siro Đào Tessire', 'ml', 3000.00, 300.00, 200.00, 1, 180, TRUE, 'system', 'system'),
('Đào miếng đóng hộp', 'g', 5000.00, 500.00, 150.00, 1, 360, TRUE, 'system', 'system'),
('Siro Vải Tessire', 'ml', 3000.00, 300.00, 200.00, 1, 180, TRUE, 'system', 'system'),
('Quả vải đóng hộp', 'g', 5000.00, 500.00, 150.00, 1, 360, TRUE, 'system', 'system'),
('Sả cây tươi', 'g', 2000.00, 200.00, 50.00, 1, 7, TRUE, 'system', 'system'),
('Cam vàng Mỹ', 'g', 10000.00, 1000.00, 80.00, 1, 14, TRUE, 'system', 'system'),
('Dứa tươi', 'g', 5000.00, 500.00, 30.00, 1, 5, TRUE, 'system', 'system'),
('Dưa hấu Long An', 'g', 15000.00, 1500.00, 20.00, 1, 7, TRUE, 'system', 'system'),
('Bột Cacao Premium', 'g', 2000.00, 200.00, 400.00, 1, 180, TRUE, 'system', 'system'),
('Kem phô mai muối biển', 'ml', 2000.00, 200.00, 120.00, 1, 15, TRUE, 'system', 'system'),
('Bơ lạt Anchor', 'g', 3000.00, 300.00, 250.00, 1, 90, TRUE, 'system', 'system'),
('Phô mai Mascarpone', 'g', 2000.00, 200.00, 350.00, 1, 30, TRUE, 'system', 'system'),
('Bột mì đa dụng', 'g', 10000.00, 1000.00, 25.00, 1, 180, TRUE, 'system', 'system'),
('Trà lài thượng hạng', 'g', 2000.00, 200.00, 180.00, 1, 360, TRUE, 'system', 'system');

-- ===================================================
-- SEED DATA: DETAILED REALISTIC MENU ITEMS
-- ===================================================

-- Category 1: Cà phê (ID 1)
-- 1. Cà phê Đen Đá
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (1, 'Cà phê Đen Đá', 'Cà phê phin truyền thống đậm đặc pha với đá viên tinh khiết.', null, TRUE, FALSE, 120, 1, 'system', 'system');
SET @id_den_da = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_den_da, 'S', 25000, 4040, TRUE, 'system', 'system'),
(@id_den_da, 'M', 29000, 5100, TRUE, 'system', 'system'),
(@id_den_da, 'L', 35000, 7550, TRUE, 'system', 'system');

-- 2. Cà phê Sữa Đá
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (1, 'Cà phê Sữa Đá', 'Sự kết hợp hoàn hảo giữa cà phê Robusta đậm đà và sữa đặc có đường béo ngậy.', null, TRUE, TRUE, 340, 2, 'system', 'system');
SET @id_sua_da = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_sua_da, 'S', 29000, 6240, TRUE, 'system', 'system'),
(@id_sua_da, 'M', 35000, 8000, TRUE, 'system', 'system'),
(@id_sua_da, 'L', 39000, 11150, TRUE, 'system', 'system');

-- 3. Bạc Xỉu
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (1, 'Bạc Xỉu', 'Nhiều sữa tươi, một ít sữa đặc và cà phê, hương vị nhẹ nhàng dễ uống phù hợp cho mọi lứa tuổi.', null, TRUE, TRUE, 290, 3, 'system', 'system');
SET @id_bac_xiu = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_bac_xiu, 'S', 29000, 6100, TRUE, 'system', 'system'),
(@id_bac_xiu, 'M', 35000, 7950, TRUE, 'system', 'system'),
(@id_bac_xiu, 'L', 39000, 10500, TRUE, 'system', 'system');

-- 4. Cà phê Muối
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (1, 'Cà phê Muối', 'Lớp kem muối béo ngậy mặn mặn hòa quyện cùng cà phê phin đậm đà tạo nên hương vị độc đáo khó quên.', null, TRUE, TRUE, 410, 4, 'system', 'system');
SET @id_cafe_muoi = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_cafe_muoi, 'M', 39000, 11600, TRUE, 'system', 'system'),
(@id_cafe_muoi, 'L', 45000, 14200, TRUE, 'system', 'system');

-- 5. Cà phê Latte
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (1, 'Cà phê Latte', 'Sự kết hợp nhẹ nhàng của espresso hảo hạng từ hạt Arabica và sữa tươi đánh bọt mịn màng.', null, TRUE, FALSE, 85, 5, 'system', 'system');
SET @id_cafe_latte = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_cafe_latte, 'M', 45000, 10100, TRUE, 'system', 'system'),
(@id_cafe_latte, 'L', 55000, 13200, TRUE, 'system', 'system');

-- 6. Cà phê Cappuccino
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (1, 'Cà phê Cappuccino', 'Espresso thơm ngon hòa cùng sữa tươi đánh bọt dày mịn, rắc thêm chút bột ca cao hảo hạng lên bề mặt.', null, TRUE, FALSE, 90, 6, 'system', 'system');
SET @id_cafe_capu = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_cafe_capu, 'M', 45000, 10700, TRUE, 'system', 'system'),
(@id_cafe_capu, 'L', 55000, 13800, TRUE, 'system', 'system');


-- Category 2: Trà (ID 2)
-- 7. Trà Đào Cam Sả
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (2, 'Trà Đào Cam Sả', 'Vị trà đen thanh mát kết hợp với vị ngọt đào mọng nước, hương sả nồng nàn và chua nhẹ của cam tươi.', null, TRUE, TRUE, 380, 1, 'system', 'system');
SET @id_tra_dao = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_tra_dao, 'M', 39000, 15700, TRUE, 'system', 'system'),
(@id_tra_dao, 'L', 45000, 19200, TRUE, 'system', 'system');

-- 8. Trà Vải Lài
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (2, 'Trà Vải Lài', 'Hương lài thanh khiết nhẹ nhàng hòa quyện cùng quả vải chín mọng ngọt ngào và mát lạnh.', null, TRUE, FALSE, 140, 2, 'system', 'system');
SET @id_tra_vai = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_tra_vai, 'M', 39000, 11500, TRUE, 'system', 'system'),
(@id_tra_vai, 'L', 45000, 14500, TRUE, 'system', 'system');

-- 9. Trà Sữa Trân Châu Đường Đen
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (2, 'Trà Sữa Trân Châu Đường Đen', 'Trà sữa truyền thống đậm vị trà cùng trân châu dai giòn ngâm siro đường đen ngọt lịm hấp dẫn.', null, TRUE, TRUE, 420, 3, 'system', 'system');
SET @id_tra_sua_tc = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_tra_sua_tc, 'M', 45000, 8610, TRUE, 'system', 'system'),
(@id_tra_sua_tc, 'L', 50000, 11200, TRUE, 'system', 'system');

-- 10. Trà Xanh Matcha Sữa
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (2, 'Trà Xanh Matcha Sữa', 'Bột matcha Nhật Bản nguyên chất hòa quyện cùng sữa tươi béo ngậy tốt cho sức khỏe.', null, TRUE, FALSE, 110, 4, 'system', 'system');
SET @id_matcha_sua = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_matcha_sua, 'M', 45000, 9100, TRUE, 'system', 'system'),
(@id_matcha_sua, 'L', 55000, 12500, TRUE, 'system', 'system');


-- Category 3: Đá xay (ID 3)
-- 11. Cà phê Đá Xay
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (3, 'Cà phê Đá Xay', 'Cà phê espresso xay mịn cùng sữa tươi, đá viên và siro caramel béo ngậy, phủ kem whipped béo mịn.', null, TRUE, TRUE, 220, 1, 'system', 'system');
SET @id_cafe_xay = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_cafe_xay, 'M', 49000, 13300, TRUE, 'system', 'system'),
(@id_cafe_xay, 'L', 55000, 16800, TRUE, 'system', 'system');

-- 12. Matcha Đá Xay
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (3, 'Matcha Đá Xay', 'Bột matcha Nhật Bản cao cấp xay mịn với sữa và đá viên, phủ lớp kem tươi mịn màng ngọt ngào.', null, TRUE, TRUE, 195, 2, 'system', 'system');
SET @id_matcha_xay = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_matcha_xay, 'M', 49000, 16450, TRUE, 'system', 'system'),
(@id_matcha_xay, 'L', 55000, 20200, TRUE, 'system', 'system');

-- 13. Chocolate Đá Xay
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (3, 'Chocolate Đá Xay', 'Sốt chocolate đậm đà kết hợp với sữa và đá xay mịn, phủ lớp kem béo ngậy cùng bột ca cao trang trí.', null, TRUE, FALSE, 150, 3, 'system', 'system');
SET @id_choco_xay = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_choco_xay, 'M', 49000, 17200, TRUE, 'system', 'system'),
(@id_choco_xay, 'L', 55000, 21500, TRUE, 'system', 'system');


-- Category 4: Nước ép (ID 4)
-- 14. Nước Ép Cam Tươi
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (4, 'Nước Ép Cam Tươi', 'Nước cam sành vắt nguyên chất dồi dào Vitamin C giúp tăng cường sức đề kháng.', null, TRUE, FALSE, 80, 1, 'system', 'system');
SET @id_ep_cam = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_ep_cam, 'M', 35000, 20500, TRUE, 'system', 'system'),
(@id_ep_cam, 'L', 45000, 26000, TRUE, 'system', 'system');

-- 15. Nước Ép Thơm
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (4, 'Nước Ép Thơm', 'Nước ép dứa tươi chín mọng nguyên chất ngọt thanh, chua chua dịu mát cho ngày hè năng động.', null, TRUE, FALSE, 65, 2, 'system', 'system');
SET @id_ep_thom = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_ep_thom, 'M', 35000, 9500, TRUE, 'system', 'system'),
(@id_ep_thom, 'L', 45000, 12800, TRUE, 'system', 'system');

-- 16. Nước Ép Dưa Hấu
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (4, 'Nước Ép Dưa Hấu', 'Vị ngọt thanh mát lạnh tự nhiên từ những quả dưa hấu đỏ chín mọng nhiều nước.', null, TRUE, TRUE, 180, 3, 'system', 'system');
SET @id_ep_duahau = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_ep_duahau, 'M', 35000, 8400, TRUE, 'system', 'system'),
(@id_ep_duahau, 'L', 45000, 11600, TRUE, 'system', 'system');


-- Category 5: Bánh ngọt (ID 5)
-- 17. Bánh Sừng Bò Tươi (Croissant)
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (5, 'Bánh Sừng Bò Croissant', 'Bánh Croissant bơ thơm lừng kiểu Pháp, lớp vỏ giòn tan và bên trong mềm xốp lý tưởng ăn kèm cà phê.', null, TRUE, FALSE, 75, 1, 'system', 'system');
SET @id_banh_croissant = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_banh_croissant, 'M', 25000, 10200, TRUE, 'system', 'system');

-- 18. Bánh Tiramisu
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (5, 'Bánh Tiramisu', 'Bánh ngọt truyền thống Ý mang hương vị cà phê thơm nồng kết hợp lớp kem phô mai mascarpone béo mịn.', null, TRUE, TRUE, 160, 2, 'system', 'system');
SET @id_banh_tiramisu = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_banh_tiramisu, 'M', 39000, 26700, TRUE, 'system', 'system');

-- 19. Bánh Phô Mai Nướng (Cheesecake)
INSERT INTO menu_items (category_id, name, description, image_url, is_available, is_bestseller, total_sold, display_order, created_by, updated_by)
VALUES (5, 'Bánh Cheesecake Nướng', 'Lớp bánh cheesecake nướng mềm mịn béo ngậy ngập tràn hương vị phô mai mascarpone và bơ lạt hảo hạng.', null, TRUE, FALSE, 90, 3, 'system', 'system');
SET @id_banh_cheesecake = LAST_INSERT_ID();

INSERT INTO menu_item_variants (menu_item_id, size, price, cost_price, is_available, created_by, updated_by) VALUES
(@id_banh_cheesecake, 'M', 42000, 30275, TRUE, 'system', 'system');


-- ===================================================
-- SEED DATA: RECIPES FOR ALL DETAILED VARIANTS
-- ===================================================

-- 1. Recipes for Cà phê Đen Đá (M)
SET @v_denda_m = (SELECT id FROM menu_item_variants WHERE menu_item_id = @id_den_da AND size = 'M');
INSERT INTO recipe_ingredients (menu_item_variant_id, ingredient_id, quantity, created_by, updated_by) VALUES
(@v_denda_m, 1, 10.00, 'system', 'system'), -- Robusta
(@v_denda_m, 2, 10.00, 'system', 'system'), -- Arabica
(@v_denda_m, 7, 15.00, 'system', 'system'), -- Đường cát
(@v_denda_m, 8, 150.00, 'system', 'system'); -- Đá viên

-- 2. Recipes for Cà phê Sữa Đá (M)
SET @v_suada_m = (SELECT id FROM menu_item_variants WHERE menu_item_id = @id_sua_da AND size = 'M');
INSERT INTO recipe_ingredients (menu_item_variant_id, ingredient_id, quantity, created_by, updated_by) VALUES
(@v_suada_m, 1, 10.00, 'system', 'system'), -- Robusta
(@v_suada_m, 2, 10.00, 'system', 'system'), -- Arabica
(@v_suada_m, 3, 40.00, 'system', 'system'), -- Sữa đặc
(@v_suada_m, 8, 150.00, 'system', 'system'); -- Đá viên

-- 3. Recipes for Bạc Xỉu (M)
SET @v_bacxiu_m = (SELECT id FROM menu_item_variants WHERE menu_item_id = @id_bac_xiu AND size = 'M');
INSERT INTO recipe_ingredients (menu_item_variant_id, ingredient_id, quantity, created_by, updated_by) VALUES
(@v_bacxiu_m, 1, 5.00, 'system', 'system'), -- Robusta
(@v_bacxiu_m, 2, 5.00, 'system', 'system'), -- Arabica
(@v_bacxiu_m, 3, 30.00, 'system', 'system'), -- Sữa đặc
(@v_bacxiu_m, 6, 100.00, 'system', 'system'), -- Sữa tươi
(@v_bacxiu_m, 8, 150.00, 'system', 'system'); -- Đá viên

-- 4. Recipes for Cà phê Muối (M)
SET @v_cfmuoi_m = (SELECT id FROM menu_item_variants WHERE menu_item_id = @id_cafe_muoi AND size = 'M');
SET @ing_kem_muoi = (SELECT id FROM ingredients WHERE name = 'Kem phô mai muối biển');
INSERT INTO recipe_ingredients (menu_item_variant_id, ingredient_id, quantity, created_by, updated_by) VALUES
(@v_cfmuoi_m, 1, 10.00, 'system', 'system'), -- Robusta
(@v_cfmuoi_m, 2, 10.00, 'system', 'system'), -- Arabica
(@v_cfmuoi_m, 3, 25.00, 'system', 'system'), -- Sữa đặc
(@v_cfmuoi_m, @ing_kem_muoi, 40.00, 'system', 'system'), -- Kem phô mai muối
(@v_cfmuoi_m, 8, 150.00, 'system', 'system'); -- Đá viên

-- 5. Recipes for Trà Đào Cam Sả (M)
SET @v_tradao_m = (SELECT id FROM menu_item_variants WHERE menu_item_id = @id_tra_dao AND size = 'M');
SET @ing_siro_dao = (SELECT id FROM ingredients WHERE name = 'Siro Đào Tessire');
SET @ing_dao_mieng = (SELECT id FROM ingredients WHERE name = 'Đào miếng đóng hộp');
SET @ing_cam_vang = (SELECT id FROM ingredients WHERE name = 'Cam vàng Mỹ');
SET @ing_sa_cay = (SELECT id FROM ingredients WHERE name = 'Sả cây tươi');
INSERT INTO recipe_ingredients (menu_item_variant_id, ingredient_id, quantity, created_by, updated_by) VALUES
(@v_tradao_m, 4, 5.00, 'system', 'system'), -- Trà đen
(@v_tradao_m, @ing_siro_dao, 20.00, 'system', 'system'),
(@v_tradao_m, @ing_dao_mieng, 40.00, 'system', 'system'),
(@v_tradao_m, @ing_cam_vang, 50.00, 'system', 'system'),
(@v_tradao_m, @ing_sa_cay, 10.00, 'system', 'system'),
(@v_tradao_m, 7, 15.00, 'system', 'system'), -- Đường cát
(@v_tradao_m, 8, 150.00, 'system', 'system'); -- Đá viên

-- 6. Recipes for Bánh Tiramisu (M)
SET @v_tira_m = (SELECT id FROM menu_item_variants WHERE menu_item_id = @id_banh_tiramisu AND size = 'M');
SET @ing_mascarpone = (SELECT id FROM ingredients WHERE name = 'Phô mai Mascarpone');
INSERT INTO recipe_ingredients (menu_item_variant_id, ingredient_id, quantity, created_by, updated_by) VALUES
(@v_tira_m, @ing_mascarpone, 50.00, 'system', 'system'),
(@v_tira_m, 11, 30.00, 'system', 'system'), -- Whipping cream
(@v_tira_m, (SELECT id FROM ingredients WHERE name = 'Bột Cacao Premium'), 5.00, 'system', 'system'),
(@v_tira_m, 7, 15.00, 'system', 'system'), -- Đường cát
(@v_tira_m, 2, 5.00, 'system', 'system'); -- Arabica
