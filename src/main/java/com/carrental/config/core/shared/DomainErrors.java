package com.carrental.config.core.shared;

/**
 * Chứa các lỗi nghiệp vụ chung.
 */
public class DomainErrors {
    public static final Error INTERNAL_SERVER_ERROR = new Error(
            "Server.InternalServerError",
            "An internal error happened during operation");

    public static final Error USER_WITH_EMAIL_NOT_FOUND = new Error(
            "User.EmailNotFound",
            "User with the given email address does not exist");

    public static final Error USER_WITH_ID_NOT_FOUND = new Error(
            "User.IdNotFound",
            "User with the given ID does not exist");

    public static final Error USER_EMAIL_NOT_CONFIRMED = new Error(
            "User.EmailNotConfirmed",
            "Email address must be confirmed first");

    public static final Error USER_CREDENTIALS_INVALID = new Error(
            "User.InvalidCredentials",
            "User credentials are invalid");

    public static final Error VALIDATION_ERROR = new Error(
            "ValidationError",
            "A validation problem occurred.");
}
