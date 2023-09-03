package ewt.msvc.feedback.service.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.io.Serial;
import java.io.Serializable;
import java.util.Set;

@EqualsAndHashCode(callSuper = true)
@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class FeedbackReviewDTO extends FeedbackItemDTO implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer score;

    @Size(max = 1000)
    @NotNull
    private String review;

    @NotNull
    private Boolean isVerified;

    private Set<FeedbackReviewImageDTO> reviewImages;
}
