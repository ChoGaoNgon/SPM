package htmp.codien.quanlycodien.common;

import org.springframework.http.ResponseEntity;

public class ResponseUtil {
    public static <T> ResponseEntity<ApiResponse<T>> success(T data, String message) {
        return ResponseEntity.ok(new ApiResponse<>(200, message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return ResponseEntity.status(201).body(new ApiResponse<>(201, message, data));
    }

    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return ResponseEntity.status(400).body(new ApiResponse<>(400, message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> unauthorized(String message) {
        return ResponseEntity.status(401).body(new ApiResponse<>(401, message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> forbidden(String message) {
        return ResponseEntity.status(403).body(new ApiResponse<>(403, message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> notFound(String message) {
        return ResponseEntity.status(404).body(new ApiResponse<>(404, message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> conflict(String message) {
        return ResponseEntity.status(409).body(new ApiResponse<>(409, message, null));
    }

    public static <T> ResponseEntity<ApiResponse<T>> serverError(String message) {
        return ResponseEntity.status(500).body(new ApiResponse<>(500, message, null));
    }
}
