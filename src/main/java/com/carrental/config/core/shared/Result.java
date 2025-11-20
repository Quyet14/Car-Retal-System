package com.carrental.config.core.shared;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;

/**
 * Lớp bao bọc kết quả thao tác (thành công hoặc thất bại).
 */
@Getter
public class Result<T> {

    private final boolean isSuccess;
    private final boolean isFailure;
    private final Error error;
    private final T value;
    private final List<Error> validationErrors;

    protected Result(T value, boolean isSuccess, Error error) {
        if (isSuccess && error != Error.NONE) {
            throw new IllegalArgumentException("Success result cannot have an error.");
        }
        if (!isSuccess && error == Error.NONE) {
            throw new IllegalArgumentException("Failure result must have an error.");
        }

        this.value = value;
        this.isSuccess = isSuccess;
        this.isFailure = !isSuccess;
        this.error = error;
        this.validationErrors = List.of();
    }

    protected Result(List<Error> validationErrors) {
        this.isSuccess = false;
        this.isFailure = true;
        this.error = DomainErrors.VALIDATION_ERROR;
        this.value = null;
        this.validationErrors = validationErrors;
    }

    public static Result<Void> success() {
        return new Result<>(null, true, Error.NONE);
    }

    public static <TValue> Result<TValue> success(TValue value) {
        return new Result<>(value, true, Error.NONE);
    }

    public static <TValue> Result<TValue> failure(Error error) {
        return new Result<>(null, false, error);
    }

    public static <TValue> Result<TValue> create(TValue value) {
        return value != null ? success(value) : failure(Error.NULL_VALUE);
    }

    public static <TValue> Result<TValue> validationFailure(List<Error> errors) {
        return new Result<>(errors);
    }

    public static <TValue> Result<TValue> validationFailure(Error... errors) {
        return new Result<>(Arrays.asList(errors));
    }

    public T getValueOrThrow() {
        if (isFailure) {
            throw new IllegalStateException("The value of a failure result can not be accessed. Error: " + error.getMessage());
        }
        return value;
    }
}
