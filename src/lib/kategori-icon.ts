import {
  Apple,
  Banana,
  Bean,
  Beef,
  Beer,
  Boxes,
  Bubbles,
  Cake,
  CakeSlice,
  Candy,
  Carrot,
  ChefHat,
  Coffee,
  Cookie,
  CookingPot,
  Croissant,
  CupSoda,
  Dessert,
  Donut,
  Drumstick,
  Egg,
  EggFried,
  Fish,
  GlassWater,
  Grape,
  Ham,
  Hamburger,
  IceCream,
  IceCreamCone,
  Leaf,
  Lollipop,
  Martini,
  Milk,
  Nut,
  Package,
  Pizza,
  Popcorn,
  Salad,
  Sandwich,
  Shrimp,
  ShoppingBag,
  Soup,
  Store,
  Utensils,
  UtensilsCrossed,
  Wheat,
  Wine,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type KategoriIconOption = {
  key: string;
  label: string;
  Icon: LucideIcon;
};

export const CATEGORY_ICON_OPTIONS: KategoriIconOption[] = [
  { key: 'Utensils', label: 'Umum', Icon: Utensils },
  { key: 'GlassWater', label: 'Minuman', Icon: GlassWater },
  { key: 'Coffee', label: 'Kopi/Teh', Icon: Coffee },
  { key: 'Cookie', label: 'Camilan', Icon: Cookie },
  { key: 'Pizza', label: 'Pizza', Icon: Pizza },
  { key: 'Hamburger', label: 'Burger', Icon: Hamburger },
  { key: 'Sandwich', label: 'Sandwich', Icon: Sandwich },
  { key: 'Carrot', label: 'Sayuran/Gorengan', Icon: Carrot },
  { key: 'Drumstick', label: 'Ayam', Icon: Drumstick },
  { key: 'Fish', label: 'Ikan/Seafood', Icon: Fish },
  { key: 'Shrimp', label: 'Udang', Icon: Shrimp },
  { key: 'Soup', label: 'Sup', Icon: Soup },
  { key: 'Wheat', label: 'Mie/Roti', Icon: Wheat },
  { key: 'Salad', label: 'Salad', Icon: Salad },
  { key: 'IceCream', label: 'Es Krim', Icon: IceCream },
  { key: 'CakeSlice', label: 'Kue/Dessert', Icon: CakeSlice },
  { key: 'Popcorn', label: 'Popcorn', Icon: Popcorn },
  { key: 'CupSoda', label: 'Soda/Jus', Icon: CupSoda },
  { key: 'Package', label: 'Paket', Icon: Package },
  { key: 'Boxes', label: 'Paket Hemat', Icon: Boxes },
  { key: 'ChefHat', label: 'Spesial', Icon: ChefHat },
];

/**
 * Ikon tambahan yang tidak ditampilkan sebagai tombol picker, tetapi tetap
 * boleh dipilih oleh saran otomatis agar hasilnya lebih dekat dengan nama
 * kategori. Preview tetap bisa merender ikon-ikon ini.
 */
const EXTRA_CATEGORY_ICONS: Record<string, LucideIcon> = {
  Milk,
  Beer,
  Wine,
  Martini,
  Cake,
  Dessert,
  Donut,
  Candy,
  Lollipop,
  Croissant,
  Beef,
  Ham,
  Egg,
  EggFried,
  Bean,
  Nut,
  CookingPot,
  UtensilsCrossed,
  Store,
  ShoppingBag,
  Apple,
  Banana,
  Grape,
  Leaf,
  IceCreamCone,
  Bubbles,
};

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  ...Object.fromEntries(CATEGORY_ICON_OPTIONS.map((option) => [option.key, option.Icon])),
  ...EXTRA_CATEGORY_ICONS,
};

const LEGACY_ICON_ALIASES: Record<string, string> = {
  FrenchFries: 'Cookie',
  Noodles: 'Wheat',
};

export function suggestKategoriIcon(nama: string): string {
  const n = nama.toLowerCase();

  if (n.includes('paket') || n.includes('bundle') || n.includes('hemat')) return 'Boxes';
  if (n.includes('es krim') || n.includes('ice cream') || n.includes('gelato') || n.includes('popsicle')) return 'IceCream';
  if (n.includes('kopi') || n.includes('coffee') || n.includes('latte') || n.includes('espresso') || n.includes('cappuccino')) return 'Coffee';
  if (n.includes('susu') || n.includes('milk')) return 'Milk';
  if (n.includes('jus') || n.includes('juice') || n.includes('smoothie')) return 'CupSoda';
  if (n.includes('soda')) return 'CupSoda';
  if (n.includes('bir') || n.includes('beer')) return 'Beer';
  if (n.includes('wine')) return 'Wine';
  if (n.includes('cocktail') || n.includes('koktail') || n.includes('mocktail')) return 'Martini';
  if (n.includes('teh') || n.includes('tea') || n.includes('minum') || n.includes('drink') || n.includes('air')) return 'GlassWater';
  if (n.includes('nasi') || n.includes('nasgor') || n.includes('rice')) return 'CookingPot';
  if (n.includes('mie') || n.includes('noodle')) return 'Wheat';
  if (n.includes('sup') || n.includes('soup') || n.includes('kuah') || n.includes('soto') || n.includes('bakso')) return 'Soup';
  if (n.includes('ayam') || n.includes('chicken')) return 'Drumstick';
  if (n.includes('sapi') || n.includes('beef') || n.includes('steak') || n.includes('daging') || n.includes('grill') || n.includes('bbq')) return 'Beef';
  if (n.includes('udang') || n.includes('shrimp') || n.includes('prawn') || n.includes('cumi')) return 'Shrimp';
  if (n.includes('ikan') || n.includes('fish') || n.includes('seafood') || n.includes('kerang') || n.includes('kepiting')) return 'Fish';
  if (n.includes('pizza')) return 'Pizza';
  if (n.includes('burger')) return 'Hamburger';
  if (n.includes('sandwich')) return 'Sandwich';
  if (n.includes('croissant')) return 'Croissant';
  if (n.includes('roti') || n.includes('bread') || n.includes('bakery')) return 'Croissant';
  if (n.includes('salad') || n.includes('lalapan')) return 'Salad';
  if (n.includes('sayur') || n.includes('vegetable')) return 'Carrot';
  if (n.includes('vegan') || n.includes('vegetarian')) return 'Leaf';
  if (n.includes('pisang') || n.includes('banana')) return 'Banana';
  if (n.includes('anggur') || n.includes('grape')) return 'Grape';
  if (n.includes('buah') || n.includes('fruit')) return 'Apple';
  if (n.includes('telur') || n.includes('egg')) return 'EggFried';
  if (/\btahu\b/.test(n) || n.includes('tempe') || n.includes('bean')) return 'Bean';
  if (n.includes('kacang') || n.includes('nut')) return 'Nut';
  if (n.includes('cokelat') || n.includes('chocolate') || n.includes('permen') || n.includes('candy')) return 'Candy';
  if (n.includes('donat') || n.includes('donut')) return 'Donut';
  if (n.includes('dessert') || n.includes('puding') || n.includes('pudding')) return 'Dessert';
  if (n.includes('kue') || n.includes('cake') || n.includes('pastry')) return 'CakeSlice';
  if (n.includes('camil') || n.includes('snack') || n.includes('goreng') || n.includes('kentang') || n.includes('fries')) return 'Cookie';
  if (n.includes('popcorn')) return 'Popcorn';
  if (n.includes('spesial') || n.includes('special') || n.includes('signature')) return 'ChefHat';
  if (n.includes('toko') || n.includes('resto') || n.includes('store')) return 'Store';
  if (n.includes('makan') || n.includes('food') || n.includes('main')) return 'Utensils';
  return 'Utensils';
}

export function getKategoriIcon(
  nama: string,
  iconKey?: string | null
): LucideIcon {
  if (iconKey) {
    const key = LEGACY_ICON_ALIASES[iconKey] ?? iconKey;
    const Icon = CATEGORY_ICON_MAP[key];
    if (Icon) return Icon;
  }
  return CATEGORY_ICON_MAP[suggestKategoriIcon(nama)] ?? Utensils;
}
