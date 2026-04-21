package com.tejas.ai_task_manager.auth;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("JWT FILTER HIT");

        // ✅ Optional (debug / CORS safety)
        response.setHeader("Access-Control-Allow-Origin", "*");

        final String authHeader = request.getHeader("Authorization");
        System.out.println("Auth Header: " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);
        String email = jwtService.extractEmail(token);
        String role = jwtService.extractRole(token);

        System.out.println("Extracted Email: " + email);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(email,  null, java.util.List.of(
                        new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role)
                ));
        
            SecurityContextHolder.getContext().setAuthentication(authToken);

            System.out.println("Authentication set for: " + email);
        }

        filterChain.doFilter(request, response);
    }
}