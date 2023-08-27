package ewt.msvc.config.configuration;

import ewt.msvc.config.security.SecurityUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient webClient() {
        ExchangeFilterFunction authFilter = (clientRequest, next) ->
                SecurityUtils.getCurrentUserJWT()
                        .flatMap(token -> next.exchange(ClientRequest.from(clientRequest)
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .build()));

        return WebClient.builder()
                .baseUrl("http://localhost:9100/services/")
                .filter(authFilter)
                .build();
    }
}
