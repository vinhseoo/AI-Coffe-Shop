# TIẾN TRÌNH THỰC HIỆN DỰ ÁN
## Hệ thống AI Hỗ trợ Quản lý Quán Cà phê

Tài liệu này ghi lại **những gì đã được thực hiện** theo từng giai đoạn và từng module. Cập nhật mỗi khi hoàn thành một tính năng.

---

## GIAI ĐOẠN 0 — KHỞI TẠO & NỀN TẢNG CHUNG (Base/Common)

### ✅ Backend — Base đã hoàn thành
| Hạng mục | File | Mô tả |
|----------|------|--------|
| ✅ Spring Boot project | `pom.xml` | Khởi tạo với dependencies: JPA, Security, Validation, Web, MySQL, Lombok, JWT, Swagger |
| ✅ Application config | `application.properties` | Cấu hình DB, JWT, Gemini, CORS, Swagger, logging |
| ✅ BaseEntity | `model/entity/BaseEntity.java` | Auditing fields: createdAt, updatedAt, createdBy, updatedBy |
| ✅ JPA Auditing | `config/JpaConfig.java` | Tự động fill createdBy/updatedBy từ Spring Security context |
| ✅ API Response wrapper | `model/dto/response/ApiResponse.java` | Chuẩn response cho toàn hệ thống |
| ✅ Paged Response | `model/dto/response/PagedResponse.java` | Chuẩn response phân trang |
| ✅ Error codes | `exception/ErrorCode.java` | Enum mã lỗi toàn hệ thống |
| ✅ App Exception | `exception/AppException.java` | Custom exception kế thừa RuntimeException |
| ✅ Global Exception Handler | `exception/GlobalExceptionHandler.java` | Xử lý lỗi tập trung |
| ✅ Security Config | `config/SecurityConfig.java` | JWT filter chain, CORS, public routes |
| ✅ Gemini Config | `config/GeminiConfig.java` | Bean RestTemplate + API key injection cho Google Gemini |
| ✅ JWT Token Provider | `security/JwtTokenProvider.java` | Generate, validate, extract JWT token |
| ✅ JWT Auth Filter | `security/JwtAuthenticationFilter.java` | Intercept và authenticate JWT per-request |
| ✅ User Details Service | `security/UserDetailsServiceImpl.java` | Spring Security UserDetails integration |
| ✅ Enums | `model/enums/*.java` | UserRole, OrderStatus, PaymentMethod, InventoryAction, CustomerTier, PromotionType |
| ✅ Date Utils | `util/DateUtils.java` | Helper thao tác ngày tháng |

### ✅ Frontend — Base đã hoàn thành
| Hạng mục | File | Mô tả |
|----------|------|--------|
| ✅ Next.js project setup | `package.json` | Axios, Zustand, Tailwind v4, clsx, tailwind-merge |
| ✅ Axios instance | `lib/api.ts` | Interceptors: auto attach token, 401 redirect, error format |
| ✅ Utilities | `lib/utils.ts` | cn(), formatCurrency(), formatDate(), formatNumber(), debounce(), truncate() |
| ✅ API Types | `types/api.ts` | ApiResponse, PagedResponse, ApiError, User, ShopSettings |
| ✅ Domain Types | `types/menu.ts`, `types/order.ts`, `types/inventory.ts`, `types/ai.ts` | Type definitions cho tất cả domain |
| ✅ Auth Store | `store/authStore.ts` | Zustand + persist: user, token, isAuthenticated |
| ✅ Cart Store | `store/cartStore.ts` | POS cart: thêm/xóa/sửa item, tính tổng |
| ✅ Order Store | `store/orderStore.ts` | Danh sách đơn hàng, filter state |
| ✅ useAuth Hook | `hooks/useAuth.ts` | Auth guard + RBAC redirect + hydration handling |
| ✅ useToast Hook | `hooks/useToast.ts` | Global toast notifications |
| ✅ Button component | `components/ui/Button.tsx` | Variants: primary, secondary, outline, ghost, danger |
| ✅ Card component | `components/ui/Card.tsx` | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| ✅ Input component | `components/ui/Input.tsx` | Label, error, helperText support |
| ✅ TextArea component | `components/ui/TextArea.tsx` | Multi-line input |
| ✅ Select component | `components/ui/Select.tsx` | Dropdown select với options |
| ✅ Modal component | `components/ui/Modal.tsx` | Sizes, Escape key, backdrop click |
| ✅ Spinner component | `components/ui/Spinner.tsx` | Loading indicator |
| ✅ Toast component | `components/ui/Toast.tsx` | Success, error, warning, info notifications |
| ✅ Table component | `components/ui/Table.tsx` | Reusable data table |
| ✅ Badge component | `components/ui/Badge.tsx` | Status badges với màu sắc |
| ✅ Skeleton component | `components/ui/Skeleton.tsx` | Loading placeholder |
| ✅ Pagination component | `components/ui/Pagination.tsx` | Phân trang |
| ✅ Alert component | `components/ui/Alert.tsx` | Info/warning/error/success alert |
| ✅ Route middleware | `middleware.ts` | Bảo vệ private routes |
| ✅ Root Layout | `app/layout.tsx` | ToastProvider, metadata, font |

---

## GIAI ĐOẠN 1 — AUTH & SETTINGS MODULE ✅

### ✅ Backend
| Hạng mục | File | Mô tả |
|----------|------|--------|
| ✅ DB Migration | `db/migration/V1__init_auth_tables.sql` | Tạo bảng `users` + `shop_settings` |
| ✅ User Entity | `model/entity/User.java` | username, email, passwordHash, role, isActive |
| ✅ ShopSettings Entity | `model/entity/ShopSettings.java` | @OneToOne User, giờ mở/đóng, taxRate |
| ✅ Auth DTOs | `dto/request/auth/` | RegisterRequest, LoginRequest, ChangePasswordRequest |
| ✅ Settings DTO | `dto/request/settings/ShopSettingsRequest.java` | Validation: time format, taxRate range |
| ✅ Auth Responses | `dto/response/auth/` | UserResponse, AuthResponse với factory methods |
| ✅ Settings Response | `dto/response/settings/ShopSettingsResponse.java` | Format LocalTime → "HH:mm" |
| ✅ UserRepository | `repository/UserRepository.java` | findByUsername, findByEmail, existsBy... |
| ✅ ShopSettingsRepository | `repository/ShopSettingsRepository.java` | findByUserId |
| ✅ AuthService | `service/AuthService.java` | register, login, getCurrentUser, changePassword |
| ✅ ShopSettingsService | `service/ShopSettingsService.java` | getSettings, updateSettings |
| ✅ UserDetailsServiceImpl | `security/UserDetailsServiceImpl.java` | Wired với UserRepository |
| ✅ AuthController | `controller/AuthController.java` | POST /register, /login, GET /me, PUT /change-password |
| ✅ ShopSettingsController | `controller/ShopSettingsController.java` | GET + PUT /api/settings |

### ✅ Frontend
| Hạng mục | File | Mô tả |
|----------|------|--------|
| ✅ auth.ts | `lib/auth.ts` | login(), register(), logout() + cookie dual-write |
| ✅ settingsStore | `store/settingsStore.ts` | Zustand store: settings, isLoaded |
| ✅ useSettings Hook | `hooks/useSettings.ts` | Fetch + updateSettings + toast |
| ✅ Sidebar | `components/layout/Sidebar.tsx` | Nav icons, collapsible, active state, shopName |
| ✅ Header | `components/layout/Header.tsx` | Page title, user avatar, dropdown, logout |
| ✅ MainLayout | `components/layout/MainLayout.tsx` | Sidebar + Header + main |
| ✅ Dashboard Layout | `app/(dashboard)/layout.tsx` | Auth guard + Spinner |
| ✅ Login Page | `app/login/page.tsx` | Coffee gradient design, validation |
| ✅ Register Page | `app/register/page.tsx` | Same design, 6 fields |
| ✅ Settings Page | `app/(dashboard)/settings/page.tsx` | Tab: thông tin quán + đổi mật khẩu |
| ✅ Dashboard Page | `app/(dashboard)/dashboard/page.tsx` | Placeholder với stat cards + chart placeholder |
| ✅ Root Page | `app/page.tsx` | Redirect → /dashboard |

---

## GIAI ĐOẠN 2 — DASHBOARD MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 3 — MENU MODULE ✅

### ✅ Backend
| Hạng mục | File | Mô tả |
|----------|------|--------|
| ✅ DB Migration | `db/migration/V2__init_menu_tables.sql` | Schema cho categories, menu_items, toppings, suppliers, ingredients, recipe_ingredients + seed data |
| ✅ JPA Entities | `model/entity/*.java` | Category, MenuItem, Topping, Supplier, Ingredient, RecipeIngredient |
| ✅ Enums | `model/enums/ProductSize.java` | S, M, L sizes cho MenuItem |
| ✅ Repositories | `repository/*.java` | Category, MenuItem, Topping, RecipeIngredient, Ingredient, Supplier Repositories |
| ✅ Request DTOs | `model/dto/request/menu/*.java` | CategoryRequest, MenuItemRequest, ToppingRequest, RecipeRequest, RecipeItemRequest |
| ✅ Response DTOs | `model/dto/response/menu/*.java` | CategoryResponse, MenuItemResponse, MenuItemDetailResponse, ToppingResponse, RecipeIngredientResponse, IngredientResponse, MenuAnalysisResponse, MenuAnalysisItem, NewMenuSuggestion, PriceSuggestion |
| ✅ Services | `service/*.java` | CategoryService, MenuItemService, ToppingService, IngredientService |
| ✅ AI Service | `service/ai/MenuAIService.java` | Tích hợp OpenAI: phân tích ma trận menu engineering, gợi ý món mới, định giá bán |
| ✅ AI Prompts | `resources/prompts/*.txt` | menu-analysis.txt, menu-suggest-new.txt, menu-suggest-price.txt |
| ✅ Controllers | `controller/*.java` | CategoryController, MenuItemController, ToppingController, IngredientController, MenuAIController |

### ✅ Frontend
| Hạng mục | File | Mô tả |
|----------|------|--------|
| ✅ useMenu Hook | `hooks/useMenu.ts` | Custom hook kết nối API cho thực đơn, danh mục, topping, công thức và AI |
| ✅ MenuItemCard | `components/menu/MenuItemCard.tsx` | Card hiển thị thông tin món, giá, vốn, toggle bán |
| ✅ MenuGrid | `components/menu/MenuGrid.tsx` | Grid chứa danh sách card món ăn, hiển thị skeleton và empty state |
| ✅ MenuItemForm | `components/menu/MenuItemForm.tsx` | Form modal thêm/sửa món ăn, validate đầu vào |
| ✅ RecipeEditor | `components/menu/RecipeEditor.tsx` | Quản lý công thức (lượng nguyên liệu), tính giá vốn động, định giá AI |
| ✅ AIMenuAnalysis | `components/menu/AIMenuAnalysis.tsx` | Hiển thị ma trận 4 nhóm (Stars, Puzzles, Plow Horses, Dogs) và nhận định AI |
| ✅ Menu Page | `app/(dashboard)/menu/page.tsx` | Trang quản lý chính: lọc danh mục, tìm kiếm, quản lý Category và món ăn |
| ✅ Detail Page | `app/(dashboard)/menu/[id]/page.tsx` | Trang chi tiết: cập nhật thông tin món và cấu hình công thức nấu |
| ✅ AI Suggest Page | `app/(dashboard)/menu/ai-suggest/page.tsx` | Trang phân tích ma trận bán hàng và nhận gợi ý sáng tạo món uống mới |

---

## GIAI ĐOẠN 4 — POS MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 5 — INVENTORY MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 6 — CUSTOMER & LOYALTY MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 7 — MARKETING MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 8 — CHATBOT MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 9 — REPORTS MODULE
*(Chưa bắt đầu)*
