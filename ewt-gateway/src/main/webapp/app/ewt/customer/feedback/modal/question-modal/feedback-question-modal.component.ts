import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {Component, OnInit} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'ewt-customer-feedback-question-modal',
  templateUrl: 'feedback-question-modal.component.html',
})
export class FeedbackQuestionModalComponent implements OnInit {

  questionForm!: FormGroup;

  constructor(private activeModal: NgbActiveModal, private fb: FormBuilder) {
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.questionForm = this.fb.group({
      id: [null],
      question: [null, Validators.required],
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
    });
  }

  closeModal() {
    this.activeModal.dismiss();
  }

  submitQuestion() {
    console.log(this.questionForm.value);

    //this.closeModal();
  }
}
