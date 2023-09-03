package ewt.msvc.feedback.repository;

import ewt.msvc.feedback.domain.FeedbackReview;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.time.LocalDate;

@Repository
@RequiredArgsConstructor
public class FeedbackReviewRepositoryQuery {

    private final R2dbcEntityTemplate entityTemplate;

    public Flux<FeedbackReview> findAllByProductId(Long productId, Pageable pageable) {
        String baseQuery = "SELECT * FROM ewt_feedback.ewt_feedback.feedback_review WHERE product_id = $3";

        StringBuilder queryBuilder = new StringBuilder(baseQuery);

        if (pageable.getSort().isSorted()) {
            pageable.getSort()
                    .get()
                    .findFirst()
                    .ifPresent(order -> queryBuilder
                            .append(" ORDER BY ")
                            .append(order.getProperty())
                            .append(" ")
                            .append(order.getDirection()));
        } else {
            queryBuilder.append(" ORDER BY id ASC");
        }

        queryBuilder.append(" LIMIT $1 OFFSET $2");

        return entityTemplate.getDatabaseClient().sql(queryBuilder.toString())
                .bind("$1", pageable.getPageSize())
                .bind("$2", pageable.getOffset())
                .bind("$3", productId)
                .map((row, metadata) -> {
                    FeedbackReview feedbackReview = new FeedbackReview();
                    feedbackReview.setId(row.get("id", Long.class));
                    feedbackReview.setProductId(row.get("product_id", Long.class));
                    feedbackReview.setFirstName(row.get("first_name", String.class));
                    feedbackReview.setLastName(row.get("last_name", String.class));
                    feedbackReview.setEmail(row.get("email", String.class));
                    feedbackReview.setCreationDate(row.get("creation_date", LocalDate.class));
                    feedbackReview.setScore(row.get("score", Integer.class));
                    feedbackReview.setReview(row.get("review", String.class));
                    feedbackReview.setIsVerified(row.get("is_verified", Boolean.class));
                    return feedbackReview;
                }).all();
    }
}
