package ewt.msvc.feedback.repository;

import ewt.msvc.feedback.domain.FeedbackQuestion;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.time.LocalDate;

@Repository
@RequiredArgsConstructor
public class FeedbackQuestionRepositoryQuery {

    private final R2dbcEntityTemplate entityTemplate;

    public Flux<FeedbackQuestion> findAllByProductId(Long productId, Pageable pageable) {
        String baseQuery = "SELECT * FROM ewt.ewt_feedback.feedback_question WHERE product_id = $3";

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
                    FeedbackQuestion feedbackQuestion = new FeedbackQuestion();
                    feedbackQuestion.setId(row.get("id", Long.class));
                    feedbackQuestion.setProductId(row.get("product_id", Long.class));
                    feedbackQuestion.setFirstName(row.get("first_name", String.class));
                    feedbackQuestion.setLastName(row.get("last_name", String.class));
                    feedbackQuestion.setEmail(row.get("email", String.class));
                    feedbackQuestion.setCreationDate(row.get("creation_date", LocalDate.class));
                    feedbackQuestion.setQuestion(row.get("question", String.class));
                    return feedbackQuestion;
                }).all();
    }
}
