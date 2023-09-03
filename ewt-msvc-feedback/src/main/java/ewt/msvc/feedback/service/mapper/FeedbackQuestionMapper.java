package ewt.msvc.feedback.service.mapper;

import ewt.msvc.feedback.domain.FeedbackItem;
import ewt.msvc.feedback.domain.FeedbackQuestion;
import ewt.msvc.feedback.service.dto.FeedbackItemDTO;
import ewt.msvc.feedback.service.dto.FeedbackQuestionDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = FeedbackItemMapper.class)
public interface FeedbackQuestionMapper {

    FeedbackQuestion toEntity(FeedbackQuestionDTO feedbackQuestionDTO);

    FeedbackQuestionDTO toDTO(FeedbackQuestion feedbackQuestion);
}