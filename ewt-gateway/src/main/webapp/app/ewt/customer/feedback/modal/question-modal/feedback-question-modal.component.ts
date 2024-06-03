import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackQuestionService } from '../../service/feedback-question.service';

@Component({
  selector: 'ewt-customer-feedback-question-modal',
  templateUrl: 'feedback-question-modal.component.html',
})
export class FeedbackQuestionModalComponent implements OnInit {
  productId!: number;

  questionForm!: FormGroup;

  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder, private feedbackQuestionService: FeedbackQuestionService) {}

  ngOnInit() {
    if (!this.productId) {
      this.dismissModal();
    }
    this.initForm();
  }

  private initForm() {
    this.questionForm = this.fb.group({
      id: [null],
      question: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      productId: [this.productId],
    });
  }

  dismissModal() {
    this.activeModal.dismiss();
  }

  closeModal() {
    this.activeModal.close();
  }

  submitQuestion() {
    this.feedbackQuestionService.saveQuestion(this.questionForm.value).subscribe({
      next: () => {
        this.closeModal();
      },
      error: () => {
        this.dismissModal();
      },
    });
  }
}
