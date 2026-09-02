import {
  QuickMerchantOption
} from '../models/home.models';

export const QUICK_MERCHANTS:
Record<string, QuickMerchantOption[]> = {

FOOD_AND_DINING: [

{
key: 'MCDONALDS',
label: 'McDonald\'s',
merchant: 'McDonald\'s',
image:
'assets/icon/food/mcdonalds.png'
},

{
key: 'CHICK_FIL_A',
label: 'Chick-fil-A',
merchant: 'Chick-fil-A',
image:
'assets/icon/food/chick-fil-a.png'
},

{
key: 'CHIPOTLE',
label: 'Chipotle',
merchant: 'Chipotle',
image:
'assets/icon/food/chipotle.png'
},

{
key: 'STARBUCKS',
label: 'Starbucks',
merchant: 'Starbucks',
image:
'assets/icon/food/starbucks.png'
},

{
key: 'SUBWAY',
label: 'Subway',
merchant: 'Subway',
image:
'assets/icon/food/subway.png'
},

{
key: 'TACO_BELL',
label: 'Taco Bell',
merchant: 'Taco Bell',
image:
'assets/icon/food/taco-bell.png'
},

{
key: 'OTHER',
label: 'Other',
merchant: '',
image:
'assets/icon/food/bread.png'
}
],

GROCERIES: [

{
key: 'ALDI',
label: 'Aldi',
merchant: 'Aldi',
image:
'assets/icon/grocery/aldi.png'
},

{
key: 'COSTCO',
label: 'Costco',
merchant: 'Costco',
image:
'assets/icon/grocery/costco.png'
},

{
key: 'KROGER',
label: 'Kroger',
merchant: 'Kroger',
image:
'assets/icon/grocery/kroger.png'
},

{
key: 'SAMS_CLUB',
label: 'Sam\'s Club',
merchant: 'Sam\'s Club',
image:
'assets/icon/grocery/sams_club.png'
},

{
key: 'TARGET',
label: 'Target',
merchant: 'Target',
image:
'assets/icon/grocery/target.jpg'
},

{
key: 'WALMART',
label: 'Walmart',
merchant: 'Walmart',
image:
'assets/icon/grocery/walmart.svg'
},

{
key: 'WHOLE_FOODS',
label: 'Whole Foods',
merchant: 'Whole Foods',
image:
'assets/icon/grocery/wholefoods.png'
},

{
key: 'OTHER',
label: 'Other',
merchant: '',
image:
'assets/icon/grocery/other.webp'
}
],

CAR: [

{
key: 'SHELL',
label: 'Shell',
merchant: 'Shell',
image:
'assets/icon/fuel/shell.jpg'
},

{
key: 'BP',
label: 'BP',
merchant: 'BP',
image:
'assets/icon/fuel/bp.png'
},

{
key: 'SPEEDWAY',
label: 'Speedway',
merchant: 'Speedway',
image:
'assets/icon/fuel/speedway.webp'
},

{
key: 'EXXON',
label: 'Exxon',
merchant: 'Exxon',
image:
'assets/icon/fuel/exxon.png'
},

{
key: 'MARATHON',
label: 'Marathon',
merchant: 'Marathon',
image:
'assets/icon/fuel/marathon.jpg'
},

{
key: 'KROGER_FUEL',
label: 'Kroger Fuel',
merchant: 'Kroger Fuel',
image:
'assets/icon/fuel/kroger.png'
},

{
key: 'MEIJER',
label: 'Meijer',
merchant: 'Meijer',
image:
'assets/icon/fuel/meijer.png'
},

{
key: 'QUIKTRIP',
label: 'QuikTrip',
merchant: 'QuikTrip',
image:
'assets/icon/fuel/qt.jpg'
},

{
key: 'SHEETZ',
label: 'Sheetz',
merchant: 'Sheetz',
image:
'assets/icon/fuel/sheetz.jpg'
},

{
key: 'OTHER',
label: 'Other',
merchant: '',
image:
'assets/icon/fuel/other.jpeg'
}
]
};


export function getQuickMerchants(
  category: string
): QuickMerchantOption[] {

  return (
    QUICK_MERCHANTS[
      category
    ] ?? []
  );
}


export function getQuickMerchantByName(
  category: string,
  merchant: string
): QuickMerchantOption | null {

  const normalizedMerchant =
    normalizeMerchantName(
      merchant
    );

  if (!normalizedMerchant) {
    return null;
  }

  const merchants =
    getQuickMerchants(
      category
    );

  return (
    merchants.find(
      option =>
        option.key !== 'OTHER' &&
        normalizeMerchantName(
          option.merchant
        ) === normalizedMerchant
    ) ?? null
  );
}


export function getOtherMerchant(
  category: string
): QuickMerchantOption | null {

  const merchants =
    getQuickMerchants(
      category
    );

  return (
    merchants.find(
      option =>
        option.key === 'OTHER'
    ) ?? null
  );
}


export function getMerchantImage(
  category: string,
  merchant: string
): string | null {

  const matchedMerchant =
    getQuickMerchantByName(
      category,
      merchant
    );

  if (matchedMerchant) {
    return matchedMerchant.image;
  }

  const otherMerchant =
    getOtherMerchant(
      category
    );

  return (
    otherMerchant?.image ?? null
  );
}


function normalizeMerchantName(
  merchant: string
): string {

  return merchant
    .trim()
    .toLowerCase();
}
