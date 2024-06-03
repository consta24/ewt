package ewt.msvc.feedback.service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.io.Serial;
import java.io.Serializable;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class FeedbackQuestionDTO extends FeedbackItemDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Size(max = 1000)
    @NotNull
    private String question;
}
