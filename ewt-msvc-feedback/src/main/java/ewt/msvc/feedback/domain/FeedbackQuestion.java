package ewt.msvc.feedback.domain;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.relational.core.mapping.Table;

import java.io.Serial;
import java.io.Serializable;

@Table(value = "feedback_question", schema = "ewt_feedback")
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class FeedbackQuestion extends FeedbackItem implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Size(max = 1000)
    @NotNull
    private String question;
}
