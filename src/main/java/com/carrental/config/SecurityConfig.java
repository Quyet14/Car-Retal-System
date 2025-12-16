package com.carrental.config;

import com.carrental.config.core.repositories.UserRepository;
import com.carrental.config.core.entities.ApplicationUser;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.authentication.session.RegisterSessionAuthenticationStrategy;

/**
 * Cấu hình cho Spring Security.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(@Lazy UserRepository userRepository) {
        return email -> {
            ApplicationUser user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
            return user;
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(
            @Lazy UserDetailsService userDetailsService, 
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService(userDetailsService);
        authenticationProvider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(authenticationProvider);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Set-Cookie"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // Các endpoint công khai
                .requestMatchers(
                    "/", 
                    "/index.html",
                    "/login.html",
                    "/register.html",
                    "/forgot-password.html",
                    "/cars.html",
                    "/profile.html",
                    "/health",
                    "/api",
                    "/api/auth/register",
                    "/api/auth/register-admin",
                    "/api/auth/login", 
                    "/api/auth/confirm-email", 
                    "/api/auth/forgot-password", 
                    "/api/auth/reset-password", 
                    "/api/cars/public/**", 
                    "/h2-console/**",
                    "/error",
                    "/*.css",
                    "/*.js",
                    "/static/**",
                    "/css/**",
                    "/js/**",
                    "/images/**",
                    "/admin/**"
                ).permitAll()
                // Các endpoint của Admin - yêu cầu role ADMIN
                .requestMatchers("/api/admin/**").permitAll() // Temporary for development
                .requestMatchers("/api/reservations/all").hasAnyRole("ADMIN", "CLIENT") // Allow both for now
                .requestMatchers("/api/reservations/*/confirm").hasRole("ADMIN")
                .requestMatchers("/api/reservations/*/complete").hasRole("ADMIN")
                // Reservation endpoints - temporarily allow all for testing
                .requestMatchers("/api/reservations").permitAll()
                .requestMatchers("/api/reservations/**").permitAll()
                // Cars endpoints
                .requestMatchers("/api/cars").permitAll()
                .requestMatchers("/api/cars/**").permitAll()
                // Các endpoint cần authentication
                .requestMatchers("/api/auth/logout").authenticated()
                .requestMatchers("/api/auth/profile").permitAll() // Temporary for debugging
                // Tất cả các request khác cho phép truy cập
                    .requestMatchers("/auth/**").permitAll()
                .anyRequest().permitAll()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.disable()))
            .formLogin(AbstractHttpConfigurer::disable) 
            .httpBasic(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session
                .maximumSessions(1)
                .maxSessionsPreventsLogin(false)
            ); 
            
        return http.build();
    }
}