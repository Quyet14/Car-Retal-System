package com.carrental.config.mappers;

import com.carrental.config.core.dtos.CurrentUserResponse;
import com.carrental.config.core.dtos.RegisterUserCommand;
import com.carrental.config.core.dtos.UpdateUserCommand;
import com.carrental.config.core.entities.ApplicationUser;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

/**
 * Mapper chuyển đổi giữa DTOs và Entities.
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "emailConfirmed", constant = "false")
    @Mapping(source = "email", target = "username")
    ApplicationUser toEntity(RegisterUserCommand command);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "emailConfirmed", ignore = true)
    @Mapping(source = "email", target = "username")
    void updateEntityFromCommand(UpdateUserCommand command, @MappingTarget ApplicationUser user);

    @Mapping(source = "username", target = "userName")
    CurrentUserResponse toResponse(ApplicationUser user);
}
