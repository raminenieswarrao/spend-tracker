export type PeriodMode =
'MONTH' | 'YEAR';

export interface CategoryOption {
value: string;
label: string;
icon: string;
color: string;
}

export interface CategorySummary
extends CategoryOption {

amount: number;
percentage: number;
}

export interface QuickMerchantOption {
key: string;
label: string;
merchant: string;
image: string;
}
