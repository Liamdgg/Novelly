package com.novelly.backend.controller;

import com.novelly.backend.dto.AuthRequest;
import com.novelly.backend.dto.AuthResponse;
import com.novelly.backend.dto.LoginRequest;
import com.novelly.backend.dto.UserDto;
import com.novelly.backend.entity.Role;
import com.novelly.backend.entity.User;
import com.novelly.backend.repository.RoleRepository;
import com.novelly.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpHeaders;
import io.jsonwebtoken.Claims;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.novelly.backend.security.JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(/*@Valid*/ @RequestBody AuthRequest request) {
        if (userService.existsByUsername(request.getUsername()) || userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().build();
        }

        Role role = roleRepository.findByRoleName(Role.RoleName.USER)
                .orElseThrow(() -> new IllegalStateException("Default USER role is missing"));

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        User saved = userService.create(user);
        return ResponseEntity.ok(buildResponse(saved));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(/*@Valid*/ @RequestBody LoginRequest request) {
        Optional<User> optional = userService.findByEmail(request.getEmailOrUsername());
        if (optional.isEmpty()) {
            optional = userService.findByUsername(request.getEmailOrUsername());
        }

        if (optional.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = optional.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(buildResponse(user));
    }

    @PostMapping("/hash")
    public ResponseEntity<Map<String, String>> hashPassword(@RequestBody Map<String, String> body) {
        String raw = body.get("password");
        if (raw == null || raw.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "password is required"));
        }
        return ResponseEntity.ok(Map.of("hash", passwordEncoder.encode(raw)));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> me(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        Optional<User> optional = userService.findByUsername(auth.getName());
        if (optional.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(toDto(optional.get()));
    }

    @GetMapping("/inspect")
    public ResponseEntity<?> inspectToken(@RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader,
                                          @RequestParam(value = "token", required = false) String tokenParam) {
        String token = tokenParam;
        final String prefix = "Bearer ";
        if (token == null && authHeader != null && authHeader.startsWith(prefix)) {
            token = authHeader.substring(prefix.length());
        }
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "token is required as Authorization header or token query parameter"));
        }
        try {
            Claims claims = jwtService.extractAllClaims(token);
            return ResponseEntity.ok(Map.of(
                    "subject", claims.getSubject(),
                    "issuedAt", claims.getIssuedAt(),
                    "expiration", claims.getExpiration(),
                    "roles", claims.get("roles")
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    private AuthResponse buildResponse(User user) {
        org.springframework.security.core.userdetails.UserDetails userDetails =
            org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("ROLE_" + (user.getRole() != null ? user.getRole().getRoleName().name() : "USER"))
                .build();

        String token = jwtService.generateToken(userDetails);
        return AuthResponse.builder()
            .token(token)
            .user(toDto(user))
            .build();
    }

    private UserDto toDto(User user) {
        return UserDto.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole() != null ? user.getRole().getRoleName().name() : null)
                .build();
    }
}
