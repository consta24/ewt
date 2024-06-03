package ewt.msvc.feedback.web.rest;

import ewt.msvc.feedback.service.FeedbackQuestionService;
import ewt.msvc.feedback.service.dto.FeedbackQuestionDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import tech.jhipster.web.util.PaginationUtil;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/feedback/question")
@RequiredArgsConstructor
public class FeedbackQuestionResource {

    private static final List<String> ALLOWED_ORDERED_PROPERTIES = List.of("creation_date");


    private final FeedbackQuestionService feedbackQuestionService;

    @GetMapping("/{productId}")
    public Mono<ResponseEntity<Flux<FeedbackQuestionDTO>>> getQuestionsPageForProduct(@PathVariable Long productId,
                                                                                      Pageable pageable,
                                                                                      ServerHttpRequest request) {
        if (!onlyContainsAllowedProperties(pageable)) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return feedbackQuestionService.countByProduct(productId)
                .map(total -> new PageImpl<>(new ArrayList<>(), pageable, total))
                .map(page -> PaginationUtil.generatePaginationHttpHeaders(UriComponentsBuilder.fromHttpRequest(request), page))
                .map(headers -> ResponseEntity.ok().headers(headers).body(feedbackQuestionService.getQuestionsPageForProduct(productId, pageable)));
    }

    @PostMapping
    public Mono<Void> saveQuestion(@Valid @RequestBody FeedbackQuestionDTO feedbackQuestionDTO) {
        return feedbackQuestionService.saveQuestion(feedbackQuestionDTO);
    }

    private boolean onlyContainsAllowedProperties(org.springframework.data.domain.Pageable pageable) {
        return pageable.getSort().stream().map(Sort.Order::getProperty).allMatch(ALLOWED_ORDERED_PROPERTIES::contains);
    }
}
