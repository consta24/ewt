package ewt.msvc.feedback.service;


import ewt.msvc.config.utils.StringUtil;
import ewt.msvc.feedback.repository.FeedbackQuestionRepository;
import ewt.msvc.feedback.repository.FeedbackQuestionRepositoryQuery;
import ewt.msvc.feedback.service.dto.FeedbackQuestionDTO;
import ewt.msvc.feedback.service.mapper.FeedbackQuestionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional
public class FeedbackQuestionService {

    private final FeedbackQuestionMapper feedbackQuestionMapper;

    private final FeedbackQuestionRepository feedbackQuestionRepository;
    private final FeedbackQuestionRepositoryQuery feedbackQuestionRepositoryQuery;


    public Mono<Long> countByProduct(Long productId) {
        return feedbackQuestionRepository.countByProductId(productId);
    }

    public Flux<FeedbackQuestionDTO> getQuestionsPageForProduct(Long productId, Pageable pageable) {
        return feedbackQuestionRepositoryQuery.findAllByProductId(productId, pageable)
                .map(feedbackQuestionMapper::toDTO);
    }

    public Mono<Void> saveQuestion(FeedbackQuestionDTO feedbackQuestionDTO) {
        feedbackQuestionDTO.setFirstName(StringUtil.toTitleCase(feedbackQuestionDTO.getFirstName()));
        feedbackQuestionDTO.setLastName(StringUtil.toTitleCase(feedbackQuestionDTO.getLastName()));
        feedbackQuestionDTO.setCreationDate(LocalDate.now());

        return this.feedbackQuestionRepository.save(feedbackQuestionMapper.toEntity(feedbackQuestionDTO))
                .then();
    }

    public Mono<Void> deleteQuestion(Long id) {
        return this.feedbackQuestionRepository.deleteById(id)
                .then();
    }
}
