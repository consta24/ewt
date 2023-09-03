package ewt.msvc.feedback.repository;

import ewt.msvc.feedback.domain.FeedbackQuestion;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackQuestionRepository extends R2dbcRepository<FeedbackQuestion, Long> {
}
