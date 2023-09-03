package ewt.msvc.feedback.web.rest;

import ewt.msvc.feedback.service.FeedbackReviewImageService;
import ewt.msvc.feedback.service.FeedbackReviewService;
import ewt.msvc.feedback.service.dto.FeedbackReviewDTO;
import ewt.msvc.feedback.service.dto.FeedbackReviewInfoDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.PaginationUtil;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/feedback/review")
@RequiredArgsConstructor
public class FeedbackReviewResource {

    private static final List<String> ALLOWED_ORDERED_PROPERTIES = List.of("creation_date");

    private final FeedbackReviewService feedbackReviewService;
    private final FeedbackReviewImageService feedbackReviewImageService;

    @GetMapping("/image")
    public Mono<ResponseEntity<byte[]>> getFeedbackReviewImageByRef(@RequestParam String ref) {
        return feedbackReviewImageService.getFeedbackReviewImageByRef(ref)
                .map(dataUri -> {
                    String[] parts = dataUri.split(";base64,");
                    if (parts.length != 2) {
                        return ResponseEntity.badRequest().build();
                    }
                    byte[] imageBytes = Base64.getDecoder().decode(parts[1]);
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.parseMediaType(parts[0].substring(5)));
                    return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
                });
    }

    @GetMapping
    public Flux<FeedbackReviewDTO> getReviews() {
        return feedbackReviewService.getReviews();
    }

    @GetMapping("/{productId}/info")
    public Mono<FeedbackReviewInfoDTO> getReviewsInfoForProduct(@PathVariable Long productId) {
        return feedbackReviewService.getReviewInfoForProduct(productId);
    }

    @GetMapping("/{productId}")
    public Mono<ResponseEntity<Flux<FeedbackReviewDTO>>> getReviewsPageForProduct(@PathVariable Long productId,
                                                                                  Pageable pageable,
                                                                                  ServerHttpRequest serverHttpRequest) {
        if (!onlyContainsAllowedProperties(pageable)) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return feedbackReviewService.countByProduct(productId)
                .map(total -> new PageImpl<>(new ArrayList<>(), pageable, total))
                .map(page -> PaginationUtil.generatePaginationHttpHeaders(UriComponentsBuilder.fromHttpRequest(serverHttpRequest), page))
                .map(headers -> ResponseEntity.ok().headers(headers).body(feedbackReviewService.getReviewsPageForProduct(productId, pageable)));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Void> addReview(@Valid @RequestBody FeedbackReviewDTO feedbackReviewDTO) {
        return feedbackReviewService.saveReview(feedbackReviewDTO);
    }

    private boolean onlyContainsAllowedProperties(Pageable pageable) {
        return pageable.getSort().stream().map(Sort.Order::getProperty).allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }
}
