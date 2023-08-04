package ewt.msvc.identity.security.jwt;

import ewt.msvc.identity.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.test.web.reactive.server.WebTestClient;

@AutoConfigureWebTestClient(timeout = IntegrationTest.DEFAULT_TIMEOUT)
@AuthenticationIntegrationTest
class TokenAuthenticationIT {

    @Autowired
    private WebTestClient webTestClient;

    @Value("${jhipster.security.authentication.jwt.base64-secret}")
    private String jwtKey;

    @Test
    void testLoginWithValidToken() throws Exception {
        expectOk(JwtAuthenticationTestUtils.createValidToken(jwtKey));
    }

    @Test
    void testReturnFalseWhenJWThasInvalidSignature() throws Exception {
        expectUnauthorized(JwtAuthenticationTestUtils.createTokenWithDifferentSignature());
    }

    @Test
    void testReturnFalseWhenJWTisMalformed() throws Exception {
        expectUnauthorized(JwtAuthenticationTestUtils.createSignedInvalidJwt(jwtKey));
    }

    @Test
    void testReturnFalseWhenJWTisExpired() throws Exception {
        expectUnauthorized(JwtAuthenticationTestUtils.createExpiredToken(jwtKey));
    }

    private void expectOk(String token) {
        webTestClient.get().uri("/api/authenticate").headers(headers -> headers.setBearerAuth(token)).exchange().expectStatus().isOk();
    }

    private void expectUnauthorized(String token) {
        webTestClient
            .get()
            .uri("/api/authenticate")
            .headers(headers -> headers.setBearerAuth(token))
            .exchange()
            .expectStatus()
            .isUnauthorized();
    }
}
