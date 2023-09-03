import dayjs from "dayjs/esm";

export interface IFeedbackItem {
  id: number;
  productId: number;
  firstName: string;
  lastName: string;
  email: string;
  creationDate: dayjs.Dayjs;
}
