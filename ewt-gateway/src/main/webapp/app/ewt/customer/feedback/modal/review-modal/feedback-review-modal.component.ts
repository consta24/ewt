import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FeedbackReviewService} from "../../service/feedback-review.service";

@Component({
  selector: 'ewt-customer-feedback-review-modal',
  templateUrl: 'feedback-review-modal.component.html',
  styleUrls: ['feedback-review-modal.component.scss']
})
export class FeedbackReviewModalComponent implements OnInit, OnDestroy {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  productId!: number;

  reviewForm!: FormGroup;

  images: File[] = [];
  imagesPreviews: string[] = [];

  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder, private feedbackService: FeedbackReviewService) {
  }

  ngOnInit() {
    if (!this.productId) {
      this.dismissModal();
    }
    this.initForm();
  }

  ngOnDestroy() {
    this.imagesPreviews.forEach(url => URL.revokeObjectURL(url));
  }

  dismissModal() {
    this.activeModal.dismiss();
  }

  closeModal() {
    this.activeModal.close();
  }

  submitReview() {
    this.feedbackService.saveReview(this.reviewForm.value, this.images).subscribe({
      next: () => {
        this.closeModal();
      },
      error: () => {
        this.dismissModal();
      }
    })
  }

  handleRatingChange(score: number) {
    this.score = score;
  }

  onImageDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onImageDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.images.push(...Array.from(files));

      const newImagePreviews = Array.from(files).map(file => URL.createObjectURL(file));
      this.imagesPreviews.push(...newImagePreviews);
    }
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.images.push(...Array.from(input.files));

      const newImagePreviews = Array.from(input.files).map(file => URL.createObjectURL(file));
      this.imagesPreviews.push(...newImagePreviews);
    }
  }

  removeImage(index: number) {
    this.images.splice(index, 1);

    URL.revokeObjectURL(this.imagesPreviews[index]);
    this.imagesPreviews.splice(index, 1);
  }

  private initForm() {
    this.reviewForm = this.fb.group({
      id: [null],
      productId: [this.productId],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      score: [5],
      review: [null, Validators.required],
      isVerified: [false],
    });
  }

  set score(score: number) {
    this.reviewForm.get('score')?.setValue(score);
  }
}
