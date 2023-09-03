package ewt.msvc.feedback.service.mapper;

import ewt.msvc.feedback.domain.FeedbackReviewImage;
import ewt.msvc.feedback.service.dto.FeedbackReviewImageDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeedbackReviewImageMapper {

    FeedbackReviewImage toEntity(FeedbackReviewImageDTO feedbackReviewImageDTO);

    FeedbackReviewImageDTO toDTO(FeedbackReviewImage feedbackReviewImage);
}