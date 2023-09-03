import {IFeedbackItem} from "./feedback-item.model";
import {IFeedbackReviewImage} from "./feedback-review-image.model";

export interface IFeedbackReview extends IFeedbackItem {
  score: number;
  review: string;
  isVerified: boolean;
  reviewImages: IFeedbackReviewImage[];
}
