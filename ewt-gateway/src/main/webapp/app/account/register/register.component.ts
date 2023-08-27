import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';

import {
  EMAIL_ALREADY_USED_DETAIL,
  EMAIL_ALREADY_USED_TYPE,
  LOGIN_ALREADY_USED_DETAIL,
  LOGIN_ALREADY_USED_TYPE
} from 'app/config/error.constants';
import {RegisterService} from './register.service';

@Component({
  selector: 'jhi-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('login', {static: false})
  login?: ElementRef;

  doNotMatch = false;
  error = false;
  errorEmailExists = false;
  errorUserExists = false;
  success = false;

  registerForm = new FormGroup({
    login: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern('^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'),
      ],
    }),

    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern("^[a-zA-Z-' ]*$")],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(1), Validators.maxLength(50), Validators.pattern("^[a-zA-Z-' ]*$")],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),
  });

  constructor(private translateService: TranslateService, private registerService: RegisterService) {
  }

  ngAfterViewInit(): void {
    if (this.login) {
      this.login.nativeElement.focus();
    }
  }

  register(): void {
    this.doNotMatch = false;
    this.error = false;
    this.errorEmailExists = false;
    this.errorUserExists = false;

    const {password, confirmPassword} = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch = true;
    } else {
      const {login, email, firstName, lastName} = this.registerForm.getRawValue();
      this.registerService
        .save({login, firstName, lastName, email, password, langKey: this.translateService.currentLang})
        .subscribe({
          next: (response: any) => this.checkForErrors(response),
          error: response => this.processError(response)
        });
    }
  }

  private checkForErrors(response: any) {
    if (!response) {
      this.success = true;
    }
    if (response.detail === LOGIN_ALREADY_USED_DETAIL) {
      this.errorUserExists = true;
    } else if (response.detail === EMAIL_ALREADY_USED_DETAIL) {
      this.errorEmailExists = true;
    } else if (response.detail) {
      this.error = true
    }
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === LOGIN_ALREADY_USED_TYPE) {
      this.errorUserExists = true;
    } else if (response.status === 400 && response.error.type === EMAIL_ALREADY_USED_TYPE) {
      this.errorEmailExists = true;
    } else {
      this.error = true;
    }
  }
}
