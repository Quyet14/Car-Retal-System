package com.carrental.config.core.shared;

import java.util.Objects;

/**
 * Lớp đại diện cho một lỗi nghiệp vụ/ứng dụng.
 */
public class Error {
    public static final Error NONE = new Error("", "");
    public static final Error NULL_VALUE = new Error("Error.NullValue", "The specified result value is null.");

    private final String code;
    private final String message;

    public Error(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Error error = (Error) obj;
        return Objects.equals(code, error.code) && Objects.equals(message, error.message);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, message);
    }

    @Override
    public String toString() {
        return code;
    }
}
