package ewt.msvc.feedback.service.mapper;

import ewt.msvc.feedback.domain.FeedbackItem;
import ewt.msvc.feedback.service.dto.FeedbackItemDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FeedbackItemMapper {

    FeedbackItem toEntity(FeedbackItemDTO feedbackItemDTO);

    FeedbackItemDTO toDTO(FeedbackItem feedbackItem);
}