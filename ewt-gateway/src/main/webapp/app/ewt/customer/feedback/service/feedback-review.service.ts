import { Injectable } from '@angular/core';
import { ApplicationConfigService } from '../../../../core/config/application-config.service';
import { MSVC_FEEDBACK } from '../../../../config/msvc.constants';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IFeedbackReview } from '../model/feedback-review.model';
import { createRequestOption } from '../../../../core/request/request-util';
import { IFeedbackReviewInfo } from '../model/feedback-review-info.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackReviewService {
  private feedbackUrl = this.applicationConfigService.getEndpointFor('api/feedback/review', MSVC_FEEDBACK);

  constructor(private applicationConfigService: ApplicationConfigService, private httpClient: HttpClient) {}

  public getReviewImageByRef(ref: string) {
    const params = new HttpParams().set('ref', ref);
    return this.httpClient.get(`${this.feedbackUrl}/image`, {
      params: params,
      responseType: 'blob',
    });
  }

  public getReviewInfoForProduct(productId: number) {
    return this.httpClient.get<IFeedbackReviewInfo>(`${this.feedbackUrl}/${productId}/info`);
  }

  public getReviewsPageForProduct(productId: number, pageable: any) {
    let options = createRequestOption(pageable);
    return this.httpClient.get<IFeedbackReview[]>(`${this.feedbackUrl}/${productId}`, {
      params: options,
      observe: 'response',
    });
  }

  public saveReview(review: IFeedbackReview, images: File[]) {
    const formData = new FormData();

    formData.append(
      'feedbackReview',
      new Blob([JSON.stringify(review)], {
        type: 'application/json',
      })
    );

    images.forEach(image => {
      formData.append('images', image, image.name);
    });

    return this.httpClient.post<void>(`${this.feedbackUrl}`, formData);
  }
}
