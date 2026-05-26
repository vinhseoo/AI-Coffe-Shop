package com.coffeeshop.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

public enum ErrorCode {

    // --- COMMON ---
    SUCCESS("SUCCESS", "Thành công", HttpStatus.OK),
    UNCATEGORIZED_EXCEPTION("UNCATEGORIZED_ERROR", "Lỗi không xác định từ hệ thống", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY("INVALID_VALIDATION_KEY", "Mã khóa validation không hợp lệ", HttpStatus.BAD_REQUEST),
    BAD_REQUEST("BAD_REQUEST", "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    RESOURCE_NOT_FOUND("RESOURCE_NOT_FOUND", "Không tìm thấy dữ liệu yêu cầu", HttpStatus.NOT_FOUND),
    METHOD_NOT_ALLOWED("METHOD_NOT_ALLOWED", "Phương thức HTTP không được hỗ trợ", HttpStatus.METHOD_NOT_ALLOWED),
    UNSUPPORTED_MEDIA_TYPE("UNSUPPORTED_MEDIA_TYPE", "Định dạng dữ liệu không được hỗ trợ", HttpStatus.UNSUPPORTED_MEDIA_TYPE),

    // --- AUTH ---
    UNAUTHORIZED("UNAUTHORIZED", "Không có quyền truy cập, vui lòng đăng nhập", HttpStatus.UNAUTHORIZED),
    FORBIDDEN("FORBIDDEN", "Bạn không có quyền thực hiện hành động này", HttpStatus.FORBIDDEN),
    USER_ALREADY_EXISTS("USER_ALREADY_EXISTS", "Tên đăng nhập hoặc email đã tồn tại", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND("USER_NOT_FOUND", "Không tìm thấy người dùng", HttpStatus.NOT_FOUND),
    INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Tên đăng nhập hoặc mật khẩu không chính xác", HttpStatus.UNAUTHORIZED),
    INVALID_TOKEN("INVALID_TOKEN", "Token không hợp lệ hoặc đã hết hạn", HttpStatus.UNAUTHORIZED),
    INVALID_CURRENT_PASSWORD("INVALID_CURRENT_PASSWORD", "Mật khẩu hiện tại không đúng", HttpStatus.BAD_REQUEST),
    ACCOUNT_DISABLED("ACCOUNT_DISABLED", "Tài khoản đã bị vô hiệu hoá", HttpStatus.FORBIDDEN),

    // --- SETTINGS ---
    SHOP_SETTINGS_NOT_FOUND("SHOP_SETTINGS_NOT_FOUND", "Chưa có thông tin cài đặt quán", HttpStatus.NOT_FOUND),

    // --- MENU ---
    CATEGORY_NOT_FOUND("CATEGORY_NOT_FOUND", "Không tìm thấy danh mục", HttpStatus.NOT_FOUND),
    MENU_ITEM_NOT_FOUND("MENU_ITEM_NOT_FOUND", "Không tìm thấy món trong menu", HttpStatus.NOT_FOUND),
    TOPPING_NOT_FOUND("TOPPING_NOT_FOUND", "Không tìm thấy topping", HttpStatus.NOT_FOUND),
    MENU_ITEM_UNAVAILABLE("MENU_ITEM_UNAVAILABLE", "Món này hiện không có sẵn", HttpStatus.BAD_REQUEST),
    DUPLICATE_CATEGORY_NAME("DUPLICATE_CATEGORY_NAME", "Tên danh mục đã tồn tại", HttpStatus.BAD_REQUEST),

    // --- INVENTORY ---
    INGREDIENT_NOT_FOUND("INGREDIENT_NOT_FOUND", "Không tìm thấy nguyên liệu", HttpStatus.NOT_FOUND),
    SUPPLIER_NOT_FOUND("SUPPLIER_NOT_FOUND", "Không tìm thấy nhà cung cấp", HttpStatus.NOT_FOUND),
    OUT_OF_STOCK("OUT_OF_STOCK", "Số lượng nguyên liệu trong kho không đủ để pha chế", HttpStatus.BAD_REQUEST),
    INVALID_STOCK_QUANTITY("INVALID_STOCK_QUANTITY", "Số lượng kho không hợp lệ", HttpStatus.BAD_REQUEST),

    // --- ORDER ---
    ORDER_NOT_FOUND("ORDER_NOT_FOUND", "Không tìm thấy đơn hàng", HttpStatus.NOT_FOUND),
    ORDER_ALREADY_COMPLETED("ORDER_ALREADY_COMPLETED", "Đơn hàng đã hoàn thành, không thể thay đổi", HttpStatus.BAD_REQUEST),
    ORDER_ALREADY_CANCELLED("ORDER_ALREADY_CANCELLED", "Đơn hàng đã bị huỷ", HttpStatus.BAD_REQUEST),
    INVALID_ORDER_STATUS_TRANSITION("INVALID_ORDER_STATUS_TRANSITION", "Trạng thái đơn hàng không hợp lệ", HttpStatus.BAD_REQUEST),
    EMPTY_ORDER("EMPTY_ORDER", "Đơn hàng không có món nào", HttpStatus.BAD_REQUEST),

    // --- CUSTOMER ---
    CUSTOMER_NOT_FOUND("CUSTOMER_NOT_FOUND", "Không tìm thấy khách hàng", HttpStatus.NOT_FOUND),
    CUSTOMER_PHONE_EXISTS("CUSTOMER_PHONE_EXISTS", "Số điện thoại khách hàng đã tồn tại", HttpStatus.BAD_REQUEST),
    INSUFFICIENT_LOYALTY_POINTS("INSUFFICIENT_LOYALTY_POINTS", "Điểm tích luỹ không đủ để đổi", HttpStatus.BAD_REQUEST),

    // --- PROMOTION ---
    PROMOTION_NOT_FOUND("PROMOTION_NOT_FOUND", "Không tìm thấy chương trình khuyến mãi", HttpStatus.NOT_FOUND),
    PROMOTION_EXPIRED("PROMOTION_EXPIRED", "Chương trình khuyến mãi đã hết hạn", HttpStatus.BAD_REQUEST),
    PROMOTION_USAGE_LIMIT_REACHED("PROMOTION_USAGE_LIMIT_REACHED", "Chương trình khuyến mãi đã hết lượt sử dụng", HttpStatus.BAD_REQUEST),
    PROMOTION_NOT_APPLICABLE("PROMOTION_NOT_APPLICABLE", "Chương trình khuyến mãi không áp dụng cho đơn hàng này", HttpStatus.BAD_REQUEST),

    // --- AI ---
    AI_SERVICE_ERROR("AI_SERVICE_ERROR", "Gặp lỗi khi kết nối với dịch vụ AI", HttpStatus.INTERNAL_SERVER_ERROR),
    AI_RESPONSE_PARSE_ERROR("AI_RESPONSE_PARSE_ERROR", "Không thể phân tích phản hồi từ AI", HttpStatus.INTERNAL_SERVER_ERROR),
    AI_API_KEY_MISSING("AI_API_KEY_MISSING", "Chưa cấu hình AI API key", HttpStatus.INTERNAL_SERVER_ERROR),

    // --- FILE ---
    FILE_UPLOAD_ERROR("FILE_UPLOAD_ERROR", "Lỗi khi tải file lên", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_FILE_TYPE("INVALID_FILE_TYPE", "Định dạng file không được hỗ trợ (chỉ chấp nhận JPG, PNG, WEBP)", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE("FILE_TOO_LARGE", "File quá lớn, kích thước tối đa là 5MB", HttpStatus.BAD_REQUEST);

    private final String code;
    private final String message;
    private final HttpStatusCode statusCode;

    ErrorCode(String code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    public HttpStatusCode getStatusCode() {
        return statusCode;
    }
}
