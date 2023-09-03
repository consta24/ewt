package ewt.msvc.feedback.service;


import ewt.msvc.config.utils.StringUtil;
import ewt.msvc.feedback.domain.FeedbackReview;
import ewt.msvc.feedback.repository.FeedbackReviewRepository;
import ewt.msvc.feedback.repository.FeedbackReviewRepositoryQuery;
import ewt.msvc.feedback.service.dto.FeedbackReviewDTO;
import ewt.msvc.feedback.service.dto.FeedbackReviewInfoDTO;
import ewt.msvc.feedback.service.mapper.FeedbackReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackReviewService {

    private final FeedbackReviewMapper feedbackReviewMapper;

    private final FeedbackReviewRepository feedbackReviewRepository;
    private final FeedbackReviewRepositoryQuery feedbackReviewRepositoryQuery;

    private final FeedbackReviewImageService feedbackReviewImageService;


    public Mono<Long> countByProduct(Long productId) {
        return feedbackReviewRepository.countByProductId(productId);
    }

    public Mono<FeedbackReviewInfoDTO> getReviewInfoForProduct(Long productId) {
        Mono<Long> countMono = feedbackReviewRepository.countByProductId(productId);

        Mono<BigDecimal> avgScoreMono = feedbackReviewRepository.averageScoreByProductId(productId); // assuming you've created this method

        return Mono.zip(countMono, avgScoreMono)
                .map(tuple -> {
                    FeedbackReviewInfoDTO dto = new FeedbackReviewInfoDTO();
                    dto.setCount(tuple.getT1());
                    dto.setScore(tuple.getT2().setScale(1, RoundingMode.HALF_UP));
                    return dto;
                });
    }


    public Mono<Void> saveReview(FeedbackReviewDTO feedbackReviewDTO) {
        feedbackReviewDTO.setFirstName(StringUtil.toTitleCase(feedbackReviewDTO.getFirstName()));
        feedbackReviewDTO.setLastName(StringUtil.toTitleCase(feedbackReviewDTO.getLastName()));
        feedbackReviewDTO.setCreationDate(LocalDate.now());
        return this.feedbackReviewRepository.save(feedbackReviewMapper.toEntity(feedbackReviewDTO))
                .flatMap(savedFeedbackReview -> feedbackReviewImageService.saveFeedbackReviewImages(
                                savedFeedbackReview.getProductId(),
                                savedFeedbackReview.getId(),
                                feedbackReviewDTO.getReviewImages())
                        .thenReturn(savedFeedbackReview))
                .then();
    }

    public Flux<FeedbackReviewDTO> getReviews() {
        return feedbackReviewRepository.findAll()
                .map(feedbackReviewMapper::toDTO);
    }

    public Flux<FeedbackReviewDTO> getReviewsPageForProduct(Long productId, Pageable pageable) {
        return feedbackReviewRepositoryQuery.findAllByProductId(productId, pageable)
                .flatMap(this::populateDTOWithImages);
    }

    private Mono<FeedbackReviewDTO> populateDTOWithImages(FeedbackReview feedbackReview) {
        return feedbackReviewImageService.getFeedbackReviewImages(feedbackReview.getId())
                .collectList()
                .map(feedbackReviewImages -> {
                    FeedbackReviewDTO feedbackReviewDTO = feedbackReviewMapper.toDTO(feedbackReview);
                    feedbackReviewDTO.setReviewImages(new HashSet<>(feedbackReviewImages));
                    return feedbackReviewDTO;
                });
    }
}
