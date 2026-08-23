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
LoginRequest
} from '../services/auth.service';

@Component({
selector: 'app-login',
templateUrl: './login.page.html',
styleUrls: ['./login.page.scss'],
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
export class LoginPage {

email = '';

password = '';

loading = false;

errorMessage = '';

constructor(
    private readonly authService:
      AuthService,

    private readonly router:
      Router
  ) {}

  login(): void {

    this.errorMessage = '';

    const email =
      this.email.trim();

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

    const request:
      LoginRequest = {

      email,

      password:
        this.password
    };

    this.loading = true;

    this.authService
      .login(request)
      .subscribe({

        next: () => {

          this.loading = false;

          this.password = '';

          this.router
            .navigateByUrl(
              '/home',
              {
                replaceUrl: true
              }
            );
        },

        error: error => {

          this.loading = false;

          if (
            error?.status === 401
          ) {

            this.errorMessage =
              'Invalid email or password.';

            return;
          }

          if (
            error?.status === 0
          ) {

            this.errorMessage =
              'Unable to connect to the server.';

            return;
          }

          this.errorMessage =
            error?.error?.message
            ?? 'Unable to sign in. Please try again.';
        }
      });
  }
}
