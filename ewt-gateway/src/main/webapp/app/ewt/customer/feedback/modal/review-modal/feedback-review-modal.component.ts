import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {FeedbackService} from "../../service/feedback.service";

@Component({
  selector: 'ewt-customer-feedback-review-modal',
  templateUrl: 'feedback-review-modal.component.html',
  styleUrls: ['feedback-review-modal.component.scss']
})
export class FeedbackReviewModalComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  productId!: number;
  images: string[] = [];
  reviewForm!: FormGroup;

  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder, private feedbackService: FeedbackService) {
  }

  ngOnInit() {
    if (!this.productId) {
      this.dismissModal();
    }
    this.initForm();
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
      reviewImages: this.fb.array([])
    });
  }

  dismissModal() {
    this.activeModal.dismiss();
  }

  closeModal() {
    this.activeModal.close();
  }

  submitReview() {
    this.attachImagesToForm();
    this.feedbackService.saveReview(this.reviewForm.value).subscribe({
      next: () => {
        this.closeModal();
      },
      error: () => {
        this.dismissModal();
      }
    })
  }

  attachImagesToForm() {
    this.images.forEach(image => {
      (this.reviewForm.get('reviewImages') as FormArray).push(this.fb.group({
        ref: image
      }))
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
      this.previewFiles(files);
    }
  }

  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.previewFiles(input.files);
    }
  }

  removeImage(imageIndex: number) {
    this.images.splice(imageIndex, 1);
  }


  previewFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          const src = event.target?.result as string;
          if (!this.images.includes(src)) {
            this.images.push(event.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  set score(score: number) {
    this.reviewForm.get('score')?.setValue(score);
  }
}
