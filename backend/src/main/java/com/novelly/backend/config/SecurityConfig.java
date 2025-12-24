package com.novelly.backend.config;

import com.novelly.backend.security.UserDetailsServiceImpl;
import com.novelly.backend.security.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, UserDetailsServiceImpl userDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/hash").permitAll()
                .requestMatchers("/api/auth/**").authenticated()
                .requestMatchers("/api/pages/file/**", "/api/pages/file", "/", "/index.html", "/css/**", "/js/**", "/assets/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/novels/upload").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/novels").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/novels/*/chapters").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/novels/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/pages/upload").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/pages/upload-multiple").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/pages/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/novels/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/novels/*/chapters/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/novels/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/chapters/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/pages").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*/progress").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*/progress/*").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/users/*/progress").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/users/*/progress/*").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*/library").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/users/*/library/*/check").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/users/*/library/*").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/users/*/library/*").authenticated()
                .requestMatchers("/api/users/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .userDetailsService(userDetailsService)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
