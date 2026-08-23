import {
  Injectable,
isDevMode
} from '@angular/core';

import {
HttpClient,
HttpHeaders,
HttpParams
} from '@angular/common/http';

import {
Observable,
switchMap
} from 'rxjs';

export interface Expense {
id: number;
amount: number;
category: string;
merchant?: string;
description?: string;
expenseDate: string;
paymentMethod?: string;
notes?: string;
createdAt?: string;
}

export interface CreateExpenseRequest {
amount: number;
category: string;
merchant?: string;
description?: string;
expenseDate: string;
paymentMethod?: string;
notes?: string;
}

interface CsrfResponse {
headerName: string;
parameterName: string;
token: string;
}

@Injectable({
providedIn: 'root'
})
export class ExpenseService {

private readonly apiUrl =
isDevMode()
? 'http://localhost:8080/api/expenses'
: '/api/expenses';

private readonly authApiUrl =
isDevMode()
? 'http://localhost:8080/api/auth'
: '/api/auth';

constructor(
    private readonly http: HttpClient
  ) {}

  getExpenses(
    year: number,
    month?: number
  ): Observable<Expense[]> {

    let params =
      new HttpParams()
        .set(
          'year',
          year.toString()
        );

    if (month !== undefined) {

      params =
        params.set(
          'month',
          month.toString()
        );
    }

    return this.http.get<Expense[]>(
      this.apiUrl,
      {
        params,
        withCredentials: true
      }
    );
  }

  createExpense(
    expense: CreateExpenseRequest
  ): Observable<Expense> {

    return this.getCsrfToken()
      .pipe(

        switchMap(csrf => {

          const headers =
            new HttpHeaders()
              .set(
                csrf.headerName,
                csrf.token
              );

          return this.http.post<Expense>(
            this.apiUrl,
            expense,
            {
              headers,
              withCredentials: true
            }
          );
        })
      );
  }

  updateExpense(
    id: number,
    expense: CreateExpenseRequest
  ): Observable<Expense> {

    return this.getCsrfToken()
      .pipe(

        switchMap(csrf => {

          const headers =
            new HttpHeaders()
              .set(
                csrf.headerName,
                csrf.token
              );

          return this.http.put<Expense>(
            `${this.apiUrl}/${id}`,
            expense,
            {
              headers,
              withCredentials: true
            }
          );
        })
      );
  }

  deleteExpense(
    id: number
  ): Observable<void> {

    return this.getCsrfToken()
      .pipe(

        switchMap(csrf => {

          const headers =
            new HttpHeaders()
              .set(
                csrf.headerName,
                csrf.token
              );

          return this.http.delete<void>(
            `${this.apiUrl}/${id}`,
            {
              headers,
              withCredentials: true
            }
          );
        })
      );
  }

  private getCsrfToken():
    Observable<CsrfResponse> {

    return this.http.get<CsrfResponse>(
      `${this.authApiUrl}/csrf`,
      {
        withCredentials: true
      }
    );
  }
}
