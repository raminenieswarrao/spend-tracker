import {
  Expense
} from '../../services/expense.service';

import {
getMerchantImage,
getOtherMerchant
} from '../config/merchants.config';

import {
MerchantSpendSummary
} from '../models/analytics.models';

import {
CategoryOption,
CategorySummary
} from '../models/home.models';


export function calculateTotalSpent(
  expenses: Expense[]
): number {

  return expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );
}


export function calculateCategorySummaries(
  expenses: Expense[],
  categories: CategoryOption[]
): CategorySummary[] {

  const totalSpent =
    calculateTotalSpent(expenses);

  const categoryTotals =
    new Map<string, number>();

  for (const expense of expenses) {

    const currentAmount =
      categoryTotals.get(
        expense.category
      ) ?? 0;

    categoryTotals.set(
      expense.category,
      currentAmount +
      Number(expense.amount)
    );
  }

  return Array
    .from(categoryTotals.entries())
    .map(([category, amount]) => {

      const categoryOption =
        categories.find(
          option =>
            option.value === category
        );

      return {
        value: category,
        label:
          categoryOption?.label ??
          category,
        icon:
          categoryOption?.icon ??
          '💵',
        color:
          categoryOption?.color ??
          '#94a3b8',
        amount,
        percentage:
          totalSpent > 0
            ? (
              amount /
              totalSpent
            ) * 100
            : 0
      };
    })
    .sort(
      (first, second) =>
        second.amount -
        first.amount
    );
}


export function calculateMerchantSummaries(
  expenses: Expense[],
  category: string
): MerchantSpendSummary[] {

  const merchantTotals =
    new Map<
      string,
      {
        name: string;
        amount: number;
        transactionCount: number;
      }
    >();

  for (const expense of expenses) {

    if (
      expense.category !== category
    ) {
      continue;
    }

    const merchantName =
      expense.merchant?.trim() ||
      'Unspecified';

    const merchantKey =
      normalizeMerchantName(
        merchantName
      );

    const current =
      merchantTotals.get(
        merchantKey
      );

    if (current) {

      current.amount +=
        Number(expense.amount);

      current.transactionCount += 1;

      continue;
    }

    merchantTotals.set(
      merchantKey,
      {
        name: merchantName,
        amount:
          Number(expense.amount),
        transactionCount: 1
      }
    );
  }

  return Array
    .from(merchantTotals.entries())
    .map(([key, merchant]) => {

      const image =
        merchant.name === 'Unspecified'
          ? (
            getOtherMerchant(
              category
            )?.image ?? null
          )
: getMerchantImage(
            category,
            merchant.name
          );

      return {
        key,
        name: merchant.name,
        amount: merchant.amount,
        transactionCount:
          merchant.transactionCount,
        image
      };
    })
    .sort(
      (first, second) =>
        second.amount -
        first.amount
    );
}


function normalizeMerchantName(
  merchant: string
): string {

  return merchant
    .trim()
    .toLowerCase();
}
