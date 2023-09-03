package ewt.msvc.feedback.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeedbackReviewInfoDTO {
    private Long count;
    private BigDecimal score;
}
