import {
  QuickMerchantOption
} from '../models/home.models';

export const QUICK_MERCHANTS:
Record<string, QuickMerchantOption[]> = {

HOUSING: [
{
key: 'RENT',
label: 'Rent',
merchant: 'Rent',
image: 'assets/icon/housing/rent.avif'
},
{
key: 'MORTGAGE',
label: 'Mortgage',
merchant: 'Mortgage',
image: 'assets/icon/housing/mortgage.webp'
},
{
key: 'PROPERTY_MANAGEMENT',
label: 'Property Management',
merchant: 'Property Management',
image: 'assets/icon/housing/property-management.webp'
},
{
key: 'MAINTENANCE',
label: 'Maintenance',
merchant: 'Maintenance',
image: 'assets/icon/housing/maintenance.webp'
},
{
key: 'PARKING',
label: 'Parking',
merchant: 'Parking',
image: 'assets/icon/housing/parking.avif'
},
{
key: 'STORAGE',
label: 'Storage',
merchant: 'Storage',
image: 'assets/icon/housing/storage.avif'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/housing/other.jpg'
}
],

GROCERIES: [
{
key: 'ALDI',
label: 'Aldi',
merchant: 'Aldi',
image: 'assets/icon/grocery/aldi.png'
},
{
key: 'COSTCO',
label: 'Costco',
merchant: 'Costco',
image: 'assets/icon/grocery/costco.png'
},
{
key: 'KROGER',
label: 'Kroger',
merchant: 'Kroger',
image: 'assets/icon/grocery/kroger.png'
},
{
key: 'SAMS_CLUB',
label: 'Sam\'s Club',
merchant: 'Sam\'s Club',
image: 'assets/icon/grocery/sams_club.png'
},
{
key: 'TARGET',
label: 'Target',
merchant: 'Target',
image: 'assets/icon/grocery/target.jpg'
},
{
key: 'WALMART',
label: 'Walmart',
merchant: 'Walmart',
image: 'assets/icon/grocery/walmart.svg'
},
{
key: 'WHOLE_FOODS',
label: 'Whole Foods',
merchant: 'Whole Foods',
image: 'assets/icon/grocery/wholefoods.png'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/grocery/other.webp'
}
],

FOOD_AND_DINING: [
{
key: 'MCDONALDS',
label: 'McDonald\'s',
merchant: 'McDonald\'s',
image: 'assets/icon/food/mcdonalds.png'
},
{
key: 'CHICK_FIL_A',
label: 'Chick-fil-A',
merchant: 'Chick-fil-A',
image: 'assets/icon/food/chick-fil-a.png'
},
{
key: 'CHIPOTLE',
label: 'Chipotle',
merchant: 'Chipotle',
image: 'assets/icon/food/chipotle.png'
},
{
key: 'STARBUCKS',
label: 'Starbucks',
merchant: 'Starbucks',
image: 'assets/icon/food/starbucks.png'
},
{
key: 'SUBWAY',
label: 'Subway',
merchant: 'Subway',
image: 'assets/icon/food/subway.png'
},
{
key: 'TACO_BELL',
label: 'Taco Bell',
merchant: 'Taco Bell',
image: 'assets/icon/food/taco-bell.png'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/food/bread.png'
}
],

TRANSPORTATION: [
{
key: 'UBER',
label: 'Uber',
merchant: 'Uber',
image: 'assets/icon/transportation/uber.webp'
},
{
key: 'LYFT',
label: 'Lyft',
merchant: 'Lyft',
image: 'assets/icon/transportation/lyft.svg'
},
{
key: 'METRO',
label: 'Metro',
merchant: 'Metro',
image: 'assets/icon/transportation/metro.svg'
},
{
key: 'AMTRAK',
label: 'Amtrak',
merchant: 'Amtrak',
image: 'assets/icon/transportation/amtrak.webp'
},
{
key: 'GREYHOUND',
label: 'Greyhound',
merchant: 'Greyhound',
image: 'assets/icon/transportation/greyhound.svg'
},
{
key: 'TURO',
label: 'Turo',
merchant: 'Turo',
image: 'assets/icon/transportation/turo.webp'
},
{
key: 'ENTERPRISE',
label: 'Enterprise',
merchant: 'Enterprise',
image: 'assets/icon/transportation/enterprise.png'
},
{
key: 'HERTZ',
label: 'Hertz',
merchant: 'Hertz',
image: 'assets/icon/transportation/hertz.png'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/transportation/other.jpg'
}
],

CAR: [
{
key: 'SHELL',
label: 'Shell',
merchant: 'Shell',
image: 'assets/icon/car/shell.jpg'
},
{
key: 'BP',
label: 'BP',
merchant: 'BP',
image: 'assets/icon/car/bp.png'
},
{
key: 'SPEEDWAY',
label: 'Speedway',
merchant: 'Speedway',
image: 'assets/icon/car/speedway.webp'
},
{
key: 'EXXON',
label: 'Exxon',
merchant: 'Exxon',
image: 'assets/icon/car/exxon.png'
},
{
key: 'MARATHON',
label: 'Marathon',
merchant: 'Marathon',
image: 'assets/icon/car/marathon.jpg'
},
{
key: 'KROGER_FUEL',
label: 'Kroger Fuel',
merchant: 'Kroger Fuel',
image: 'assets/icon/car/kroger.png'
},
{
key: 'MEIJER',
label: 'Meijer',
merchant: 'Meijer',
image: 'assets/icon/car/meijer.png'
},
{
key: 'QUIKTRIP',
label: 'QuikTrip',
merchant: 'QuikTrip',
image: 'assets/icon/car/qt.jpg'
},
{
key: 'SHEETZ',
label: 'Sheetz',
merchant: 'Sheetz',
image: 'assets/icon/car/sheetz.jpg'
},
{
key: 'CAR_MAINTENANCE',
label: 'Car Maintenance',
merchant: 'Car Maintenance',
image: 'assets/icon/car/car-maintenance.png'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/car/other.jpeg'
}
],

UTILITIES: [
{
key: 'DUKE_ENERGY',
label: 'Duke Energy',
merchant: 'Duke Energy',
image: 'assets/icon/utilities/duke-energy.svg'
},
{
key: 'ALTAFIBER',
label: 'altafiber',
merchant: 'altafiber',
image: 'assets/icon/utilities/altafiber.png'
},
{
key: 'SPECTRUM',
label: 'Spectrum',
merchant: 'Spectrum',
image: 'assets/icon/utilities/spectrum.avif'
},
{
key: 'ATT',
label: 'AT&T',
merchant: 'AT&T',
image: 'assets/icon/utilities/att.png'
},
{
key: 'VERIZON',
label: 'Verizon',
merchant: 'Verizon',
image: 'assets/icon/utilities/verizon.webp'
},
{
key: 'TMOBILE',
label: 'T-Mobile',
merchant: 'T-Mobile',
image: 'assets/icon/utilities/tmobile.webp'
},
{
key: 'MINT_MOBILE',
label: 'Mint Mobile',
merchant: 'Mint Mobile',
image: 'assets/icon/utilities/mint.webp'
},
{
key: 'GASLIGHT_UTILITIES',
label: 'Gaslight Utilities',
merchant: 'Gaslight Utilities',
image: 'assets/icon/utilities/gaslight-utilities.png'
},
{
key: 'WIFI',
label: 'Wi-Fi / Internet',
merchant: 'Wi-Fi / Internet',
image: 'assets/icon/utilities/wifi.webp'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/utilities/other.jpg'
}
],

SHOPPING: [
{
key: 'AMAZON',
label: 'Amazon',
merchant: 'Amazon',
image: 'assets/icon/shopping/amazon.png'
},
{
key: 'WALMART',
label: 'Walmart',
merchant: 'Walmart',
image: 'assets/icon/shopping/walmart.png'
},
{
key: 'TARGET',
label: 'Target',
merchant: 'Target',
image: 'assets/icon/shopping/target.jpg'
},
{
key: 'BEST_BUY',
label: 'Best Buy',
merchant: 'Best Buy',
image: 'assets/icon/shopping/best-buy.png'
},
{
key: 'MACYS',
label: 'Macy\'s',
merchant: 'Macy\'s',
image: 'assets/icon/shopping/macys.png'
},
{
key: 'NIKE',
label: 'Nike',
merchant: 'Nike',
image: 'assets/icon/shopping/nike.webp'
},
{
key: 'ADIDAS',
label: 'Adidas',
merchant: 'Adidas',
image: 'assets/icon/shopping/adidas.webp'
},
{
key: 'TEMU',
label: 'Temu',
merchant: 'Temu',
image: 'assets/icon/shopping/temu.png'
},
{
key: 'SHEIN',
label: 'Shein',
merchant: 'Shein',
image: 'assets/icon/shopping/shein.webp'
},
{
key: 'EBAY',
label: 'eBay',
merchant: 'eBay',
image: 'assets/icon/shopping/ebay.svg'
},
{
key: 'ETSY',
label: 'Etsy',
merchant: 'Etsy',
image: 'assets/icon/shopping/etsy.webp'
},
{
key: 'BURLINGTON',
label: 'Burlington',
merchant: 'Burlington',
image: 'assets/icon/shopping/burlington.png'
},
{
key: 'ROSS',
label: 'Ross',
merchant: 'Ross',
image: 'assets/icon/shopping/ross.png'
},
{
key: 'TJ_MAXX',
label: 'TJ Maxx',
merchant: 'TJ Maxx',
image: 'assets/icon/shopping/tjmax.jpg'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/shopping/other.jpg'
}
],

HEALTH: [
{
key: 'CVS',
label: 'CVS',
merchant: 'CVS',
image: 'assets/icon/health/cvs.svg'
},
{
key: 'WALGREENS',
label: 'Walgreens',
merchant: 'Walgreens',
image: 'assets/icon/health/walgreens.png'
},
{
key: 'KROGER_PHARMACY',
label: 'Kroger Pharmacy',
merchant: 'Kroger Pharmacy',
image: 'assets/icon/health/kroger-pharmacy.jpeg'
},
{
key: 'WALMART_PHARMACY',
label: 'Walmart Pharmacy',
merchant: 'Walmart Pharmacy',
image: 'assets/icon/health/walmart-pharmacy.jpeg'
},
{
key: 'GOODRX',
label: 'GoodRx',
merchant: 'GoodRx',
image: 'assets/icon/health/goodrx.png'
},
{
key: 'QUEST_DIAGNOSTICS',
label: 'Quest Diagnostics',
merchant: 'Quest Diagnostics',
image: 'assets/icon/health/quest.jpeg'
},
{
key: 'LABCORP',
label: 'Labcorp',
merchant: 'Labcorp',
image: 'assets/icon/health/labcorp.avif'
},
{
key: 'URGENT_CARE',
label: 'Urgent Care',
merchant: 'Urgent Care',
image: 'assets/icon/health/urgent-care.png'
},
{
key: 'HOSPITAL',
label: 'Hospital',
merchant: 'Hospital',
image: 'assets/icon/health/hospital.webp'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/health/other.jpg'
}
],

SUBSCRIPTIONS: [
{
key: 'NETFLIX',
label: 'Netflix',
merchant: 'Netflix',
image: 'assets/icon/subscription/netflix.webp'
},
{
key: 'SPOTIFY',
label: 'Spotify',
merchant: 'Spotify',
image: 'assets/icon/subscription/spotify.jpg'
},
{
key: 'YOUTUBE_PREMIUM',
label: 'YouTube Premium',
merchant: 'YouTube Premium',
image: 'assets/icon/subscription/youtube-premium.webp'
},
{
key: 'AMAZON_PRIME',
label: 'Amazon Prime',
merchant: 'Amazon Prime',
image: 'assets/icon/subscription/amazon-prime.jpeg'
},
{
key: 'CHATGPT',
label: 'ChatGPT',
merchant: 'ChatGPT',
image: 'assets/icon/subscription/chatgpt.webp'
},
{
key: 'CLAUDE',
label: 'Claude',
merchant: 'Claude',
image: 'assets/icon/subscription/claude.webp'
},
{
key: 'APPLE_MUSIC',
label: 'Apple Music',
merchant: 'Apple Music',
image: 'assets/icon/subscription/apple-music.webp'
},
{
key: 'JIOSAAVN',
label: 'JioSaavn',
merchant: 'JioSaavn',
image: 'assets/icon/subscription/jiosaavn.webp'
},
{
key: 'ICLOUD',
label: 'iCloud+',
merchant: 'iCloud+',
image: 'assets/icon/subscription/icloud.png'
},
{
key: 'GOOGLE_ONE',
label: 'Google One',
merchant: 'Google One',
image: 'assets/icon/subscription/google-one.jpg'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/subscription/other.webp'
}
],

ENTERTAINMENT: [
{
key: 'AMC',
label: 'AMC',
merchant: 'AMC',
image: 'assets/icon/entertainment/amc.png'
},
{
key: 'CINEMARK',
label: 'Cinemark',
merchant: 'Cinemark',
image: 'assets/icon/entertainment/cinemark.png'
},
{
key: 'REGAL',
label: 'Regal',
merchant: 'Regal',
image: 'assets/icon/entertainment/regal.png'
},
{
key: 'KINGS_ISLAND',
label: 'Kings Island',
merchant: 'Kings Island',
image: 'assets/icon/entertainment/kingsisland.gif'
},
{
key: 'MAIN_EVENT',
label: 'Main Event',
merchant: 'Main Event',
image: 'assets/icon/entertainment/main_event.jpeg'
},
{
key: 'TOPGOLF',
label: 'Topgolf',
merchant: 'Topgolf',
image: 'assets/icon/entertainment/topgolf.png'
},
{
key: 'PLAYSTATION',
label: 'PlayStation',
merchant: 'PlayStation',
image: 'assets/icon/entertainment/playstation.jpg'
},
{
key: 'XBOX',
label: 'Xbox',
merchant: 'Xbox',
image: 'assets/icon/entertainment/xbox.jpg'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/entertainment/other.png'
}
],

TRAVEL: [
{
key: 'AMERICAN_AIRLINES',
label: 'American Airlines',
merchant: 'American Airlines',
image: 'assets/icon/travel/american-airlines.jpg'
},
{
key: 'DELTA',
label: 'Delta',
merchant: 'Delta',
image: 'assets/icon/travel/delta.png'
},
{
key: 'UNITED',
label: 'United',
merchant: 'United',
image: 'assets/icon/travel/united.svg'
},
{
key: 'SOUTHWEST',
label: 'Southwest',
merchant: 'Southwest',
image: 'assets/icon/travel/southwest.jpg'
},
{
key: 'FRONTIER',
label: 'Frontier',
merchant: 'Frontier',
image: 'assets/icon/travel/frontier.png'
},
{
key: 'EMIRATES',
label: 'Emirates',
merchant: 'Emirates',
image: 'assets/icon/travel/emirates.webp'
},
{
key: 'AIRBNB',
label: 'Airbnb',
merchant: 'Airbnb',
image: 'assets/icon/travel/airbnb.webp'
},
{
key: 'EXPEDIA',
label: 'Expedia',
merchant: 'Expedia',
image: 'assets/icon/travel/expedia.webp'
},
{
key: 'HILTON',
label: 'Hilton',
merchant: 'Hilton',
image: 'assets/icon/travel/hilton.png'
},
{
key: 'MARRIOTT',
label: 'Marriott',
merchant: 'Marriott',
image: 'assets/icon/travel/marriott.webp'
},
{
key: 'WYNDHAM',
label: 'Wyndham',
merchant: 'Wyndham',
image: 'assets/icon/travel/wyndham.jpg'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/travel/other.avif'
}
],

EDUCATION: [
{
key: 'TUITION',
label: 'Tuition',
merchant: 'Tuition',
image: 'assets/icon/education/tuition.jpg'
},
{
key: 'BOOKS',
label: 'Books',
merchant: 'Books',
image: 'assets/icon/education/books.avif'
},
{
key: 'ONLINE_COURSE',
label: 'Online Course',
merchant: 'Online Course',
image: 'assets/icon/education/online-course.png'
},
{
key: 'CERTIFICATION',
label: 'Certification',
merchant: 'Certification',
image: 'assets/icon/education/certification.png'
},
{
key: 'EXAM_FEES',
label: 'Exam Fees',
merchant: 'Exam Fees',
image: 'assets/icon/education/exam-fees.jpg'
},
{
key: 'SCHOOL_SUPPLIES',
label: 'School Supplies',
merchant: 'School Supplies',
image: 'assets/icon/education/school-supplies.jpg'
},
{
key: 'TRAINING',
label: 'Training',
merchant: 'Training',
image: 'assets/icon/education/training.jpg'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/education/other.avif'
}
],

PERSONAL_CARE: [
{
key: 'HAIRCUT',
label: 'Haircut / Barber',
merchant: 'Haircut / Barber',
image: 'assets/icon/personal-care/haircut.jpg'
},
{
key: 'MASSAGE_SPA',
label: 'Massage / Spa',
merchant: 'Massage / Spa',
image: 'assets/icon/personal-care/massage-spa.jpg'
},
{
key: 'SKINCARE_BEAUTY',
label: 'Skincare / Beauty',
merchant: 'Skincare / Beauty',
image: 'assets/icon/personal-care/skincare-beauty.webp'
},
{
key: 'NAILS',
label: 'Nails',
merchant: 'Nails',
image: 'assets/icon/personal-care/nails.avif'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/personal-care/other.webp'
}
],

INSURANCE: [
{
key: 'AUTO_INSURANCE',
label: 'Auto Insurance',
merchant: 'Auto Insurance',
image: 'assets/icon/insurance/auto-insurance.jpg'
},
{
key: 'HEALTH_INSURANCE',
label: 'Health Insurance',
merchant: 'Health Insurance',
image: 'assets/icon/insurance/health-insurance.jpg'
},
{
key: 'RENTERS_INSURANCE',
label: 'Renters Insurance',
merchant: 'Renters Insurance',
image: 'assets/icon/insurance/renters-insurance.jpg'
},
{
key: 'HOME_INSURANCE',
label: 'Home Insurance',
merchant: 'Home Insurance',
image: 'assets/icon/insurance/home-insurance.jpg'
},
{
key: 'LIFE_INSURANCE',
label: 'Life Insurance',
merchant: 'Life Insurance',
image: 'assets/icon/insurance/life-insurance.avif'
},
{
key: 'TRAVEL_INSURANCE',
label: 'Travel Insurance',
merchant: 'Travel Insurance',
image: 'assets/icon/insurance/travel-insurance.png'
},
{
key: 'PET_INSURANCE',
label: 'Pet Insurance',
merchant: 'Pet Insurance',
image: 'assets/icon/insurance/pet-insurance.png'
},
{
key: 'OTHER',
label: 'Other',
merchant: '',
image: 'assets/icon/insurance/other.avif'
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
