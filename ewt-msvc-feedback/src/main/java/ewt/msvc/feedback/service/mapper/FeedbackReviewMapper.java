package ewt.msvc.feedback.service.mapper;

import ewt.msvc.feedback.domain.FeedbackReview;
import ewt.msvc.feedback.service.dto.FeedbackReviewDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = FeedbackItemMapper.class)
public interface FeedbackReviewMapper {

    FeedbackReview toEntity(FeedbackReviewDTO feedbackReviewDTO);

    FeedbackReviewDTO toDTO(FeedbackReview feedbackReview);
}