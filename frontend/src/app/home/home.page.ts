import { CommonModule } from '@angular/common';
import {
ChangeDetectorRef,
Component,
OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
IonContent,
IonSpinner
} from '@ionic/angular';

import {
SpendingAnalyticsComponent
} from './components/spending-analytics/spending-analytics.component';

import {
CATEGORIES
} from './config/categories.config';

import {
buildYearOptions,
MONTHLY_BUDGET,
MONTHS,
PAYMENT_METHODS
} from './config/home-options.config';

import {
getMerchantImage,
getOtherMerchant,
getQuickMerchantByName,
getQuickMerchants
} from './config/merchants.config';

import {
CategorySummary,
PeriodMode,
QuickMerchantOption
} from './models/home.models';

import {
calculateCategorySummaries,
calculateTotalSpent
} from './utils/expense-analytics.util';

import {
AuthService
} from '../services/auth.service';

import {
CreateExpenseRequest,
Expense,
ExpenseService
} from '../services/expense.service';

@Component({
selector: 'app-home',
templateUrl: 'home.page.html',
styleUrls: ['home.page.scss'],
standalone: true,
imports: [
CommonModule,
FormsModule,
IonContent,
IonSpinner,
SpendingAnalyticsComponent
]
})
export class HomePage implements OnInit {

expenses: Expense[] = [];
categorySummaries: CategorySummary[] = [];

totalSpent = 0;
loading = true;

readonly monthlyBudget = MONTHLY_BUDGET;
readonly months = MONTHS;
readonly years = buildYearOptions();
readonly paymentMethods = PAYMENT_METHODS;
readonly categories = CATEGORIES;

periodMode: PeriodMode = 'MONTH';

selectedYear =
new Date().getFullYear();

  selectedMonth =
    new Date().getMonth() + 1;

  addExpenseOpen = false;
  saving = false;
  deleting = false;

  saveError = '';

  editingExpenseId:
    number | null = null;

  selectedQuickMerchantKey:
    string | null = null;

  newExpense:
    CreateExpenseRequest =
      this.createEmptyExpense();

  constructor(
    private readonly expenseService:
      ExpenseService,

    private readonly authService:
      AuthService,

    private readonly router:
      Router,

    private readonly cdr:
      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
  }

  logout(): void {

    this.authService
      .logout()
      .subscribe({
        next: () => {

          this.router.navigateByUrl(
            '/login',
            {
              replaceUrl: true
            }
          );
        },

        error: error => {

          console.error(
            'Unable to log out',
            error
          );
        }
      });
  }

  setPeriodMode(
    mode: PeriodMode
  ): void {

    if (
      this.periodMode === mode
    ) {
      return;
    }

    this.periodMode = mode;

    this.loadExpenses();
  }

  onPeriodChange(): void {
    this.loadExpenses();
  }

  loadExpenses(): void {

    this.loading = true;

    const month =
      this.periodMode === 'MONTH'
        ? this.selectedMonth
        : undefined;

    this.expenseService
      .getExpenses(
        this.selectedYear,
        month
)
.subscribe({
        next: expenses => {

          this.expenses =
            expenses;

          this.calculateSummary();

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: error => {

          console.error(
            'Unable to load expenses',
            error
          );

          this.loading = false;

          this.cdr.detectChanges();
        }
      });
  }

  openAddExpense(): void {

    this.editingExpenseId =
      null;

    this.selectedQuickMerchantKey =
      null;

    this.newExpense =
      this.createEmptyExpense();

    this.saveError = '';

    this.addExpenseOpen = true;
  }

  openEditExpense(
    expense: Expense
  ): void {

    this.editingExpenseId =
      expense.id;

    this.newExpense = {
      amount:
        Number(expense.amount),

      category:
        expense.category,

      merchant:
        expense.merchant ?? '',

      description:
        expense.description ?? '',

      expenseDate:
        expense.expenseDate,

      paymentMethod:
        expense.paymentMethod ??
        'Credit Card',

      notes:
        expense.notes ?? ''
    };

    this.selectedQuickMerchantKey =
      this.findQuickMerchantKey(
        expense.category,
        expense.merchant ?? ''
      );

    this.saveError = '';

    this.addExpenseOpen = true;
  }

  closeAddExpense(): void {

    if (
      this.saving ||
      this.deleting
    ) {
      return;
    }

    this.addExpenseOpen =
      false;

    this.editingExpenseId =
      null;

    this.selectedQuickMerchantKey =
      null;

    this.saveError = '';
  }

  selectCategory(
    category: string
  ): void {

    const categoryChanged =
      this.newExpense.category !==
      category;

    this.newExpense.category =
      category;

    if (categoryChanged) {

      this.newExpense.merchant =
        '';

      this.selectedQuickMerchantKey =
        null;
    }
  }

  selectQuickMerchant(
    option: QuickMerchantOption
  ): void {

    this.selectedQuickMerchantKey =
      option.key;

    this.newExpense.merchant =
      option.merchant;
  }

  onMerchantInput(): void {

    this.selectedQuickMerchantKey =
      this.findQuickMerchantKey(
        this.newExpense.category,
        this.newExpense.merchant ?? ''
      );
  }

  isQuickMerchantSelected(
    option: QuickMerchantOption
  ): boolean {

    return (
      this.selectedQuickMerchantKey ===
      option.key
    );
  }

  saveExpense(): void {

    this.saveError = '';

    if (
      !this.newExpense.amount ||
      this.newExpense.amount <= 0
    ) {

      this.saveError =
        'Enter an amount greater than $0.';

      return;
    }

    if (!this.newExpense.category) {

      this.saveError =
        'Choose a spending category.';

      return;
    }

    if (!this.newExpense.expenseDate) {

      this.saveError =
        'Choose an expense date.';

      return;
    }

    this.saving = true;

    const request$ =
      this.editingExpenseId === null
        ? this.expenseService
          .createExpense(
            this.newExpense
)
: this.expenseService
.updateExpense(
            this.editingExpenseId,
            this.newExpense
          );

    request$.subscribe({
      next: () => {

        this.saving = false;

        this.addExpenseOpen =
          false;

        this.editingExpenseId =
          null;

        this.selectedQuickMerchantKey =
          null;

        this.loadExpenses();
      },

      error: error => {

        console.error(
          'Unable to save expense',
          error
        );

        this.saveError =
          'Unable to save expense.';

        this.saving = false;

        this.cdr.detectChanges();
      }
    });
  }

  deleteExpense(): void {

    if (
      this.editingExpenseId === null
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        'Delete this expense?'
      );

    if (!confirmed) {
      return;
    }

    this.deleting = true;

    this.expenseService
      .deleteExpense(
        this.editingExpenseId
)
.subscribe({
        next: () => {

          this.deleting = false;

          this.addExpenseOpen =
            false;

          this.editingExpenseId =
            null;

          this.selectedQuickMerchantKey =
            null;

          this.loadExpenses();
        },

        error: error => {

          console.error(
            'Unable to delete expense',
            error
          );

          this.saveError =
            'Unable to delete expense.';

          this.deleting = false;

          this.cdr.detectChanges();
        }
      });
  }

  get quickMerchants():
    QuickMerchantOption[] {

    return getQuickMerchants(
      this.newExpense.category
    );
  }

  getTransactionMerchantImage(
    expense: Expense
  ): string | null {

    const merchant =
      expense.merchant?.trim() ?? '';

    if (!merchant) {
      return null;
    }

    return getMerchantImage(
      expense.category,
      merchant
    );
  }

  getCategoryLabel(
    category: string
  ): string {

    return (
      this.categories
        .find(
          item =>
            item.value === category
)
?.label ??
category
);
}

getCategoryIcon(
    category: string
  ): string {

    return (
      this.categories
        .find(
          item =>
            item.value === category
)
?.icon ??
'💵'
);
}

get userInitial(): string {

    const user =
      this.authService
        .getCurrentUserValue();

    const value =
      user?.name?.trim() ||
      user?.email?.trim() ||
      'U';

    return value
      .charAt(0)
      .toUpperCase();
  }

  get periodBudget(): number {

    return (
      this.periodMode === 'MONTH'
        ? this.monthlyBudget
        : this.monthlyBudget * 12
    );
  }

  get remainingBudget(): number {

    return Math.max(
      this.periodBudget -
      this.totalSpent,
      0
    );
  }

  get budgetPercentage(): number {

    if (
      this.periodBudget <= 0
    ) {
      return 0;
    }

    return Math.min(
      (
        this.totalSpent /
        this.periodBudget
      ) * 100,
      100
    );
  }

  get periodLabel(): string {

    if (
      this.periodMode === 'YEAR'
    ) {

      return String(
        this.selectedYear
      );
    }

    const month =
      this.months.find(
        item =>
          item.value ===
          this.selectedMonth
      );

    return `${
      month?.label ?? ''
    } ${this.selectedYear}`;
  }

  get periodDescription(): string {

    return (
      this.periodMode === 'MONTH'
        ? 'this month'
        : 'this year'
    );
  }

  get budgetLabel(): string {

    return (
      this.periodMode === 'MONTH'
        ? 'Monthly budget'
        : 'Year budget'
    );
  }

  private calculateSummary(): void {

    this.totalSpent =
      calculateTotalSpent(
        this.expenses
      );

    this.categorySummaries =
      calculateCategorySummaries(
        this.expenses,
        this.categories
      );
  }

  private findQuickMerchantKey(
    category: string,
    merchant: string
  ): string | null {

    const normalizedMerchant =
      merchant.trim();

    if (!normalizedMerchant) {
      return null;
    }

    const matchedMerchant =
      getQuickMerchantByName(
        category,
        normalizedMerchant
      );

    if (matchedMerchant) {
      return matchedMerchant.key;
    }

    const otherMerchant =
      getOtherMerchant(
        category
      );

    return (
      otherMerchant?.key ?? null
    );
  }

  private createEmptyExpense():
    CreateExpenseRequest {

    return {
      amount: 0,
      category: '',
      merchant: '',
      description: '',

      expenseDate:
        this.getTodayDate(),

      paymentMethod:
        'Credit Card',

      notes: ''
    };
  }

  private getTodayDate(): string {

    const now =
      new Date();

    return [
      now.getFullYear(),

      String(
        now.getMonth() + 1
      ).padStart(2, '0'),

      String(
        now.getDate()
      ).padStart(2, '0')

    ].join('-');
  }
}
