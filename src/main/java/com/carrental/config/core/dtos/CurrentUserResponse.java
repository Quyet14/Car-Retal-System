package com.carrental.config.core.dtos;

import lombok.Data;
import java.util.Set;

@Data
public class CurrentUserResponse {
    private String id;
    private String email;
    private String userName;
    private String firstName;
    private String lastName;
    private String country;
    private Boolean emailConfirmed;
    private Set<String> roles;
}
