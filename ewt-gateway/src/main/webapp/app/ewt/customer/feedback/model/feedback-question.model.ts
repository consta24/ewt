import { IFeedbackItem } from './feedback-item.model';

export interface IFeedbackQuestion extends IFeedbackItem {
  question: string;
  answer: string;
}
