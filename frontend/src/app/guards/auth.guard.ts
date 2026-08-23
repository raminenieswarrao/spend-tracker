import {
  inject
} from '@angular/core';

import {
CanActivateFn,
Router
} from '@angular/router';

import {
map
} from 'rxjs';

import {
AuthService
} from '../services/auth.service';

export const authGuard:
CanActivateFn = () => {

const authService =
inject(AuthService);

  const router =
    inject(Router);

  /*
   * Try to restore the authenticated session.
   *
   * Flow:
   *
   * /me
   *   ↓ fails
   * /refresh
   *   ↓ succeeds
   * /me again
   *
   * If all fail, user goes back to /login.
   */
  return authService
    .restoreSession()
    .pipe(

      map(user => {

        if (user) {
          return true;
        }

        return router
          .createUrlTree(
            ['/login']
          );
      })
    );
};
