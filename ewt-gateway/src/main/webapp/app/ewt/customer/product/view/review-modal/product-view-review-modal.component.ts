import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, ElementRef, OnInit, ViewChild} from "@angular/core";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'ewt-customer-product-view-review-modal',
  templateUrl: 'product-view-review-modal.component.html',
  styleUrls: ['product-view-review-modal.component.scss']
})
export class ProductViewReviewModalComponent implements OnInit {
  @ViewChild('imageInput') imageInput!: ElementRef<HTMLInputElement>;

  images: string[] = [];
  reviewForm!: FormGroup;

  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.reviewForm = this.fb.group({
      id: [null],
      score: [5],
      review: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, Validators.required],
      imagesFiles: this.fb.array([])
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  submitReview() {
    console.log(this.reviewForm.value);
    this.closeModal();
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
    this.imagesFiles.removeAt(imageIndex);
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
            this.imagesFiles.controls.push(this.fb.control(src));
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  get imagesFiles(): FormArray {
    return this.reviewForm.get('imagesFiles') as FormArray;
  }

  set score(score: number) {
    this.reviewForm.get('score')?.setValue(score);
  }
}
