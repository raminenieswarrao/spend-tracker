export interface MonthOption {
  value: number;
label: string;
}

export const MONTHLY_BUDGET = 2500;

export const MONTHS: MonthOption[] = [
{ value: 1, label: 'January' },
{ value: 2, label: 'February' },
{ value: 3, label: 'March' },
{ value: 4, label: 'April' },
{ value: 5, label: 'May' },
{ value: 6, label: 'June' },
{ value: 7, label: 'July' },
{ value: 8, label: 'August' },
{ value: 9, label: 'September' },
{ value: 10, label: 'October' },
{ value: 11, label: 'November' },
{ value: 12, label: 'December' }
];

export const PAYMENT_METHODS = [
'Credit Card',
'Debit Card',
'Cash',
'Apple Pay',
'Bank Transfer',
'Other'
];

export function buildYearOptions(
  referenceYear = new Date().getFullYear()
): number[] {

  return Array.from(
    { length: 7 },
    (_, index) =>
      referenceYear - 5 + index
  );
}
