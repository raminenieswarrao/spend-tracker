import { Injectable, isDevMode } from '@angular/core';

import {
HttpClient,
HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

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

@Injectable({
providedIn: 'root'
})
export class ExpenseService {

private readonly apiUrl = isDevMode()
? 'http://localhost:8080/api/expenses'
: '/api/expenses';

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
      { params }
    );
  }

  createExpense(
    expense: CreateExpenseRequest
  ): Observable<Expense> {

    return this.http.post<Expense>(
      this.apiUrl,
      expense
    );
  }

  updateExpense(
    id: number,
    expense: CreateExpenseRequest
  ): Observable<Expense> {

    return this.http.put<Expense>(
      `${this.apiUrl}/${id}`,
      expense
    );
  }

  deleteExpense(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
