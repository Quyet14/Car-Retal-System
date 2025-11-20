package com.carrental.config.core.shared;

import lombok.Getter;

/**
 * Lớp dùng để truyền tải thông báo người dùng qua Mediator/Event Bus.
 */
@Getter
public class UserNotification {
    private final String message;
    private final UserNotificationType type;

    private UserNotification(String message, UserNotificationType type) {
        this.message = message;
        this.type = type;
    }

    public static UserNotification success(String message) {
        return new UserNotification(message, UserNotificationType.SUCCESS);
    }

    public static UserNotification error(Error error) {
        return error(error.getMessage());
    }

    public static UserNotification error(String message) {
        return new UserNotification(message, UserNotificationType.ERROR);
    }

    public static UserNotification info(String message) {
        return new UserNotification(message, UserNotificationType.INFO);
    }

    public static UserNotification warning(String message) {
        return new UserNotification(message, UserNotificationType.WARNING);
    }

    public enum UserNotificationType {
        SUCCESS, ERROR, INFO, WARNING
    }
}
