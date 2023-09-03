package ewt.msvc.feedback.repository;

import ewt.msvc.feedback.domain.FeedbackReviewImage;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface FeedbackReviewImageRepository extends R2dbcRepository<FeedbackReviewImage, Long> {
    Flux<FeedbackReviewImage> findAllByFeedbackReviewId(Long feedbackReviewId);
}
