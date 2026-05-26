# QUY TRÌNH PHÁT TRIỂN & QUY CHUẨN CODE (CODING STANDARDS)
## Dự án: Hệ thống AI Hỗ trợ Quản lý Quán Cà phê

Tài liệu này định nghĩa các quy tắc phát triển, quy chuẩn viết mã (coding standards), cấu trúc kiến trúc và quy trình nghiệm thu tính năng. Mọi thành viên phát triển bắt buộc phải tuân thủ nghiêm ngặt để đảm bảo mã nguồn sạch (Clean Code), dễ bảo trì và có chất lượng cấp doanh nghiệp (Production-ready).

---

## 1. QUY TẮC PHÂN NHÁNH VÀ COMMIT (GIT STRATEGY)

### 1.1 Quản lý Phân nhánh (Git Flow)
- **`main`**: Nhánh lưu trữ mã nguồn chạy ổn định trên môi trường Production. Không commit trực tiếp lên `main`.
- **`develop`**: Nhánh tích hợp chính cho các tính năng mới. Mọi nhánh tính năng đều bắt đầu từ `develop` và merge ngược lại qua Pull Request (PR).
- **`feature/feature-name`**: Nhánh phát triển tính năng mới.
- **`bugfix/bug-name`**: Nhánh sửa lỗi phát hiện trong quá trình test.
- **`hotfix/issue-name`**: Nhánh sửa lỗi khẩn cấp trực tiếp từ `main`.

### 1.2 Quy chuẩn Commit Message (Conventional Commits)
Thông điệp commit phải viết theo định dạng:
```
<type>(<scope>): <description>

[body] (optional)
```

**Các loại `type` hợp lệ:**
- `feat`: Tính năng mới (ví dụ: `feat(pos): add payment method select`).
- `fix`: Sửa lỗi (ví dụ: `fix(auth): fix jwt token expiration bug`).
- `docs`: Cập nhật tài liệu (ví dụ: `docs(readme): update installation steps`).
- `style`: Thay đổi định dạng code (khoảng trắng, format, thiếu dấu chấm phẩy - không ảnh hưởng logic).
- `refactor`: Tái cấu trúc mã nguồn (không sửa lỗi cũng không thêm tính năng mới).
- `test`: Thêm hoặc sửa đổi mã nguồn kiểm thử (unit/integration tests).
- `chore`: Các công việc vặt khác (cập nhật dependency, cấu hình build...).

---

## 2. QUY TRÌNH NGHIỆM THU TÍNH NĂNG (DEFINITION OF DONE - DoD)

Một task hoặc feature được coi là hoàn thành (Done) khi và chỉ khi vượt qua các bước kiểm tra sau:

1. **Build sạch (Zero Errors/Warnings)**:
   - Backend compile thành công không có lỗi hoặc cảnh báo nghiêm trọng.
   - Frontend build TypeScript không lỗi cú pháp hoặc kiểu dữ liệu.
2. **Không lặp mã (DRY - Don't Repeat Yourself)**:
   - Các đoạn xử lý logic giống nhau phải được gom nhóm vào file helper, utility hoặc custom hook.
   - Không copy/paste code giữa các file.
3. **Kiểm tra đầu vào (Validation)**:
   - Phải validate dữ liệu ở cả 2 đầu: Frontend (form validation trước khi gửi request) và Backend (sử dụng `@Valid` trên các DTO nhận dữ liệu).
4. **Không chứa mã thừa (No Junk Code)**:
   - Xóa bỏ hoàn toàn các câu lệnh in log debug (`console.log`, `System.out.println`) trước khi tạo PR. Sử dụng thư viện Log chuyên dụng (`log4j`, `slf4j` trên Spring Boot).
   - Xóa mã nguồn bị comment thừa (dead code).
5. **Giao diện phản hồi & Thẩm mỹ**:
   - Giao diện frontend phải hiển thị đúng trên các kích thước màn hình phổ biến (Responsive).
   - Phải xử lý các trạng thái chờ tải (Loading states), lỗi (Error states) và thông báo thành công (Toast notification).

---

## 3. KIẾN TRÚC & TIÊU CHUẨN CODE BACKEND (SPRING BOOT)

### 3.1 Cấu trúc 4 lớp (Layered Architecture)
Mã nguồn Java phải tuân thủ nghiêm ngặt mô hình phân tách trách nhiệm:
1. **Controller Layer**:
   - Nhận request từ client, thực hiện validate dữ liệu đầu vào.
   - Gọi trực tiếp đến Service Layer, không tự xử lý business logic.
   - Trả về đối tượng `ApiResponse` chuẩn.
2. **Service Layer**:
   - Nơi xử lý toàn bộ logic nghiệp vụ (business logic), tích hợp AI và quản lý giao dịch (`@Transactional`).
   - Độc lập hoàn toàn với Controller Layer.
3. **Repository Layer**:
   - Chỉ tương tác với Database thông qua Spring Data JPA. Không chứa business logic.
4. **Model/Entity Layer**:
   - Phân biệt rõ ràng giữa Database Entity (dùng cho Hibernate) và DTO (Data Transfer Object).
   - **BẮT BUỘC**: Không trả trực tiếp Database Entity về cho client, mà phải convert sang DTO (Response) để bảo mật thông tin và tránh lỗi Lazy Loading Exception.

### 3.2 Quy chuẩn xử lý Lỗi và Exception
- Không dùng khối `try-catch` bừa bãi và để trống hoặc chỉ in stacktrace.
- Mọi exception nghiệp vụ phải được bọc trong một Exception kế thừa từ `RuntimeException` (ví dụ: `AppException`) kèm mã lỗi cụ thể định nghĩa trong enum `ErrorCode`.
- Xử lý lỗi tập trung thông qua `GlobalExceptionHandler` sử dụng `@RestControllerAdvice`.

---

## 4. KIẾN TRÚC & TIÊU CHUẨN CODE FRONTEND (NEXT.JS & REACT)

### 4.1 Cấu trúc Component
- **UI Components (Tái sử dụng)**: Đặt trong `src/components/ui/`. Đây là các component câm (dumb components), nhận dữ liệu và hành động qua `props`, không tự gọi API hoặc thay đổi global state.
- **Feature/Page Components**: Đặt trong `src/app/`. Quản lý state, thực hiện gọi API qua Axios Client, kết nối với Zustand store và phối hợp các UI components.

### 4.2 Quản lý State và Client API
- **Axios Client**: Tất cả các lệnh gọi HTTP đều phải đi qua thực thể Axios được định nghĩa sẵn trong `src/lib/api.ts` để tự động xử lý token bảo mật và bắt lỗi toàn cục (ví dụ: 401 redirect).
- **Global State**: Sử dụng Zustand cho các trạng thái cần chia sẻ toàn cục như: giỏ hàng (cart), session người dùng hiện tại (auth). Hạn chế lạm dụng global store cho các state cục bộ của component.
- **Hydration & SSR**: Tránh lỗi mismatch SSR/CSR bằng cách sử dụng hook useEffect hoặc cấu hình Zustand persist phù hợp.

### 4.3 Thẩm mỹ và Trải nghiệm Người dùng (UX/UI)
- Sử dụng bảng màu thống nhất (curated theme) thông qua Tailwind CSS v4. Không sử dụng mã màu hex tùy tiện (hardcode) trong class.
- Luôn cung cấp phản hồi trực quan khi người dùng click nút (hiển thị trạng thái loading, disable nút bấm để tránh click trùng).
- Hiển thị thông báo Toast đẹp mắt khi cập nhật dữ liệu thành công hoặc gặp lỗi.
