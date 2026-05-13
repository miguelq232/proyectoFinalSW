package com.igcsscz.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.igcsscz.backend.modules.usuario.Usuario;
import com.igcsscz.backend.modules.usuario.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    public JwtAuthFilter(
            JwtService jwtService, UsuarioRepository usuarioRepository, ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        if (isPublicPath(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length()).trim();
        if (!jwtService.validateToken(token)) {
            writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Token inválido o expirado");
            return;
        }

        String email = jwtService.extractEmail(token);
        Usuario usuario =
                usuarioRepository.findByEmail(email).orElse(null);
        if (usuario == null || !usuario.isActivo()) {
            writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Usuario no válido o inactivo");
            return;
        }

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        usuario.getEmail(),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String uri) {
        return uri.startsWith("/api/auth/register")
                || uri.startsWith("/api/auth/login")
                || uri.startsWith("/actuator/health")
                || uri.startsWith("/swagger-ui")
                || uri.startsWith("/v3/api-docs")
                || uri.startsWith("/error");
    }

    private void writeJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(
                response.getWriter(), Map.of("error", status == 401 ? "Unauthorized" : "Error", "message", message));
    }
}
