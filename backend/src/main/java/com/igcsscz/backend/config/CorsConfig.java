package com.igcsscz.backend.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Value("${app.cors.allowed-origin-patterns:}")
    private String configuredAllowedOriginPatterns;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> allowedOriginPatterns = new java.util.ArrayList<>(List.of(
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "http://192.168.*.*:5173",
                "https://*.sslip.io",
                "http://*.sslip.io"));

        if (configuredAllowedOriginPatterns != null && !configuredAllowedOriginPatterns.isBlank()) {
            allowedOriginPatterns.addAll(
                    java.util.Arrays.stream(configuredAllowedOriginPatterns.split(","))
                            .map(String::trim)
                            .filter(pattern -> !pattern.isBlank())
                            .toList());
        }

        configuration.setAllowedOriginPatterns(allowedOriginPatterns);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
