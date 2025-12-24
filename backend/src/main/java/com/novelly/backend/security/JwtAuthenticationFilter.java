package com.novelly.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String prefix = "Bearer ";
        String username = null;
        String jwt = null;
        logger.debug("Incoming request: " + request.getMethod() + " " + request.getRequestURI() + " Authorization present=" + (authHeader != null));

        if (authHeader != null && authHeader.startsWith(prefix)) {
            jwt = authHeader.substring(prefix.length());
            logger.debug("JWT length: " + (jwt != null ? jwt.length() : "null"));
            try {
                username = jwtService.extractUsername(jwt);
                logger.debug("Extracted username from JWT: " + username);
            } catch (Exception e) {
                logger.warn("Invalid JWT token: " + e.getMessage());
                logger.debug("JWT parsing exception", e);
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = userDetailsService.loadUserByUsername(username);
            logger.debug("User authorities: " + userDetails.getAuthorities());
            if (jwtService.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Authentication set for user: " + username + " with authorities: " + userDetails.getAuthorities());
            }
        }

        filterChain.doFilter(request, response);
    }
}
