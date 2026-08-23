import {
  Injectable,
isDevMode
} from '@angular/core';

import {
HttpClient,
HttpHeaders
} from '@angular/common/http';

import {
BehaviorSubject,
Observable,
catchError,
of,
switchMap,
tap
} from 'rxjs';

export interface AuthUser {
userId: number;
name: string;
email: string;
role: 'USER' | 'ADMIN';
}

export interface LoginRequest {
email: string;
password: string;
}

export interface RegisterRequest {
name: string;
email: string;
password: string;
confirmPassword: string;
}

interface CsrfResponse {
headerName: string;
parameterName: string;
token: string;
}

@Injectable({
providedIn: 'root'
})
export class AuthService {

private readonly apiUrl =
isDevMode()
? 'http://localhost:8080/api/auth'
: '/api/auth';

private readonly currentUserSubject =
new BehaviorSubject<AuthUser | null>(
null
);

readonly currentUser$ =
this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient
  ) {}

  login(
    request: LoginRequest
  ): Observable<AuthUser> {

    return this.http.post<AuthUser>(
      `${this.apiUrl}/login`,
      request,
      {
        withCredentials: true
      }
    ).pipe(
      tap(user => {
        this.currentUserSubject.next(
          user
        );
      })
    );
  }

  register(
    request: RegisterRequest
  ): Observable<AuthUser> {

    return this.http.post<AuthUser>(
      `${this.apiUrl}/register`,
      request,
      {
        withCredentials: true
      }
    );
  }

  getCurrentUser(): Observable<AuthUser> {

    return this.http.get<AuthUser>(
      `${this.apiUrl}/me`,
      {
        withCredentials: true
      }
    ).pipe(
      tap(user => {
        this.currentUserSubject.next(
          user
        );
      })
    );
  }

  restoreSession(): Observable<AuthUser | null> {

    return this.getCurrentUser().pipe(

      catchError(() => {

        return this.refresh().pipe(

          switchMap(() =>
            this.getCurrentUser()
          ),

          catchError(() => {

            this.currentUserSubject.next(
              null
            );

            return of(null);
          })
        );
      })
    );
  }

  refresh(): Observable<void> {

    return this.getCsrfToken().pipe(

      switchMap(csrf => {

        const headers =
          new HttpHeaders()
            .set(
              csrf.headerName,
              csrf.token
            );

        return this.http.post<void>(
          `${this.apiUrl}/refresh`,
          {},
          {
            headers,
            withCredentials: true
          }
        );
      })
    );
  }

  logout(): Observable<void> {

    return this.getCsrfToken().pipe(

      switchMap(csrf => {

        const headers =
          new HttpHeaders()
            .set(
              csrf.headerName,
              csrf.token
            );

        return this.http.post<void>(
          `${this.apiUrl}/logout`,
          {},
          {
            headers,
            withCredentials: true
          }
        );
      }),

      tap(() => {
        this.currentUserSubject.next(
          null
        );
      })
    );
  }

  isAuthenticated(): boolean {

    return this.currentUserSubject.value
      !== null;
  }

  getCurrentUserValue():
    AuthUser | null {

    return this.currentUserSubject.value;
  }

  private getCsrfToken():
    Observable<CsrfResponse> {

    return this.http.get<CsrfResponse>(
      `${this.apiUrl}/csrf`,
      {
        withCredentials: true
      }
    );
  }
}
