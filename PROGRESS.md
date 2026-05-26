# TIẾN TRÌNH THỰC HIỆN DỰ ÁN
## Hệ thống AI Hỗ trợ Quản lý Quán Cà phê

Tài liệu này ghi lại **những gì đã được thực hiện** theo từng giai đoạn và từng module. Cập nhật mỗi khi hoàn thành một tính năng.

---

## GIAI ĐOẠN 0 — KHỞI TẠO & NỀN TẢNG CHUNG (Base/Common)

### ✅ Backend — Base đã hoàn thành
| Hạng mục | File | Mô tả |
|----------|------|--------|
| ✅ Spring Boot project | `pom.xml` | Khởi tạo với dependencies: JPA, Security, Validation, Web, MySQL, Lombok, JWT, Swagger |
| ✅ Application config | `application.properties` | Cấu hình DB, JWT, OpenAI, CORS, Swagger, logging |
| ✅ BaseEntity | `model/entity/BaseEntity.java` | Auditing fields: createdAt, updatedAt, createdBy, updatedBy |
| ✅ JPA Auditing | `config/JpaConfig.java` | Tự động fill createdBy/updatedBy từ Spring Security context |
| ✅ API Response wrapper | `model/dto/response/ApiResponse.java` | Chuẩn response cho toàn hệ thống |
| ✅ Paged Response | `model/dto/response/PagedResponse.java` | Chuẩn response phân trang |
| ✅ Error codes | `exception/ErrorCode.java` | Enum mã lỗi toàn hệ thống |
| ✅ App Exception | `exception/AppException.java` | Custom exception kế thừa RuntimeException |
| ✅ Global Exception Handler | `exception/GlobalExceptionHandler.java` | Xử lý lỗi tập trung |
| ✅ Security Config | `config/SecurityConfig.java` | JWT filter chain, CORS, public routes |
| ✅ OpenAI Config | `config/OpenAIConfig.java` | Bean RestTemplate + API key injection |
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

## GIAI ĐOẠN 1 — AUTH & SETTINGS MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 2 — DASHBOARD MODULE
*(Chưa bắt đầu)*

---

## GIAI ĐOẠN 3 — MENU MODULE
*(Chưa bắt đầu)*

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
