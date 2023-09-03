package ewt.msvc.feedback.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serial;
import java.io.Serializable;

@Table(value = "feedback_review_image", schema = "ewt_feedback")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeedbackReviewImage implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    private Long id;

    @NotNull
    private Long feedbackReviewId;

    @Size(max = 1000)
    @NotNull
    private String ref;
}
