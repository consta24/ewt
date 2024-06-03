package ewt.msvc.feedback.repository;

import ewt.msvc.feedback.domain.FeedbackReview;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;

@Repository
public interface FeedbackReviewRepository extends R2dbcRepository<FeedbackReview, Long> {

    Mono<Long> countByProductId(Long productId);

    @Query("SELECT AVG(score) FROM ewt.ewt_feedback.feedback_review WHERE product_id = :productId")
    Mono<BigDecimal> averageScoreByProductId(@Param("productId") Long productId);
}
