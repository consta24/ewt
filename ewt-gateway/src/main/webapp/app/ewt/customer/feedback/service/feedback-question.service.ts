import { Injectable } from '@angular/core';
import { ApplicationConfigService } from '../../../../core/config/application-config.service';
import { MSVC_FEEDBACK } from '../../../../config/msvc.constants';
import { HttpClient } from '@angular/common/http';
import { createRequestOption } from '../../../../core/request/request-util';
import { IFeedbackQuestion } from '../model/feedback-question.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackQuestionService {
  private feedbackQuestionUrl = this.applicationConfigService.getEndpointFor('api/feedback/question', MSVC_FEEDBACK);

  constructor(private applicationConfigService: ApplicationConfigService, private httpClient: HttpClient) {}

  public getQuestionsPageForProduct(productId: number, pageable: any) {
    let options = createRequestOption(pageable);
    return this.httpClient.get<IFeedbackQuestion[]>(`${this.feedbackQuestionUrl}/${productId}`, { params: options, observe: 'response' });
  }

  public saveQuestion(question: IFeedbackQuestion) {
    return this.httpClient.post<IFeedbackQuestion>(this.feedbackQuestionUrl, question);
  }
}
