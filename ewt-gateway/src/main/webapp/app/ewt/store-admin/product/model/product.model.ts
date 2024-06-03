import { IProductVariant } from './product-variant.model';
import { IProductCategory } from './product-category.model';
import { IProductAttribute } from './product-attribute.model';
import { IFeedbackReviewInfo } from '../../../customer/feedback/model/feedback-review-info.model';
import { SafeHtml } from '@angular/platform-browser';

export interface IProduct {
  id: number;
  name: string;
  description: SafeHtml | string;
  feedbackReviewInfo: IFeedbackReviewInfo;
  productVariants: IProductVariant[];
  productCategories: IProductCategory[];
  productAttributes: IProductAttribute[];
}
