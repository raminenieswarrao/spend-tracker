import { CommonModule } from '@angular/common';

import {
Component
} from '@angular/core';

import {
FormsModule
} from '@angular/forms';

import {
Router,
RouterLink
} from '@angular/router';

import {
IonButton,
IonContent,
IonHeader,
IonInput,
IonItem,
IonLabel,
IonSpinner,
IonTitle,
IonToolbar
} from '@ionic/angular';

import {
AuthService,
RegisterRequest
} from '../services/auth.service';

@Component({
selector: 'app-register',
templateUrl: './register.page.html',
styleUrls: ['./register.page.scss'],
standalone: true,
imports: [
CommonModule,
FormsModule,
RouterLink,
IonButton,
IonContent,
IonHeader,
IonInput,
IonItem,
IonLabel,
IonSpinner,
IonTitle,
IonToolbar
]
})
export class RegisterPage {

name = '';
email = '';
password = '';
confirmPassword = '';

loading = false;
errorMessage = '';

constructor(
    private readonly authService:
      AuthService,

    private readonly router:
      Router
  ) {}

  register(): void {

    this.errorMessage = '';

    const name =
      this.name.trim();

    const email =
      this.email.trim();

    if (!name) {

      this.errorMessage =
        'Name is required.';

      return;
    }

    if (name.length < 2) {

      this.errorMessage =
        'Name must be at least 2 characters.';

      return;
    }

    if (!email) {

      this.errorMessage =
        'Email is required.';

      return;
    }

    if (!this.password) {

      this.errorMessage =
        'Password is required.';

      return;
    }

    if (this.password.length < 12) {

      this.errorMessage =
        'Password must be at least 12 characters.';

      return;
    }

    if (
      this.password !==
      this.confirmPassword
    ) {

      this.errorMessage =
        'Passwords do not match.';

      return;
    }

    const request:
      RegisterRequest = {

      name,
      email,

      password:
        this.password,

      confirmPassword:
        this.confirmPassword
    };

    this.loading = true;

    this.authService
      .register(request)
      .subscribe({

        next: () => {

          /*
           * Registration creates the account,
           * but does not automatically log in.
           *
           * Send the user to the login page.
           */
          this.loading = false;

          this.password = '';
          this.confirmPassword = '';

          this.router.navigate(
            ['/login'],
            {
              queryParams: {
                registered: 'true'
              },
              replaceUrl: true
            }
          );
        },

        error: error => {

          this.loading = false;

          if (
            error?.status === 0
          ) {

            this.errorMessage =
              'Unable to connect to the server.';

            return;
          }

          if (
            error?.error?.fieldErrors
          ) {

            const firstError =
              Object.values(
                error.error.fieldErrors
              )[0];

            if (
              typeof firstError ===
              'string'
            ) {

              this.errorMessage =
                firstError;

              return;
            }
          }

          this.errorMessage =
            error?.error?.message
            ?? 'Unable to create account.';
        }
      });
  }
}
