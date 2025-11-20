package com.carrental.config.core.dtos;

import com.carrental.config.core.shared.Error;
import lombok.Data;

@Data
public class ErrorResponse {
    private String code;
    private String message;

    public ErrorResponse(Error error) {
        this.code = error.getCode();
        this.message = error.getMessage();
    }
}
