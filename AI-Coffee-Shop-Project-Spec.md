# HỆ THỐNG AI HỖ TRỢ QUẢN LÝ QUÁN CÀ PHÊ NHỎ
## Tài liệu đặc tả chi tiết dự án

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Mô tả
Xây dựng hệ thống website hỗ trợ chủ quán cà phê nhỏ (doanh nghiệp 1 người) vận hành hiệu quả bằng cách tích hợp AI vào các nghiệp vụ cốt lõi: quản lý đơn hàng, kho nguyên liệu, phân tích kinh doanh, marketing, và chăm sóc khách hàng.

### 1.2 Vấn đề giải quyết
Chủ quán cà phê nhỏ thường phải tự mình đảm nhận mọi vai trò: pha chế, thu ngân, kế toán, marketing, quản kho. Hệ thống này dùng AI để thay thế các vai trò hỗ trợ, giúp 1 người có năng lực vận hành tương đương 1 team nhỏ 4-5 người.

### 1.3 Tech Stack
- **Backend:** Java 17+ / Spring Boot 3.x
- **Frontend:** Next.js 14+ (App Router) / React 18+
- **Database:** MySQL 8.x hoặc PostgreSQL 15+
- **AI:** OpenAI GPT API hoặc Google Gemini API
- **Styling:** Tailwind CSS
- **Charts:** Recharts hoặc Chart.js
- **Authentication:** Spring Security + JWT
- **Build Tool:** Maven hoặc Gradle
- **API Docs:** Swagger/OpenAPI 3.0

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Next.js Frontend (React 18)                │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │ │
│  │  │Dashboard │ │   POS    │ │Inventory │ │ Marketing │  │ │
│  │  │  Page    │ │  Page    │ │  Page    │ │   Page    │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │ │
│  │  │  Menu    │ │ Reports  │ │ Customer │ │  Chatbot  │  │ │
│  │  │  Page    │ │  Page    │ │  Page    │ │  Widget   │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────┬───────────────────────────────────────┘
                       │ REST API (JSON) + JWT Auth
┌──────────────────────▼───────────────────────────────────────┐
│                     SERVER LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │            Spring Boot Application                      │ │
│  │                                                         │ │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │ │
│  │  │ Controllers  │  │  Services    │  │  AI Service   │  │ │
│  │  │ (REST API)   │  │ (Business)   │  │  (GPT/Gemini) │  │ │
│  │  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │ │
│  │         │                │                   │          │ │
│  │  ┌──────▼──────────────▼───────────────────▼────────┐  │ │
│  │  │              Repository Layer (JPA)                │  │ │
│  │  └──────────────────────┬────────────────────────────┘  │ │
│  └─────────────────────────┼───────────────────────────────┘ │
└────────────────────────────┼─────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                      DATA LAYER                               │
│  ┌──────────────┐  ┌──────────────────────────────────────┐  │
│  │  MySQL /      │  │  External APIs                      │  │
│  │  PostgreSQL   │  │  - OpenAI GPT / Google Gemini       │  │
│  │              │  │  - (Optional) Weather API            │  │
│  └──────────────┘  └──────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Cấu trúc Backend (Package Structure)

```
src/main/java/com/coffeeshop/
├── config/
│   ├── SecurityConfig.java
│   ├── JwtConfig.java
│   ├── CorsConfig.java
│   └── OpenAIConfig.java
├── controller/
│   ├── AuthController.java
│   ├── DashboardController.java
│   ├── MenuController.java
│   ├── OrderController.java
│   ├── InventoryController.java
│   ├── CustomerController.java
│   ├── ReportController.java
│   ├── MarketingController.java
│   └── ChatbotController.java
├── service/
│   ├── AuthService.java
│   ├── MenuService.java
│   ├── OrderService.java
│   ├── InventoryService.java
│   ├── CustomerService.java
│   ├── ReportService.java
│   ├── MarketingService.java
│   └── ai/
│       ├── AIService.java              (interface)
│       ├── OpenAIServiceImpl.java
│       ├── PromptTemplateService.java
│       ├── InventoryAIService.java
│       ├── MenuAIService.java
│       ├── ReportAIService.java
│       └── MarketingAIService.java
├── repository/
│   ├── UserRepository.java
│   ├── MenuItemRepository.java
│   ├── IngredientRepository.java
│   ├── OrderRepository.java
│   ├── CustomerRepository.java
│   └── ...
├── model/
│   ├── entity/
│   │   ├── User.java
│   │   ├── MenuItem.java
│   │   ├── Category.java
│   │   ├── Ingredient.java
│   │   ├── RecipeIngredient.java
│   │   ├── Order.java
│   │   ├── OrderItem.java
│   │   ├── Customer.java
│   │   ├── InventoryLog.java
│   │   ├── Promotion.java
│   │   └── AIReport.java
│   ├── dto/
│   │   ├── request/
│   │   └── response/
│   └── enums/
│       ├── OrderStatus.java
│       ├── PaymentMethod.java
│       └── InventoryAction.java
├── security/
│   ├── JwtTokenProvider.java
│   ├── JwtAuthenticationFilter.java
│   └── UserDetailsServiceImpl.java
├── exception/
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── AIServiceException.java
└── util/
    ├── DateUtils.java
    └── PromptBuilder.java
```

### 2.3 Cấu trúc Frontend (Next.js)

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    (redirect → dashboard)
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── pos/page.tsx
│   ├── menu/
│   │   ├── page.tsx                (danh sách menu)
│   │   ├── [id]/page.tsx           (chi tiết món)
│   │   └── ai-suggest/page.tsx     (AI gợi ý)
│   ├── inventory/
│   │   ├── page.tsx                (tồn kho)
│   │   ├── import/page.tsx         (nhập kho)
│   │   └── ai-forecast/page.tsx    (AI dự báo)
│   ├── orders/
│   │   ├── page.tsx                (lịch sử)
│   │   └── [id]/page.tsx
│   ├── customers/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── reports/
│   │   ├── page.tsx                (tổng quan)
│   │   ├── revenue/page.tsx
│   │   └── ai-analysis/page.tsx
│   ├── marketing/
│   │   ├── page.tsx
│   │   ├── content-generator/page.tsx
│   │   └── promotions/page.tsx
│   └── settings/page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainLayout.tsx
│   ├── dashboard/
│   │   ├── RevenueCard.tsx
│   │   ├── TopSellingChart.tsx
│   │   ├── AIInsightCard.tsx
│   │   └── LowStockAlert.tsx
│   ├── pos/
│   │   ├── MenuGrid.tsx
│   │   ├── OrderPanel.tsx
│   │   ├── PaymentModal.tsx
│   │   └── QuickOrderButton.tsx
│   ├── inventory/
│   │   ├── StockTable.tsx
│   │   ├── ImportForm.tsx
│   │   └── AIForecastCard.tsx
│   ├── charts/
│   │   ├── RevenueLineChart.tsx
│   │   ├── CategoryPieChart.tsx
│   │   └── HourlyBarChart.tsx
│   ├── ai/
│   │   ├── AIChat.tsx
│   │   ├── AISuggestionCard.tsx
│   │   ├── AILoadingIndicator.tsx
│   │   └── AIReportViewer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Modal.tsx
│       ├── Table.tsx
│       ├── Input.tsx
│       └── Card.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useOrders.ts
│   ├── useInventory.ts
│   └── useAI.ts
├── lib/
│   ├── api.ts                     (axios instance + interceptors)
│   ├── auth.ts
│   └── utils.ts
├── store/
│   ├── authStore.ts               (zustand)
│   ├── orderStore.ts
│   └── cartStore.ts
└── types/
    ├── menu.ts
    ├── order.ts
    ├── inventory.ts
    └── ai.ts
```

---

## 3. THIẾT KẾ DATABASE CHI TIẾT

### 3.1 ERD (Entity Relationship)

```
users (1) ──────────────── (*) orders
  │
  └── shop_settings (1:1)

categories (1) ─────────── (*) menu_items
                                  │
menu_items (1) ────────────── (*) recipe_ingredients (*) ── (1) ingredients
    │                                                            │
    │                                                    inventory_logs (*)
    │                                                            │
    └─── (*) order_items (*) ─── (1) orders                suppliers (1)
                                      │
                              customers (1) ──── (*) orders
                                  │
                              loyalty_points (*)
                                  │
                              promotions (*) ──── promotion_usage (*)

ai_reports (*) ── users
ai_conversations (*) ── users
```

### 3.2 Bảng chi tiết

```sql
-- ===================================================
-- 1. QUẢN LÝ NGƯỜI DÙNG & CÀI ĐẶT
-- ===================================================

CREATE TABLE users (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(100) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100),
    phone           VARCHAR(20),
    avatar_url      VARCHAR(500),
    role            ENUM('OWNER', 'STAFF') DEFAULT 'OWNER',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE shop_settings (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT UNIQUE NOT NULL,
    shop_name       VARCHAR(200) NOT NULL,
    address         VARCHAR(500),
    phone           VARCHAR(20),
    opening_time    TIME DEFAULT '07:00:00',
    closing_time    TIME DEFAULT '22:00:00',
    logo_url        VARCHAR(500),
    description     TEXT,
    wifi_password   VARCHAR(100),
    social_facebook VARCHAR(300),
    social_instagram VARCHAR(300),
    currency        VARCHAR(10) DEFAULT 'VND',
    tax_rate        DECIMAL(5,2) DEFAULT 0.00,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===================================================
-- 2. QUẢN LÝ MENU
-- ===================================================

CREATE TABLE categories (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,       -- Cà phê, Trà, Nước ép, Bánh, Topping...
    description     VARCHAR(500),
    icon            VARCHAR(50),                 -- icon identifier
    display_order   INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE menu_items (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_id     BIGINT NOT NULL,
    name            VARCHAR(200) NOT NULL,        -- Cà phê sữa đá
    description     TEXT,                         -- Mô tả ngắn
    price           DECIMAL(12,0) NOT NULL,       -- 29000 (VNĐ)
    cost_price      DECIMAL(12,0) DEFAULT 0,      -- Giá vốn tự tính từ recipe
    image_url       VARCHAR(500),
    size            ENUM('S', 'M', 'L') DEFAULT 'M',
    is_available    BOOLEAN DEFAULT TRUE,
    is_bestseller   BOOLEAN DEFAULT FALSE,
    total_sold      INT DEFAULT 0,                -- Cache tổng số lượng đã bán
    display_order   INT DEFAULT 0,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Topping / Add-on (thêm trân châu, thêm shot espresso...)
CREATE TABLE toppings (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100) NOT NULL,
    price           DECIMAL(12,0) NOT NULL,
    is_available    BOOLEAN DEFAULT TRUE
);

-- ===================================================
-- 3. QUẢN LÝ NGUYÊN LIỆU & KHO
-- ===================================================

CREATE TABLE suppliers (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(200) NOT NULL,        -- Nhà cung cấp cà phê ABC
    phone           VARCHAR(20),
    email           VARCHAR(100),
    address         VARCHAR(500),
    note            TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ingredients (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(200) NOT NULL,        -- Cà phê robusta, Sữa đặc, Đường...
    unit            VARCHAR(50) NOT NULL,          -- g, ml, cái, gói...
    current_stock   DECIMAL(12,2) DEFAULT 0,      -- Tồn kho hiện tại
    min_stock       DECIMAL(12,2) DEFAULT 0,      -- Mức tồn kho tối thiểu (cảnh báo)
    unit_cost       DECIMAL(12,2) DEFAULT 0,      -- Giá mỗi đơn vị
    supplier_id     BIGINT,
    expiry_days     INT,                          -- Hạn sử dụng trung bình (ngày)
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Công thức: mapping giữa món và nguyên liệu
CREATE TABLE recipe_ingredients (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    menu_item_id    BIGINT NOT NULL,
    ingredient_id   BIGINT NOT NULL,
    quantity        DECIMAL(10,2) NOT NULL,       -- 20g cà phê, 50ml sữa...
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    UNIQUE KEY uk_recipe (menu_item_id, ingredient_id)
);

-- Lịch sử nhập/xuất kho
CREATE TABLE inventory_logs (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    ingredient_id   BIGINT NOT NULL,
    action          ENUM('IMPORT', 'EXPORT', 'ADJUST', 'AUTO_DEDUCT') NOT NULL,
    quantity         DECIMAL(12,2) NOT NULL,       -- Dương = nhập, Âm = xuất
    unit_cost       DECIMAL(12,2),                -- Giá nhập mỗi đơn vị (khi IMPORT)
    total_cost      DECIMAL(12,0),                -- Tổng tiền nhập
    note            VARCHAR(500),                 -- Ghi chú (VD: "Nhập 5kg cà phê từ ABC")
    reference_id    BIGINT,                       -- order_id nếu AUTO_DEDUCT
    created_by      BIGINT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ===================================================
-- 4. QUẢN LÝ ĐƠN HÀNG (POS)
-- ===================================================

CREATE TABLE orders (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code      VARCHAR(20) UNIQUE NOT NULL,  -- HD20260525001
    customer_id     BIGINT,                       -- NULL = khách vãng lai
    order_type      ENUM('DINE_IN', 'TAKEAWAY', 'ONLINE') DEFAULT 'DINE_IN',
    table_number    VARCHAR(10),                  -- Bàn số mấy (nếu có)
    status          ENUM('PENDING', 'PREPARING', 'COMPLETED', 'CANCELLED') DEFAULT 'PENDING',
    subtotal        DECIMAL(12,0) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,0) DEFAULT 0,
    tax_amount      DECIMAL(12,0) DEFAULT 0,
    total_amount    DECIMAL(12,0) NOT NULL DEFAULT 0,
    payment_method  ENUM('CASH', 'TRANSFER', 'MOMO', 'ZALOPAY') DEFAULT 'CASH',
    payment_status  ENUM('UNPAID', 'PAID') DEFAULT 'UNPAID',
    note            TEXT,
    promotion_id    BIGINT,
    created_by      BIGINT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at    TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE order_items (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id        BIGINT NOT NULL,
    menu_item_id    BIGINT NOT NULL,
    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,0) NOT NULL,       -- Giá tại thời điểm bán
    note            VARCHAR(300),                 -- Ít đường, nhiều đá...
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);

CREATE TABLE order_item_toppings (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_item_id   BIGINT NOT NULL,
    topping_id      BIGINT NOT NULL,
    quantity        INT DEFAULT 1,
    price           DECIMAL(12,0) NOT NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE,
    FOREIGN KEY (topping_id) REFERENCES toppings(id)
);

-- ===================================================
-- 5. QUẢN LÝ KHÁCH HÀNG
-- ===================================================

CREATE TABLE customers (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(100),
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(100),
    birthday        DATE,
    total_orders    INT DEFAULT 0,
    total_spent     DECIMAL(15,0) DEFAULT 0,
    loyalty_points  INT DEFAULT 0,
    tier            ENUM('NORMAL', 'SILVER', 'GOLD', 'PLATINUM') DEFAULT 'NORMAL',
    note            TEXT,
    last_visit_at   TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE loyalty_transactions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    customer_id     BIGINT NOT NULL,
    order_id        BIGINT,
    points          INT NOT NULL,                 -- Dương = tích, Âm = đổi
    action          ENUM('EARN', 'REDEEM', 'BONUS', 'EXPIRE') NOT NULL,
    description     VARCHAR(300),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ===================================================
-- 6. KHUYẾN MÃI
-- ===================================================

CREATE TABLE promotions (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    type            ENUM('PERCENT', 'FIXED_AMOUNT', 'BUY_X_GET_Y', 'FREE_TOPPING') NOT NULL,
    value           DECIMAL(12,2) NOT NULL,       -- 10 (%) hoặc 5000 (VNĐ)
    min_order_value DECIMAL(12,0) DEFAULT 0,
    max_discount    DECIMAL(12,0),                -- Giảm tối đa
    applicable_items JSON,                        -- Menu item IDs áp dụng (NULL = tất cả)
    start_date      TIMESTAMP NOT NULL,
    end_date        TIMESTAMP NOT NULL,
    usage_limit     INT,                          -- Tổng lượt dùng tối đa
    used_count      INT DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    is_ai_suggested BOOLEAN DEFAULT FALSE,        -- AI gợi ý hay tự tạo
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE promotion_usage (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    promotion_id    BIGINT NOT NULL,
    order_id        BIGINT NOT NULL,
    customer_id     BIGINT,
    discount_amount DECIMAL(12,0) NOT NULL,
    used_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- ===================================================
-- 7. AI & BÁO CÁO
-- ===================================================

CREATE TABLE ai_reports (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    report_type     ENUM('DAILY_SUMMARY', 'WEEKLY_ANALYSIS', 'INVENTORY_FORECAST',
                         'MENU_SUGGESTION', 'MARKETING_CONTENT', 'BUSINESS_INSIGHT') NOT NULL,
    title           VARCHAR(300),
    content         TEXT NOT NULL,                 -- Nội dung AI generate
    prompt_used     TEXT,                          -- Prompt gửi cho AI (debug)
    metadata        JSON,                         -- Dữ liệu đầu vào cho AI
    is_bookmarked   BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Lịch sử chat với AI (chatbot advisor)
CREATE TABLE ai_conversations (
    id              BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id         BIGINT NOT NULL,
    session_id      VARCHAR(100) NOT NULL,
    role            ENUM('USER', 'ASSISTANT') NOT NULL,
    message         TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ===================================================
-- 8. INDEXES
-- ===================================================

CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_menu ON order_items(menu_item_id);
CREATE INDEX idx_inventory_logs_ingredient ON inventory_logs(ingredient_id);
CREATE INDEX idx_inventory_logs_created ON inventory_logs(created_at);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_ai_reports_type ON ai_reports(report_type);
CREATE INDEX idx_ai_reports_created ON ai_reports(created_at);
```

---

## 4. CHI TIẾT CÁC MODULE CHỨC NĂNG

---

### MODULE 1: AUTHENTICATION & SETTINGS

#### Chức năng:
- Đăng ký / Đăng nhập (JWT)
- Quản lý profile chủ quán
- Cài đặt thông tin quán (tên, địa chỉ, giờ mở cửa, logo, mạng xã hội)
- Đổi mật khẩu
- Cấu hình AI API key

#### API Endpoints:
```
POST   /api/auth/register          → Đăng ký
POST   /api/auth/login             → Đăng nhập → trả JWT token
POST   /api/auth/refresh           → Refresh token
GET    /api/auth/me                → Thông tin user hiện tại
PUT    /api/auth/change-password   → Đổi mật khẩu
GET    /api/settings               → Lấy cài đặt quán
PUT    /api/settings               → Cập nhật cài đặt quán
POST   /api/settings/logo          → Upload logo quán
```

---

### MODULE 2: DASHBOARD (AI-Powered)

#### Chức năng:
- Hiển thị doanh thu hôm nay / tuần / tháng (so sánh với kỳ trước)
- Top 5 món bán chạy hôm nay
- Cảnh báo nguyên liệu sắp hết (dưới mức min_stock)
- Số đơn hàng hôm nay, giá trị trung bình mỗi đơn
- **[AI] Tóm tắt tình hình kinh doanh bằng ngôn ngữ tự nhiên**
- **[AI] Gợi ý hành động cần làm hôm nay** (nhập kho, chạy KM, đổi menu...)

#### API Endpoints:
```
GET    /api/dashboard/overview           → Dữ liệu tổng quan
GET    /api/dashboard/revenue-summary    → Doanh thu theo khoảng thời gian
GET    /api/dashboard/top-selling        → Top món bán chạy
GET    /api/dashboard/low-stock-alerts   → Cảnh báo tồn kho thấp
GET    /api/dashboard/ai-summary         → [AI] Tóm tắt & gợi ý
```

#### AI Prompt mẫu cho Daily Summary:
```
Bạn là trợ lý AI quản lý quán cà phê. Dựa trên dữ liệu sau, hãy viết tóm tắt
tình hình kinh doanh hôm nay bằng tiếng Việt, ngắn gọn, dễ hiểu. Cuối cùng,
đưa ra 3 gợi ý hành động cụ thể.

DỮ LIỆU HÔM NAY:
- Doanh thu: {revenue} VNĐ (hôm qua: {yesterday_revenue})
- Số đơn: {order_count} (hôm qua: {yesterday_orders})
- Giá trị TB/đơn: {avg_order_value}
- Top 3 món: {top_items}
- Nguyên liệu sắp hết: {low_stock_items}
- Thời tiết: {weather}
- Ngày trong tuần: {day_of_week}

Hãy phân tích xu hướng và đưa gợi ý thực tế.
```

---

### MODULE 3: QUẢN LÝ MENU

#### Chức năng CRUD:
- Thêm / sửa / xóa danh mục (categories)
- Thêm / sửa / xóa món (menu items)
- Upload ảnh món
- Quản lý topping
- Bật/tắt trạng thái có sẵn (is_available)
- Thiết lập công thức (recipe) — mapping nguyên liệu cho mỗi món
- Tự động tính giá vốn (cost_price) từ recipe

#### Chức năng AI:
- **[AI] Phân tích hiệu suất menu (Menu Engineering Matrix):**
  - Phân loại mỗi món vào 4 nhóm: Star (bán nhiều + lãi cao), Puzzle (bán ít + lãi cao), Plow Horse (bán nhiều + lãi thấp), Dog (bán ít + lãi thấp)
  - Gợi ý: giữ Star, quảng bá Puzzle, tăng giá Plow Horse, bỏ Dog
- **[AI] Gợi ý món mới:**
  - Dựa trên nguyên liệu đang có, trend thị trường, mùa
  - VD: "Bạn có nhiều matcha và sữa tươi, thử thêm Matcha Latte đá xay, giá đề xuất 45.000đ"
- **[AI] Gợi ý giá bán** dựa trên chi phí nguyên liệu và biên lợi nhuận mong muốn

#### API Endpoints:
```
GET    /api/categories                   → Danh sách danh mục
POST   /api/categories                   → Thêm danh mục
PUT    /api/categories/{id}              → Sửa danh mục
DELETE /api/categories/{id}              → Xóa danh mục

GET    /api/menu-items                   → Danh sách menu (filter by category, search)
GET    /api/menu-items/{id}              → Chi tiết món
POST   /api/menu-items                   → Thêm món
PUT    /api/menu-items/{id}              → Sửa món
DELETE /api/menu-items/{id}              → Xóa món
PATCH  /api/menu-items/{id}/toggle       → Bật/tắt trạng thái
POST   /api/menu-items/{id}/image        → Upload ảnh món

GET    /api/menu-items/{id}/recipe       → Lấy công thức
POST   /api/menu-items/{id}/recipe       → Thiết lập/cập nhật công thức
GET    /api/menu-items/{id}/cost         → Tính giá vốn từ recipe

GET    /api/toppings                     → Danh sách topping
POST   /api/toppings                     → Thêm topping
PUT    /api/toppings/{id}                → Sửa topping

POST   /api/menu/ai/analyze             → [AI] Phân tích menu engineering
POST   /api/menu/ai/suggest-new         → [AI] Gợi ý món mới
POST   /api/menu/ai/suggest-price       → [AI] Gợi ý giá bán
```

---

### MODULE 4: POS (POINT OF SALE) — QUẢN LÝ ĐƠN HÀNG

#### Chức năng:
- Giao diện order nhanh (grid các món, chọn → thêm vào giỏ)
- Chọn size (S/M/L) và topping cho mỗi món
- Ghi chú cho từng món (ít đường, nhiều đá, không đá...)
- Chọn loại đơn: Tại quán / Mang đi / Online
- Chọn bàn (nếu tại quán) — hỗ trợ sơ đồ bàn đơn giản
- Áp dụng khuyến mãi / mã giảm giá
- Tính tổng tiền tự động
- Chọn phương thức thanh toán (Tiền mặt, Chuyển khoản, MoMo, ZaloPay)
- In hóa đơn (generate PDF hoặc thermal print format)
- Khi hoàn thành đơn → tự động trừ kho (AUTO_DEDUCT) theo recipe
- Tự động cộng điểm loyalty cho khách quen

#### Xử lý nghiệp vụ khi tạo đơn:
```
1. Tạo Order (status = PENDING)
2. Thêm OrderItems + Toppings
3. Tính subtotal, discount, tax, total
4. Khi chuyển status → COMPLETED:
   a. Với mỗi order_item:
      - Lấy recipe của menu_item
      - Trừ ingredient.current_stock theo quantity × recipe.quantity
      - Tạo inventory_log (action = AUTO_DEDUCT, reference_id = order.id)
   b. Cập nhật menu_item.total_sold
   c. Nếu có customer: cập nhật total_orders, total_spent, loyalty_points
   d. Cập nhật promotion.used_count nếu dùng KM
```

#### API Endpoints:
```
POST   /api/orders                       → Tạo đơn hàng mới
GET    /api/orders                       → Danh sách đơn (filter, pagination, date range)
GET    /api/orders/{id}                  → Chi tiết đơn
PATCH  /api/orders/{id}/status           → Cập nhật trạng thái (PENDING → PREPARING → COMPLETED)
PATCH  /api/orders/{id}/cancel           → Hủy đơn (hoàn kho nếu đã trừ)
POST   /api/orders/{id}/payment          → Xác nhận thanh toán
GET    /api/orders/{id}/receipt           → Generate hóa đơn PDF
GET    /api/orders/today                 → Đơn hàng hôm nay
```

---

### MODULE 5: QUẢN LÝ KHO NGUYÊN LIỆU (AI-Powered)

#### Chức năng CRUD:
- Quản lý danh sách nguyên liệu
- Quản lý nhà cung cấp
- Nhập kho (tạo inventory_log với action = IMPORT)
- Xuất kho thủ công (action = EXPORT)
- Điều chỉnh kho (action = ADJUST) — kiểm kê thực tế
- Xem lịch sử nhập/xuất chi tiết
- Thiết lập mức tồn kho tối thiểu (min_stock)
- Cảnh báo khi tồn kho dưới min_stock

#### Chức năng AI:
- **[AI] Dự báo nhu cầu nguyên liệu (Demand Forecasting):**
  - Phân tích lịch sử bán hàng 30 ngày gần nhất
  - Dự đoán lượng tiêu thụ tuần tới cho mỗi nguyên liệu
  - Tính toán ngày nào cần nhập hàng
  - Gợi ý số lượng nhập tối ưu (đủ dùng X ngày, không thừa quá Y ngày)
- **[AI] Phát hiện bất thường:**
  - Nguyên liệu tiêu thụ nhanh hơn bình thường → cảnh báo (có thể lãng phí hoặc nhu cầu tăng)
  - Nguyên liệu sắp hết hạn
- **[AI] Tối ưu chi phí nhập hàng:**
  - So sánh giá nhập qua các lần, phát hiện xu hướng tăng giá
  - Gợi ý thay đổi nhà cung cấp hoặc nguyên liệu thay thế

#### API Endpoints:
```
GET    /api/ingredients                  → Danh sách nguyên liệu (search, filter)
POST   /api/ingredients                  → Thêm nguyên liệu
PUT    /api/ingredients/{id}             → Sửa thông tin
DELETE /api/ingredients/{id}             → Xóa

GET    /api/suppliers                    → Danh sách NCC
POST   /api/suppliers                    → Thêm NCC
PUT    /api/suppliers/{id}               → Sửa NCC

POST   /api/inventory/import             → Nhập kho (1 hoặc nhiều nguyên liệu)
POST   /api/inventory/export             → Xuất kho
POST   /api/inventory/adjust             → Điều chỉnh kiểm kê
GET    /api/inventory/logs               → Lịch sử nhập/xuất (filter by ingredient, date, action)
GET    /api/inventory/low-stock          → Nguyên liệu dưới mức tối thiểu

POST   /api/inventory/ai/forecast        → [AI] Dự báo nhu cầu tuần tới
POST   /api/inventory/ai/anomaly         → [AI] Phát hiện bất thường
POST   /api/inventory/ai/cost-optimize   → [AI] Gợi ý tối ưu chi phí
```

#### AI Prompt mẫu cho Inventory Forecast:
```
Bạn là chuyên gia quản lý kho cho quán cà phê nhỏ. Phân tích dữ liệu sau
và dự đoán nhu cầu nguyên liệu cho 7 ngày tới.

LỊCH SỬ TIÊU THỤ 30 NGÀY:
{ingredient_consumption_data}

TỒN KHO HIỆN TẠI:
{current_stock_data}

MỨC TỐI THIỂU:
{min_stock_data}

YÊU CẦU:
1. Dự đoán lượng tiêu thụ mỗi ngày (có tính ngày trong tuần)
2. Nguyên liệu nào cần nhập trước?
3. Gợi ý số lượng nhập cụ thể
4. Ước tính chi phí nhập hàng

Trả lời bằng tiếng Việt, dạng JSON + giải thích.
```

---

### MODULE 6: QUẢN LÝ KHÁCH HÀNG & LOYALTY

#### Chức năng:
- Thêm / sửa / xem thông tin khách hàng
- Xem lịch sử mua hàng của khách
- Hệ thống tích điểm (loyalty):
  - Mỗi 10.000đ = 1 điểm
  - Đổi điểm lấy giảm giá hoặc free drink
  - Tự động nâng hạng: Normal → Silver (100 điểm) → Gold (500) → Platinum (1000)
- **[AI] Phân nhóm khách hàng:**
  - Khách mới, khách quen, khách VIP, khách sắp rời bỏ (churn prediction)
  - Gợi ý hành động: gửi ưu đãi cho khách sắp rời, cảm ơn khách VIP
- **[AI] Gợi ý khuyến mãi cá nhân hóa** dựa trên lịch sử mua

#### API Endpoints:
```
GET    /api/customers                    → Danh sách khách (search, filter tier)
GET    /api/customers/{id}               → Chi tiết khách + lịch sử mua
POST   /api/customers                    → Thêm khách mới
PUT    /api/customers/{id}               → Cập nhật thông tin
GET    /api/customers/{id}/orders        → Lịch sử đơn hàng của khách
GET    /api/customers/{id}/loyalty       → Lịch sử tích/đổi điểm
POST   /api/customers/{id}/redeem        → Đổi điểm

POST   /api/customers/ai/segment        → [AI] Phân nhóm khách hàng
POST   /api/customers/ai/churn          → [AI] Dự đoán khách sắp rời
POST   /api/customers/ai/personalize    → [AI] Gợi ý KM cá nhân hóa cho 1 khách
```

---

### MODULE 7: AI MARKETING ASSISTANT

#### Chức năng:
- **[AI] Tạo caption quảng cáo:**
  - Input: chọn món muốn quảng cáo + tone (vui nhộn / chuyên nghiệp / thân thiện)
  - Output: 3 phiên bản caption cho Facebook, Instagram, TikTok
- **[AI] Gợi ý chương trình khuyến mãi:**
  - Phân tích doanh thu, tồn kho, và hành vi khách
  - VD: "Cà phê sữa bán chậm vào thứ 3, gợi ý combo Thứ 3 vui vẻ giảm 20%"
- **[AI] Lên lịch đăng bài** (gợi ý khung giờ + ngày tốt nhất dựa trên engagement)
- Quản lý promotions (CRUD) — bao gồm cả promotion tự tạo và AI suggested
- Xem thống kê hiệu quả khuyến mãi

#### API Endpoints:
```
POST   /api/marketing/ai/caption        → [AI] Tạo caption MXH
POST   /api/marketing/ai/promotion      → [AI] Gợi ý chương trình KM
POST   /api/marketing/ai/schedule       → [AI] Gợi ý lịch đăng bài
POST   /api/marketing/ai/hashtag        → [AI] Gợi ý hashtag trending

GET    /api/promotions                   → Danh sách KM
POST   /api/promotions                   → Tạo KM mới
PUT    /api/promotions/{id}              → Sửa KM
DELETE /api/promotions/{id}              → Xóa KM
GET    /api/promotions/{id}/stats        → Thống kê hiệu quả KM
```

#### AI Prompt mẫu cho Caption Generation:
```
Bạn là copywriter chuyên viết content cho quán cà phê trên mạng xã hội tại Việt Nam.

THÔNG TIN QUÁN: {shop_name}, {address}
MÓN QUẢNG CÁO: {item_name} - Giá: {price}
MÔ TẢ MÓN: {description}
TONE: {tone} (vui nhộn / chuyên nghiệp / thân thiện / gen-z)
PLATFORM: {platform} (Facebook / Instagram / TikTok)
KHUYẾN MÃI ĐANG CÓ: {current_promotions}

Hãy viết 3 phiên bản caption (ngắn, vừa, dài) phù hợp platform, có emoji,
có call-to-action, và hashtag liên quan. Sử dụng ngôn ngữ tự nhiên của người Việt.
```

---

### MODULE 8: AI CHATBOT (Tư vấn khách hàng & Cố vấn kinh doanh)

#### 8A. Customer Chatbot (Public - nhúng trên website quán):
- Trả lời hỏi về menu, giá, topping
- Giờ mở cửa, địa chỉ, wifi
- Gợi ý món dựa trên sở thích ("Tôi thích đồ ngọt" → gợi ý)
- Nhận đơn online đơn giản
- FAQ tự động

#### 8B. Business Advisor Chatbot (Private - cho chủ quán):
- Hỏi đáp về tình hình kinh doanh: "Hôm nay bán được bao nhiêu?"
- "Món nào lãi nhất tháng này?"
- "Tôi nên nhập thêm gì tuần tới?"
- "Gợi ý cách tăng doanh thu?"
- Chat tự do, AI truy vấn database để trả lời

#### Cách hoạt động:
```
User message → Backend nhận →
  1. Phân loại intent (menu_inquiry, order, business_question...)
  2. Nếu cần dữ liệu: query database
  3. Gộp context + user message → gửi AI API
  4. AI trả lời → lưu ai_conversations → trả về FE
```

#### API Endpoints:
```
POST   /api/chatbot/customer/message     → Chatbot khách hàng
POST   /api/chatbot/advisor/message      → Chatbot cố vấn (yêu cầu auth)
GET    /api/chatbot/advisor/history       → Lịch sử chat cố vấn
DELETE /api/chatbot/advisor/session       → Xóa phiên chat
```

---

### MODULE 9: BÁO CÁO & PHÂN TÍCH (AI-Powered)

#### Báo cáo truyền thống (biểu đồ):
- Doanh thu theo ngày / tuần / tháng / năm (Line Chart)
- Doanh thu theo khung giờ trong ngày (Bar Chart) — biết giờ cao điểm
- Tỷ lệ doanh thu theo danh mục (Pie Chart)
- Top 10 món bán chạy (Horizontal Bar)
- Chi phí nguyên liệu theo tháng
- Lợi nhuận gộp theo món (revenue - cost)
- Số lượng khách mới vs khách quay lại
- Tỷ lệ phương thức thanh toán

#### AI Analysis:
- **[AI] Phân tích xu hướng tuần/tháng:**
  Nhận diện pattern (cuối tuần bán nhiều hơn, tháng nào peak...)
- **[AI] So sánh kỳ hiện tại vs kỳ trước:**
  Tự động viết đánh giá tăng/giảm và lý do
- **[AI] Dự báo doanh thu:**
  Dựa trên historical data, dự đoán doanh thu tuần/tháng tới
- **[AI] Gợi ý cải thiện:**
  "Doanh thu thứ 2-3 thấp, thử chạy KM đầu tuần"

#### API Endpoints:
```
GET    /api/reports/revenue              → Doanh thu (params: from, to, group_by)
GET    /api/reports/revenue-by-hour      → Doanh thu theo giờ
GET    /api/reports/revenue-by-category  → Doanh thu theo danh mục
GET    /api/reports/top-items            → Top món bán chạy
GET    /api/reports/profit-by-item       → Lợi nhuận gộp theo món
GET    /api/reports/cost-summary         → Tổng hợp chi phí
GET    /api/reports/customer-stats       → Thống kê khách hàng
GET    /api/reports/payment-methods      → Thống kê PTTT

POST   /api/reports/ai/weekly-analysis   → [AI] Phân tích tuần
POST   /api/reports/ai/forecast          → [AI] Dự báo doanh thu
POST   /api/reports/ai/improvement       → [AI] Gợi ý cải thiện
GET    /api/reports/ai/history           → Lịch sử báo cáo AI đã tạo
```

---

## 5. TỔNG HỢP ĐIỂM TÍCH HỢP AI

| # | Tính năng AI | Module | Input | Output |
|---|-------------|--------|-------|--------|
| 1 | Tóm tắt kinh doanh hàng ngày | Dashboard | Dữ liệu bán hàng, kho, thời tiết | Đoạn văn tóm tắt + 3 gợi ý |
| 2 | Phân tích Menu Engineering | Menu | Doanh số + giá vốn mỗi món | Ma trận Star/Puzzle/PlowHorse/Dog |
| 3 | Gợi ý món mới | Menu | Nguyên liệu có sẵn + trend | Tên món, recipe, giá đề xuất |
| 4 | Gợi ý giá bán | Menu | Chi phí NL + biên lãi mong muốn | Giá bán đề xuất + phân tích |
| 5 | Dự báo nhu cầu kho | Inventory | Lịch sử tiêu thụ 30 ngày | Dự đoán 7 ngày + SL nhập gợi ý |
| 6 | Phát hiện bất thường kho | Inventory | Tốc độ tiêu thụ | Cảnh báo + giải thích |
| 7 | Tối ưu chi phí nhập | Inventory | Lịch sử giá nhập | Xu hướng giá + gợi ý NCC |
| 8 | Phân nhóm khách hàng | Customer | Lịch sử mua hàng | Segment + gợi ý hành động |
| 9 | Dự đoán churn | Customer | Tần suất mua + thời gian | Danh sách khách sắp rời |
| 10 | KM cá nhân hóa | Customer | Profile + lịch sử | Ưu đãi phù hợp từng khách |
| 11 | Tạo caption MXH | Marketing | Thông tin món + tone | 3 phiên bản caption |
| 12 | Gợi ý chương trình KM | Marketing | Doanh thu + kho + khách | KM phù hợp thời điểm |
| 13 | Chatbot khách hàng | Chatbot | Câu hỏi khách | Trả lời tự nhiên |
| 14 | Chatbot cố vấn kinh doanh | Chatbot | Câu hỏi chủ quán | Phân tích + tư vấn từ data |
| 15 | Phân tích xu hướng | Reports | Data tuần/tháng | Nhận xét + pattern |
| 16 | Dự báo doanh thu | Reports | Historical data | Dự đoán tuần/tháng tới |

---

## 6. FLOW NGHIỆP VỤ CHÍNH

### Flow 1: Bán hàng (POS)
```
Chủ quán mở POS → Chọn món từ grid → Chọn size + topping →
Thêm ghi chú → Vào giỏ hàng → Áp mã KM (nếu có) →
Chọn khách hàng (nếu quen) → Chọn PTTT → Xác nhận →
    → Tạo Order (PENDING)
    → Pha chế xong → Chuyển COMPLETED
    → Auto: trừ kho, cộng điểm, tăng total_sold
    → Hiển thị hóa đơn
```

### Flow 2: Nhập kho
```
Hàng về → Vào trang Inventory → Chọn "Nhập kho" →
Chọn nguyên liệu + SL + giá nhập + NCC →
    → Tạo inventory_log (IMPORT)
    → Cập nhật ingredient.current_stock
    → Cập nhật ingredient.unit_cost (giá nhập mới nhất)
```

### Flow 3: AI Forecast kho
```
Cuối ngày / đầu tuần → Dashboard cảnh báo "X nguyên liệu sắp hết" →
Chủ quán click "Xem dự báo AI" →
    → Backend collect: 30-day consumption + current stock + recipes
    → Gửi prompt → AI API
    → Trả về: dự báo 7 ngày, nguyên liệu cần nhập, SL gợi ý, chi phí ước tính
    → Chủ quán review → nhập kho theo gợi ý
```

### Flow 4: AI Marketing
```
Chủ quán muốn đăng bài → Vào Marketing → Chọn "Tạo caption" →
Chọn món / KM muốn quảng cáo → Chọn tone + platform →
    → AI generate 3 phiên bản
    → Chủ quán chọn 1, chỉnh sửa nếu cần → Copy → Đăng MXH
```

---

## 7. MÀN HÌNH UI CHÍNH (Wireframe Description)

### 7.1 Layout chung
- **Sidebar trái** (co lại được): Logo quán, menu điều hướng (Dashboard, POS, Menu, Kho, Khách hàng, Marketing, Báo cáo, Chatbot AI, Cài đặt)
- **Header trên**: Tên trang hiện tại, icon thông báo (cảnh báo kho), avatar chủ quán
- **Main content**: Nội dung chính
- **Màu sắc gợi ý**: Tông nâu cà phê (warm brown) + trắng kem + accent xanh lá nhẹ

### 7.2 Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  [Card] Doanh thu     [Card] Số đơn    [Card] TB/đơn   │
│  ₫2.450.000 ↑12%     42 đơn ↑5%       ₫58.300         │
├─────────────────────────────────────────────────────────┤
│  [AI Insight Card - full width]                         │
│  🤖 "Hôm nay doanh thu tốt hơn hôm qua 12%. Cà phê   │
│  sữa đá vẫn dẫn đầu. Sữa đặc chỉ còn đủ dùng 2      │
│  ngày, nên nhập thêm. Thời tiết nắng → đẩy đồ đá."    │
│  [Xem chi tiết] [Gợi ý hôm nay]                       │
├──────────────────────────┬──────────────────────────────┤
│  [Line Chart]            │  [Bar Chart - Horizontal]    │
│  Doanh thu 7 ngày        │  Top 5 món bán chạy          │
│                          │  1. Cà phê sữa đá: 15       │
│                          │  2. Bạc xỉu: 12             │
├──────────────────────────┴──────────────────────────────┤
│  [Alert Cards] ⚠️ Cảnh báo kho                         │
│  🔴 Sữa đặc: còn 200ml (min: 500ml) [Nhập kho]        │
│  🟡 Đường: còn 300g (min: 500g) [Nhập kho]             │
└─────────────────────────────────────────────────────────┘
```

### 7.3 POS
```
┌──────────────────────────────────┬──────────────────────┐
│  [Category Tabs]                 │  GIỎ HÀNG            │
│  ☕Cà phê | 🍵Trà | 🧃Nước ép   │                      │
│                                  │  Cà phê sữa đá (M)  │
│  ┌─────┐ ┌─────┐ ┌─────┐       │  x1  ₫29,000  [🗑]   │
│  │ ☕  │ │ ☕  │ │ ☕  │       │  + Trân châu ₫5,000  │
│  │CF sữa│ │Bạc xỉu│ │CF đen│   │                      │
│  │29k   │ │32k   │ │25k   │    │  Bạc xỉu (L)        │
│  └─────┘ └─────┘ └─────┘       │  x2  ₫76,000  [🗑]   │
│  ┌─────┐ ┌─────┐ ┌─────┐       │                      │
│  │ 🍵 │ │ 🍵  │ │ 🧃  │       │  ─────────────────── │
│  │Trà đào│ │Matcha│ │Cam ép│    │  Tạm tính: ₫110,000 │
│  │35k   │ │40k   │ │30k   │    │  Giảm giá: -₫10,000 │
│  └─────┘ └─────┘ └─────┘       │  TỔNG: ₫100,000     │
│                                  │                      │
│  [Search: Tìm món...]           │  [Mã KM: ______]     │
│                                  │  Khách: [Chọn/Thêm]  │
│                                  │  PTTT: 💵 📱 💳      │
│                                  │                      │
│                                  │  [🟢 THANH TOÁN]     │
└──────────────────────────────────┴──────────────────────┘
```

---

## 8. AI SERVICE ARCHITECTURE (Backend)

### 8.1 Cách tổ chức AI Service trong Spring Boot

```java
// Interface chung
public interface AIService {
    String chat(String systemPrompt, String userMessage);
    String chatWithContext(String systemPrompt, String userMessage, List<ChatMessage> history);
}

// Implementation cho OpenAI
@Service
public class OpenAIServiceImpl implements AIService {
    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.model}")
    private String model; // gpt-4o-mini (rẻ) hoặc gpt-4o

    private final RestTemplate restTemplate;

    @Override
    public String chat(String systemPrompt, String userMessage) {
        // Gọi OpenAI API
        // POST https://api.openai.com/v1/chat/completions
    }
}

// Service cụ thể cho từng module
@Service
public class InventoryAIService {
    private final AIService aiService;
    private final IngredientRepository ingredientRepo;
    private final InventoryLogRepository logRepo;
    private final PromptTemplateService promptService;

    public InventoryForecastDTO forecast() {
        // 1. Thu thập data từ DB
        var consumption = logRepo.getLast30DaysConsumption();
        var currentStock = ingredientRepo.findAll();

        // 2. Build prompt từ template + data
        String prompt = promptService.build("inventory-forecast", Map.of(
            "consumption", consumption,
            "stock", currentStock
        ));

        // 3. Gọi AI
        String response = aiService.chat(SYSTEM_PROMPT, prompt);

        // 4. Parse response → DTO
        return parseForcastResponse(response);
    }
}
```

### 8.2 Quản lý Prompt Template
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

Mỗi file chứa prompt template với placeholder `{variable}` để thay thế bằng dữ liệu thực.

---

## 9. DỮ LIỆU MẪU (Seed Data)

### Categories:
- Cà phê (Cà phê sữa đá, Bạc xỉu, Cà phê đen, Espresso, Cappuccino, Latte)
- Trà (Trà đào, Trà vải, Trà ổi, Matcha Latte, Trà sữa trân châu)
- Nước ép & Sinh tố (Cam ép, Dưa hấu, Bơ, Xoài)
- Đá xay (Cà phê đá xay, Chocolate đá xay, Matcha đá xay)
- Bánh & Snack (Bánh mì, Croissant, Cookie, Bánh flan)

### Ingredients (20+):
Cà phê robusta, Cà phê arabica, Sữa đặc, Sữa tươi, Đường trắng, Syrup caramel, Syrup vanilla, Bột matcha, Bột cacao, Trân châu đen, Trân châu trắng, Đào miếng, Vải miếng, Cam tươi, Dưa hấu, Bơ, Xoài, Đá viên, Whipping cream, Bột kem béo...

### Sample Orders:
Seed 200-300 orders trong 30 ngày gần nhất (random thời gian, random món, random số lượng) để AI có đủ dữ liệu phân tích.

---

## 10. KẾ HOẠCH TRIỂN KHAI (Gợi ý)

### Phase 1 — Nền tảng (Tuần 1-2)
- Setup project (Spring Boot + Next.js)
- Database schema + migration
- Auth module (register/login/JWT)
- CRUD: Categories, Menu Items, Ingredients
- Seed data

### Phase 2 — Nghiệp vụ cốt lõi (Tuần 3-4)
- POS: giao diện order, tạo đơn, thanh toán
- Recipe management (mapping món ↔ nguyên liệu)
- Inventory: nhập/xuất kho, auto-deduct khi bán
- Customer CRUD + Loyalty cơ bản

### Phase 3 — Tích hợp AI (Tuần 5-7)
- Setup AI Service (OpenAI/Gemini integration)
- Dashboard AI Summary
- Inventory AI Forecast
- Menu AI Analysis
- Marketing Caption Generator
- Chatbot (customer + advisor)

### Phase 4 — Reports & Polish (Tuần 8-9)
- Report charts (Recharts)
- AI Report Analysis
- Promotion management
- UI polish, responsive
- Testing, fix bugs

### Phase 5 — Hoàn thiện (Tuần 10)
- Viết báo cáo
- Chuẩn bị slide thuyết trình
- Demo video
- Deploy (nếu cần)

---

## 11. GỢI Ý DEMO ẤN TƯỢNG

Khi demo bài tập lớn, nên show theo kịch bản "Một ngày của chủ quán":

1. **Sáng:** Mở Dashboard → AI tóm tắt hôm qua + gợi ý hôm nay
2. **Bán hàng:** Demo POS order 2-3 đơn → thấy kho tự trừ
3. **Trưa:** Check kho → AI cảnh báo sữa sắp hết → xem forecast → nhập kho
4. **Chiều:** Vào Marketing → AI tạo caption cho món mới → copy đăng FB
5. **Tối:** Xem báo cáo → AI phân tích xu hướng tuần → gợi ý cải thiện
6. **Bonus:** Mở chatbot advisor hỏi "Tháng này nên làm gì để tăng doanh thu?" → AI trả lời chi tiết từ data thực

---

*Tài liệu được tạo để triển khai bài tập lớn môn Phát triển hệ thống thông tin quản lý.*
