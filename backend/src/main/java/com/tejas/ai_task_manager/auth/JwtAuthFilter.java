package com.tejas.ai_task_manager.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Skip filter entirely for /auth/** — register/login need no token
        if (request.getServletPath().startsWith("/auth")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Skip OPTIONS preflight — CORS is handled by SecurityConfig
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        // 3. No token → pass through (SecurityConfig enforces auth on protected routes)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 4. Token exists — validate and set auth in context
        try {
            String token = authHeader.substring(7);

            String email = jwtService.extractEmail(token);
            String role = jwtService.extractRole(token);

            if (email != null && role != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {

                String cleanRole = role.trim().toUpperCase();

                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + cleanRole))
                        );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

            filterChain.doFilter(request, response);

        } catch (io.jsonwebtoken.ExpiredJwtException e) {
            // Token expired — user must login again
            SecurityContextHolder.clearContext();
            sendUnauthorized(response, "Token has expired. Please login again.");

        } catch (io.jsonwebtoken.JwtException e) {
            // Token tampered or malformed
            SecurityContextHolder.clearContext();
            sendUnauthorized(response, "Invalid token.");

        } catch (Exception e) {
            // Unexpected error — don't force 401, let Spring Security handle naturally
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
        }
    }

    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write("""
            {
                "error": "Unauthorized",
                "message": "%s"
            }
            """.formatted(message));
    }
}