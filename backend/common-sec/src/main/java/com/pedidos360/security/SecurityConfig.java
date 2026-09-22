package com.pedidos360.security;

import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.JWTParser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de seguridad compartida para todos los microservicios de
 * Pedidos360. Actúa como Resource Server: valida que el JWT recibido provenga
 * del tenant de Azure AD (Entra ID) y utilice la audiencia correcta.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    /** Punto de emisión del token (issuer) de Entra ID: https://login.microsoftonline.com/{tenant-id}/v2.0 */
    @Value("${azure.activedirectory.issuer-uri}")
    private String issuerUri;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, @Lazy JwtDecoder jwtDecoder) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (si aplica, por ejemplo health)
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers("/error").permitAll()
                // Cualquier otra petición debe traer un JWT válido
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt.decoder(jwtDecoder))
            );

        return http.build();
    }

    /**
     * Decoder que valida firma, issuer, expiración y audiencia del token.
     * Utiliza los metadatos de configuración publicados por Entra ID
     * ({issuer}/.well-known/openid-configuration) para obtener las JWKS.
     *
     * Se crea de forma perezosa (lazy) para no romper el arranque ni los tests
     * cuando aún no se ha configurado un tenant real.
     */
    @Bean
    @Lazy
    public JwtDecoder jwtDecoder() {
        return JwtDecoders.fromIssuerLocation(issuerUri);
    }

    /**
     * Utilidad para obtener claims del JWT sin dependencias extra. Puede usarse
     * en los controladores para identificar al usuario autenticado.
     */
    public static String claim(String token, String name) {
        try {
            JWTClaimsSet claims = JWTParser.parse(token).getJWTClaimsSet();
            Object value = claims.getClaim(name);
            return value == null ? null : value.toString();
        } catch (Exception e) {
            return null;
        }
    }
}