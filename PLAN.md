# KẾ HOẠCH THỰC HIỆN DỰ ÁN CHI TIẾT
## Hệ thống AI Hỗ trợ Quản lý Quán Cà phê

---

## TỔNG QUAN TIẾN ĐỘ

| Phase | Module | Ưu tiên | Phụ thuộc |
|-------|--------|---------|-----------|
| 0 | Base / Common (BE + FE) | ✅ Xong | — |
| 1 | Auth + Settings | 🔴 Cao nhất | Phase 0 |
| 2 | Dashboard | 🔴 Cao | Phase 1, 3, 4, 5 |
| 3 | Menu Management | 🔴 Cao | Phase 1 |
| 4 | POS (Order) | 🔴 Cao | Phase 1, 3, 5, 6 |
| 5 | Inventory | 🟠 Trung bình | Phase 1, 3 |
| 6 | Customer & Loyalty | 🟠 Trung bình | Phase 1, 4 |
| 7 | Marketing (AI) | 🟡 Thấp | Phase 1, 3, 4, 6 |
| 8 | Chatbot (AI) | 🟡 Thấp | Phase 1, 3, 4, 5, 6 |
| 9 | Reports (AI) | 🟡 Thấp | Phase 1, 3, 4, 5, 6 |

---

## PHASE 1 — MODULE AUTH & SETTINGS

### 1.1 Backend

#### Entities & Enums
- [ ] `User.java` — Entity: id, username, email, passwordHash, fullName, phone, avatarUrl, role(UserRole), isActive, + BaseEntity
- [ ] `ShopSettings.java` — Entity: id, user(FK), shopName, address, phone, openingTime, closingTime, logoUrl, description, wifiPassword, currency, taxRate, + BaseEntity

#### DTOs
- [ ] `RegisterRequest.java` — username, email, password, fullName, phone
- [ ] `LoginRequest.java` — username, password
- [ ] `AuthResponse.java` — token, refreshToken, user(UserResponse)
- [ ] `UserResponse.java` — id, username, email, fullName, phone, avatarUrl, role, isActive
- [ ] `ChangePasswordRequest.java` — currentPassword, newPassword, confirmPassword
- [ ] `ShopSettingsRequest.java` — tất cả fields của ShopSettings (có @Valid)
- [ ] `ShopSettingsResponse.java` — response DTO của ShopSettings

#### Repositories
- [ ] `UserRepository.java` — findByUsername(), findByEmail(), existsByUsername(), existsByEmail()
- [ ] `ShopSettingsRepository.java` — findByUserId()

#### Services
- [ ] `AuthService.java` — register(), login(), refreshToken(), changePassword(), getCurrentUser()
- [ ] `ShopSettingsService.java` — getSettings(), updateSettings(), uploadLogo()
- [ ] **Cập nhật** `UserDetailsServiceImpl.java` — wire với `UserRepository`

#### Controllers
- [ ] `AuthController.java` — POST /api/auth/register, /login, /refresh, GET /api/auth/me, PUT /api/auth/change-password
- [ ] `ShopSettingsController.java` — GET /api/settings, PUT /api/settings, POST /api/settings/logo

#### ErrorCodes bổ sung cho module Auth
- `INVALID_CURRENT_PASSWORD` — Mật khẩu hiện tại không đúng
- `SHOP_SETTINGS_NOT_FOUND` — Chưa có cài đặt quán

### 1.2 Frontend

#### Pages
- [ ] `app/login/page.tsx` — Form login (username + password), link register
- [ ] `app/register/page.tsx` — Form đăng ký (nếu cần)
- [ ] `app/settings/page.tsx` — Cài đặt thông tin quán, đổi mật khẩu

#### Components
- [ ] `components/layout/Sidebar.tsx` — Nav links: Dashboard, POS, Menu, Kho, Khách hàng, Marketing, Báo cáo, Chatbot, Cài đặt
- [ ] `components/layout/Header.tsx` — Tên trang, bell icon (cảnh báo kho), avatar + dropdown (profile, logout)
- [ ] `components/layout/MainLayout.tsx` — Wrapper: Sidebar + Header + main content area
- [ ] `app/(dashboard)/layout.tsx` — Layout có auth guard (dùng `useAuth(true)`)

#### Hooks / Services
- [ ] `hooks/useSettings.ts` — fetch/update shop settings
- [ ] `lib/auth.ts` — login(), register(), logout(), refreshToken() API calls

#### Stores
- [ ] `store/settingsStore.ts` — Lưu shopSettings vào global state để dùng ở Header/Layout

---

## PHASE 2 — MODULE DASHBOARD

### 2.1 Backend

#### DTOs
- [ ] `DashboardOverviewResponse.java` — todayRevenue, yesterdayRevenue, revenueChangePercent, todayOrderCount, yesterdayOrderCount, avgOrderValue
- [ ] `RevenueSummaryResponse.java` — Doanh thu theo khoảng thời gian (từng ngày/tuần/tháng)
- [ ] `TopSellingItem.java` — menuItemId, name, totalSold, revenue
- [ ] `LowStockAlert.java` — ingredientId, name, currentStock, minStock, unit
- [ ] `AIDashboardSummary.java` — summary(String), suggestions(List<String>)

#### Services
- [ ] `DashboardService.java`:
  - `getOverview()` — Query tổng hợp: doanh thu, số đơn hôm nay vs hôm qua
  - `getRevenueSummary(from, to, groupBy)` — Group by day/week/month
  - `getTopSelling(date, limit)` — Top N món theo tổng sold
  - `getLowStockAlerts()` — ingredient WHERE current_stock < min_stock
- [ ] `DashboardAIService.java`:
  - `generateDailySummary()` — Lấy data → build prompt → gọi AI → trả AIDashboardSummary

#### Controller
- [ ] `DashboardController.java` — GET /api/dashboard/overview, /revenue-summary, /top-selling, /low-stock-alerts, /ai-summary

### 2.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/dashboard/page.tsx` — Layout 3 cột (metrics + AI card + charts + alerts)
- [ ] `components/dashboard/StatCard.tsx` — Card hiển thị số liệu + % thay đổi + icon
- [ ] `components/dashboard/AIInsightCard.tsx` — AI summary text + nút "Xem gợi ý"
- [ ] `components/dashboard/LowStockAlertList.tsx` — Danh sách cảnh báo kho (màu đỏ/vàng)
- [ ] `components/charts/RevenueLineChart.tsx` — Recharts LineChart doanh thu 7 ngày
- [ ] `components/charts/TopSellingBarChart.tsx` — Recharts HorizontalBar top 5 món

#### Packages cần cài
- `recharts` — `npm install recharts @types/recharts`

#### Hooks
- [ ] `hooks/useDashboard.ts` — fetch overview, revenue, top-selling, alerts, AI summary

---

## PHASE 3 — MODULE MENU MANAGEMENT

### 3.1 Backend

#### Entities
- [ ] `Category.java` — id, name, description, icon, displayOrder, isActive
- [ ] `MenuItem.java` — id, category(FK), name, description, price, costPrice, imageUrl, size, isAvailable, isBestseller, totalSold, displayOrder
- [ ] `Topping.java` — id, name, price, isAvailable
- [ ] `RecipeIngredient.java` — id, menuItem(FK), ingredient(FK), quantity

#### DTOs
- [ ] `CategoryRequest/Response.java`
- [ ] `MenuItemRequest/Response.java` — Bao gồm recipe list
- [ ] `ToppingRequest/Response.java`
- [ ] `RecipeIngredientRequest/Response.java`
- [ ] `MenuAnalysisResponse.java` — stars, puzzles, plowHorses, dogs (mỗi list gồm MenuItem + phân loại)
- [ ] `NewMenuSuggestion.java` — name, description, suggestedPrice, requiredIngredients
- [ ] `PriceSuggestion.java` — suggestedPrice, costBreakdown, targetMargin

#### Services
- [ ] `CategoryService.java` — CRUD
- [ ] `MenuItemService.java` — CRUD, toggleAvailability(), uploadImage(), getRecipe(), saveRecipe(), calculateCost()
- [ ] `ToppingService.java` — CRUD
- [ ] `MenuAIService.java`:
  - `analyzeMenuEngineering()` — Phân loại Star/Puzzle/PlowHorse/Dog
  - `suggestNewMenu()` — Gợi ý món mới từ nguyên liệu có sẵn
  - `suggestPrice(menuItemId, targetMargin)` — Gợi ý giá

#### Repositories
- [ ] `CategoryRepository.java` — findByIsActiveOrderByDisplayOrder()
- [ ] `MenuItemRepository.java` — findByCategoryId(), searchByName(), findByIsAvailable()
- [ ] `ToppingRepository.java`
- [ ] `RecipeIngredientRepository.java` — findByMenuItemId(), deleteByMenuItemId()

#### Controllers
- [ ] `CategoryController.java`
- [ ] `MenuItemController.java`
- [ ] `ToppingController.java`
- [ ] `MenuAIController.java` — POST /api/menu/ai/analyze, /suggest-new, /suggest-price

### 3.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/menu/page.tsx` — Grid/list menu với filter theo category, search
- [ ] `app/(dashboard)/menu/[id]/page.tsx` — Chi tiết/chỉnh sửa món, quản lý recipe
- [ ] `app/(dashboard)/menu/ai-suggest/page.tsx` — AI gợi ý món mới + phân tích menu
- [ ] `components/menu/MenuGrid.tsx` — Grid các món với filter tabs
- [ ] `components/menu/MenuItemCard.tsx` — Card 1 món (ảnh, tên, giá, toggle available)
- [ ] `components/menu/MenuItemForm.tsx` — Form thêm/sửa món
- [ ] `components/menu/RecipeEditor.tsx` — Quản lý công thức (mapping nguyên liệu)
- [ ] `components/menu/AIMenuAnalysis.tsx` — Hiển thị kết quả phân tích AI (4 quadrant)

#### Hooks
- [ ] `hooks/useMenu.ts` — CRUD menu items, categories, toppings

---

## PHASE 4 — MODULE POS (POINT OF SALE)

### 4.1 Backend

#### Entities
- [ ] `Order.java` — id, orderCode, customer(FK nullable), orderType, tableNumber, status, subtotal, discountAmount, taxAmount, totalAmount, paymentMethod, paymentStatus, note, promotion(FK), createdBy(FK), completedAt
- [ ] `OrderItem.java` — id, order(FK), menuItem(FK), quantity, unitPrice, note
- [ ] `OrderItemTopping.java` — id, orderItem(FK), topping(FK), quantity, price

#### DTOs
- [ ] `CreateOrderRequest.java` — orderType, tableNumber, customerId?, note, items(list OrderItemRequest), promotionId?
- [ ] `OrderItemRequest.java` — menuItemId, quantity, note, toppingIds[]
- [ ] `OrderResponse.java` — Full order info + items + customer name
- [ ] `OrderSummaryResponse.java` — id, orderCode, status, totalAmount, createdAt (cho list)
- [ ] `UpdateOrderStatusRequest.java` — status(OrderStatus)
- [ ] `PaymentRequest.java` — paymentMethod

#### Services
- [ ] `OrderService.java`:
  - `createOrder(request)` → Validate stock → Create order + items → Calculate totals
  - `updateStatus(orderId, status)` → Nếu COMPLETED: AUTO_DEDUCT kho, update total_sold, loyalty points
  - `cancelOrder(orderId)` → Hoàn kho nếu đã COMPLETED (tạo IMPORT log)
  - `processPayment(orderId, method)` → Set payment_status = PAID
  - `generateReceipt(orderId)` → HTML/PDF hóa đơn
  - `getTodayOrders()`, `getOrders(filter, page)`

#### Logic quan trọng khi COMPLETE đơn
```
Với mỗi OrderItem:
  1. Lấy recipe → tính lượng nguyên liệu cần
  2. ingredient.currentStock -= quantity * recipe.quantity
  3. Tạo InventoryLog (AUTO_DEDUCT, reference_id = orderId)
  4. Nếu currentStock < 0 → throw OUT_OF_STOCK (hoặc cảnh báo)
Cập nhật menuItem.totalSold += quantity
Nếu có customer:
  - customer.totalOrders++
  - customer.totalSpent += totalAmount
  - Tính loyalty_points = totalAmount / 10000
  - Cập nhật tier tự động
```

#### Repositories
- [ ] `OrderRepository.java` — findByCreatedAtBetween(), findTodayOrders(), sumRevenueByDateRange()
- [ ] `OrderItemRepository.java` — findByOrderId()

#### Controllers
- [ ] `OrderController.java`

### 4.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/pos/page.tsx` — Giao diện POS chính (2 cột: menu grid + giỏ hàng)
- [ ] `components/pos/MenuGrid.tsx` — Grid món lọc theo category tabs
- [ ] `components/pos/OrderPanel.tsx` — Giỏ hàng: danh sách, tổng tiền, nút thanh toán
- [ ] `components/pos/OrderItemRow.tsx` — 1 dòng trong giỏ (tên, size, topping, qty, giá, xóa)
- [ ] `components/pos/PaymentModal.tsx` — Chọn PTTT, áp KM, chọn khách, xác nhận
- [ ] `components/pos/ToppingSelector.tsx` — Popup chọn topping khi thêm món
- [ ] `app/(dashboard)/orders/page.tsx` — Lịch sử đơn hàng với filter/search/pagination
- [ ] `app/(dashboard)/orders/[id]/page.tsx` — Chi tiết đơn, cập nhật trạng thái

---

## PHASE 5 — MODULE INVENTORY

### 5.1 Backend

#### Entities
- [ ] `Supplier.java` — id, name, phone, email, address, note
- [ ] `Ingredient.java` — id, name, unit, currentStock, minStock, unitCost, supplier(FK), expiryDays, isActive
- [ ] `InventoryLog.java` — id, ingredient(FK), action, quantity, unitCost, totalCost, note, referenceId, createdBy(FK)

#### DTOs
- [ ] `SupplierRequest/Response.java`
- [ ] `IngredientRequest/Response.java`
- [ ] `ImportRequest.java` — List<ImportItem(ingredientId, quantity, unitCost, note, supplierId)>
- [ ] `InventoryLogResponse.java`
- [ ] `InventoryForecastResponse.java` — predictions(list), urgentItems(list), estimatedCost

#### Services
- [ ] `SupplierService.java` — CRUD
- [ ] `IngredientService.java` — CRUD, getLowStockList()
- [ ] `InventoryService.java` — importStock(), exportStock(), adjustStock(), getLogs()
- [ ] `InventoryAIService.java`:
  - `forecastDemand()` — Lấy 30-day consumption → AI → predictions
  - `detectAnomalies()` — Phân tích tiêu thụ bất thường
  - `optimizeCost()` — Phân tích giá nhập + gợi ý

#### Repositories
- [ ] `IngredientRepository.java` — findLowStock(), findByName()
- [ ] `InventoryLogRepository.java` — findByIngredientAndDateRange(), getLast30DaysConsumption()
- [ ] `SupplierRepository.java`

#### Controllers
- [ ] `IngredientController.java`
- [ ] `SupplierController.java`
- [ ] `InventoryController.java` — import, export, adjust, logs, low-stock
- [ ] `InventoryAIController.java` — forecast, anomaly, cost-optimize

### 5.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/inventory/page.tsx` — Bảng nguyên liệu, tồn kho, cảnh báo
- [ ] `app/(dashboard)/inventory/import/page.tsx` — Form nhập kho (chọn nhiều NL)
- [ ] `app/(dashboard)/inventory/ai-forecast/page.tsx` — AI dự báo nhu cầu
- [ ] `components/inventory/StockTable.tsx` — Bảng tồn kho với filter, search
- [ ] `components/inventory/ImportForm.tsx` — Form nhập kho nhiều dòng
- [ ] `components/inventory/AIForecastCard.tsx` — Hiển thị kết quả dự báo

---

## PHASE 6 — MODULE CUSTOMER & LOYALTY

### 6.1 Backend

#### Entities
- [ ] `Customer.java` — id, name, phone(unique), email, birthday, totalOrders, totalSpent, loyaltyPoints, tier(CustomerTier), note, lastVisitAt
- [ ] `LoyaltyTransaction.java` — id, customer(FK), order(FK), points, action(EARN/REDEEM/BONUS/EXPIRE), description

#### DTOs
- [ ] `CustomerRequest/Response.java`
- [ ] `LoyaltyTransactionResponse.java`
- [ ] `RedeemPointsRequest.java` — points, description
- [ ] `CustomerSegmentResponse.java` — segments(Map<String, List<CustomerSummary>>), actionSuggestions
- [ ] `ChurnPredictionResponse.java` — atRiskCustomers(List), reasoning
- [ ] `PersonalizedPromoResponse.java` — customerId, suggestions(List)

#### Services
- [ ] `CustomerService.java` — CRUD, getOrderHistory(), getLoyaltyHistory(), redeemPoints()
- [ ] `LoyaltyService.java` — earnPoints(orderId), updateTier(), calculatePointsValue()
- [ ] `CustomerAIService.java`:
  - `segmentCustomers()` — Phân nhóm: Mới, Quen, VIP, Sắp rời
  - `predictChurn()` — Khách không quay lại > 30 ngày
  - `personalizePromotion(customerId)` — Gợi ý KM cá nhân

#### Repositories
- [ ] `CustomerRepository.java` — findByPhone(), findByTier(), findInactiveSince()
- [ ] `LoyaltyTransactionRepository.java` — findByCustomerId()

#### Controllers
- [ ] `CustomerController.java`
- [ ] `CustomerAIController.java`

### 6.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/customers/page.tsx` — Danh sách khách với filter tier, search
- [ ] `app/(dashboard)/customers/[id]/page.tsx` — Chi tiết khách: info, lịch sử đơn, điểm
- [ ] `components/customers/CustomerCard.tsx` — Card khách với tier badge
- [ ] `components/customers/LoyaltyTimeline.tsx` — Lịch sử tích/đổi điểm

---

## PHASE 7 — MODULE MARKETING (AI)

### 7.1 Backend

#### Entities
- [ ] `Promotion.java` — id, name, description, type(PromotionType), value, minOrderValue, maxDiscount, applicableItems(JSON), startDate, endDate, usageLimit, usedCount, isActive, isAiSuggested
- [ ] `PromotionUsage.java` — id, promotion(FK), order(FK), customer(FK), discountAmount

#### DTOs
- [ ] `CaptionRequest.java` — menuItemId, tone(vui/chuyên nghiệp/gen-z), platform(FB/IG/TikTok)
- [ ] `CaptionResponse.java` — shortCaption, mediumCaption, longCaption, hashtags
- [ ] `PromotionSuggestionResponse.java` — name, description, type, suggestedValue, reasoning
- [ ] `PromotionRequest/Response.java`
- [ ] `HashtagResponse.java` — hashtags(List<String>)

#### Services
- [ ] `PromotionService.java` — CRUD, getStats(), applyPromotion(orderId, promotionId)
- [ ] `MarketingAIService.java`:
  - `generateCaption(request)` — Tạo caption 3 phiên bản
  - `suggestPromotion()` — Phân tích data → gợi ý KM
  - `suggestHashtags(menuItemId)` — Hashtag trending
  - `suggestPostSchedule()` — Khung giờ + ngày đăng tốt nhất

#### Controllers
- [ ] `PromotionController.java`
- [ ] `MarketingAIController.java`

### 7.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/marketing/page.tsx` — Tổng quan: list KM active + nút tạo caption
- [ ] `app/(dashboard)/marketing/content-generator/page.tsx` — AI Caption generator
- [ ] `app/(dashboard)/marketing/promotions/page.tsx` — Quản lý khuyến mãi
- [ ] `components/marketing/CaptionResult.tsx` — Hiển thị 3 phiên bản caption + copy button
- [ ] `components/marketing/PromotionForm.tsx` — Form tạo/sửa KM

---

## PHASE 8 — MODULE CHATBOT (AI)

### 8.1 Backend

#### Entity
- [ ] `AIConversation.java` — id, user(FK), sessionId, role(USER/ASSISTANT), message

#### DTOs
- [ ] `ChatRequest.java` — message, sessionId
- [ ] `ChatResponse.java` — message, sessionId, timestamp

#### Services
- [ ] `CustomerChatbotService.java`:
  - Xử lý câu hỏi về menu, giờ mở cửa, topping, gợi ý món
  - System prompt: thông tin quán + menu hiện tại
- [ ] `AdvisorChatbotService.java`:
  - Phân loại intent → query DB → build context → gọi AI
  - Hỏi về: doanh thu, top món, tồn kho, gợi ý cải thiện
  - System prompt: vai trò cố vấn + current business data

#### AI Prompt Templates cần tạo
```
src/main/resources/prompts/
├── dashboard-summary.txt
├── menu-analysis.txt
├── menu-suggest-new.txt
├── inventory-forecast.txt
├── inventory-anomaly.txt
├── marketing-caption.txt
├── marketing-promotion.txt
├── customer-segment.txt
├── report-weekly.txt
├── chatbot-customer-system.txt
└── chatbot-advisor-system.txt
```

#### Controllers
- [ ] `ChatbotController.java` — POST /api/chatbot/customer/message, /advisor/message, GET /advisor/history, DELETE /advisor/session

### 8.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/chatbot/page.tsx` — Business Advisor chat UI
- [ ] `components/ai/AIChat.tsx` — Chat interface (messages list + input)
- [ ] `components/ai/ChatMessage.tsx` — 1 message bubble (user/AI)
- [ ] `components/ai/CustomerChatWidget.tsx` — Widget chatbot nhúng (cho website public quán)
- [ ] `components/ai/AILoadingIndicator.tsx` — "AI đang trả lời..." animation

---

## PHASE 9 — MODULE REPORTS (AI)

### 9.1 Backend

#### Entity
- [ ] `AIReport.java` — id, user(FK), reportType, title, content, promptUsed, metadata(JSON), isBookmarked

#### DTOs
- [ ] `RevenueReportResponse.java` — dataPoints(List<DateRevenuePair>), totalRevenue, totalOrders
- [ ] `CategoryRevenueResponse.java` — categories(List<name, revenue, percentage>)
- [ ] `TopItemResponse.java` — menuItemId, name, totalSold, revenue, profit
- [ ] `CustomerStatsResponse.java` — newCustomers, returningCustomers, totalLoyaltyPoints
- [ ] `AIReportResponse.java` — id, reportType, title, content, createdAt, isBookmarked
- [ ] `AIWeeklyAnalysis.java` — summary, trends, highlights, suggestions
- [ ] `AIRevenueForecast.java` — predictions(List<DateRevenuePair>), confidence, assumptions

#### Services
- [ ] `ReportService.java`:
  - `getRevenue(from, to, groupBy)` — Query aggregate từ orders
  - `getRevenueByHour(date)` — Group by hour
  - `getRevenueByCategory(from, to)` — Join orders-items-menu-category
  - `getTopItems(from, to, limit)` — TOP N món theo revenue/quantity
  - `getProfitByItem()` — revenue - (costPrice * totalSold)
  - `getCustomerStats(from, to)` — Thống kê khách
  - `getPaymentMethodStats(from, to)` — Tỷ lệ PTTT
- [ ] `ReportAIService.java`:
  - `analyzeWeekly()` — Lấy 2 tuần data → AI so sánh → insight
  - `forecastRevenue()` — Historical → AI predict
  - `generateImprovementSuggestions()` — Data → AI → actionable tips

#### Repositories cần bổ sung Native Queries
- [ ] `OrderRepository` — `@Query` tổng hợp doanh thu, group by date/hour/category
- [ ] `OrderItemRepository` — `@Query` top items, profit by item

#### Controllers
- [ ] `ReportController.java` — GET /api/reports/*
- [ ] `ReportAIController.java` — POST /api/reports/ai/*

### 9.2 Frontend

#### Pages & Components
- [ ] `app/(dashboard)/reports/page.tsx` — Dashboard báo cáo tổng quan
- [ ] `app/(dashboard)/reports/revenue/page.tsx` — Doanh thu chi tiết + date picker
- [ ] `app/(dashboard)/reports/ai-analysis/page.tsx` — AI phân tích + lịch sử AI reports
- [ ] `components/charts/RevenueLineChart.tsx` — Doanh thu theo ngày/tuần/tháng
- [ ] `components/charts/HourlyBarChart.tsx` — Doanh thu theo giờ (peak hours)
- [ ] `components/charts/CategoryPieChart.tsx` — Tỷ lệ doanh thu theo danh mục
- [ ] `components/charts/TopItemsChart.tsx` — Horizontal bar top 10 món
- [ ] `components/ai/AIReportViewer.tsx` — Hiển thị AI report với markdown render
- [ ] `components/ai/AISuggestionCard.tsx` — Card gợi ý từ AI với action button

---

## SEED DATA

### Cần tạo khi hoàn thành Phase 3 + 5
```
src/main/resources/db/migration/
├── V1__init_schema.sql        — Toàn bộ CREATE TABLE
├── V2__seed_categories.sql    — 5 danh mục
├── V3__seed_ingredients.sql   — 20+ nguyên liệu
├── V4__seed_menu_items.sql    — 20+ món
├── V5__seed_recipes.sql       — Công thức cho từng món
├── V6__seed_users.sql         — 1 user OWNER mặc định
└── V7__seed_sample_orders.sql — 200-300 đơn hàng 30 ngày (dùng stored procedure/script)
```

---

## YÊU CẦU KỸ THUẬT BỔ SUNG

### Backend
- [ ] **File upload**: Cấu hình `MultipartResolver` cho upload ảnh (logo quán, ảnh món)
  - Local storage: `src/main/resources/static/uploads/`
  - Hoặc: tích hợp AWS S3 / Cloudinary
- [ ] **Prompt Template Service**: Load `.txt` files từ `resources/prompts/`, thay thế `{variable}`
- [ ] **AI Response Parser**: Parse JSON response từ AI một cách an toàn (try-catch + fallback)
- [ ] **Rate Limiting**: Giới hạn số request đến AI endpoints (tránh chi phí vượt mức)
- [ ] **Caching**: Cache AI responses ngắn hạn (5-15 phút) cho dashboard summary

### Frontend
- [ ] **Date range picker**: Cài `react-day-picker` hoặc tự implement cho báo cáo
- [ ] **Rich text / Markdown**: Render AI response dưới dạng markdown cho chatbot và reports
- [ ] **Image upload**: Component upload ảnh với preview
- [ ] **Print**: Trigger browser print cho hóa đơn POS
- [ ] **PWA** (optional): Manifest + service worker để dùng offline trên tablet

---

## THỨ TỰ THỰC HIỆN ĐỀ XUẤT

```
Phase 0 (Done) → Phase 1 → Phase 3 → Phase 5 → Phase 4 → Phase 2 → Phase 6 → Phase 9 → Phase 7 → Phase 8
```

**Lý do thứ tự:**
1. Auth (1) — Phải có auth trước mọi thứ
2. Menu (3) — POS cần menu để order
3. Inventory (5) — POS cần inventory để trừ kho
4. POS (4) — Core business flow
5. Dashboard (2) — Cần data từ POS/Inventory
6. Customer (6) — Cần data đơn hàng
7. Reports (9) — Cần đủ data từ các module trước
8. Marketing (7) — Cần menu + customer data
9. Chatbot (8) — Cần tất cả data để trả lời thông minh
