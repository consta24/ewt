package ewt.msvc.product.service.http;

import ewt.msvc.product.service.http.dto.FeedbackReviewInfoDTO;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class FeedbackReviewHttpService {

    private static final Logger log = LoggerFactory.getLogger(FeedbackReviewHttpService.class);

    @Value("${gateway.url}")
    private String gatewayUrl;

    private final WebClient.Builder webClientBuilder;
    private WebClient webClient;

    @PostConstruct
    private void init() {
        this.webClient = webClientBuilder.baseUrl(gatewayUrl + "/services/ewt-msvc-feedback").build();
    }

    public Mono<FeedbackReviewInfoDTO> getReviewInfoForProduct(Long productId) {
        return webClient.get()
                .uri("/api/feedback/review/{productId}/info", productId)
                .retrieve()
                .bodyToMono(FeedbackReviewInfoDTO.class)
                .onErrorResume(ex -> {
                    log.error("Error while getting review info for product: {}", productId, ex);
                    return Mono.just(FeedbackReviewInfoDTO.builder()
                            .count(0L)
                            .score(BigDecimal.ZERO)
                            .build());
                });
    }
}
