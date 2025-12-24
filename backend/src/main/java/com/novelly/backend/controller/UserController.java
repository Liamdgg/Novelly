package com.novelly.backend.controller;

import com.novelly.backend.dto.UserDto;
import com.novelly.backend.entity.User;
import com.novelly.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getUsers() {
        List<User> users = userService.findAll();
        List<UserDto> dto = users.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable Integer id) {
        return userService.findById(id)
                .map(u -> ResponseEntity.ok(toDto(u)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private UserDto toDto(User u) {
        return UserDto.builder()
                .userId(u.getUserId())
                .username(u.getUsername())
                .email(u.getEmail())
                .role(u.getRole() != null ? u.getRole().getRoleName().name().toUpperCase() : null)
                .build();
    }
}
