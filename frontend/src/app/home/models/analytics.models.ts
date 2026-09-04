export interface MerchantSpendSummary {

  key: string;

name: string;

amount: number;

transactionCount: number;

image: string | null;
}


export interface DonutSlice {

value: string;

label: string;

color: string;

amount: number;

percentage: number;

dashArray: string;

dashOffset: number;

sliceLength: number;

sliceGap: number;

animationDelayMs: number;
}
