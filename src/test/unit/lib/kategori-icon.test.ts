import { describe, it, expect } from 'vitest'
import {
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_OPTIONS,
  getKategoriIcon,
  suggestKategoriIcon,
} from '@/lib/kategori-icon'

describe('kategori icon', () => {
  it('setiap opsi picker punya key unik dan masuk ke map', () => {
    const keys = CATEGORY_ICON_OPTIONS.map((o) => o.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const key of keys) expect(CATEGORY_ICON_MAP[key]).toBeDefined()
  })

  it('menyarankan ikon berdasarkan kata kunci', () => {
    expect(suggestKategoriIcon('Paket Hemat Berdua')).toBe('Boxes')
    expect(suggestKategoriIcon('Es Krim Cokelat')).toBe('IceCream')
    expect(suggestKategoriIcon('Kopi Susu')).toBe('Coffee')
    expect(suggestKategoriIcon('Jus Mangga')).toBe('CupSoda')
    expect(suggestKategoriIcon('Nasi Goreng')).toBe('CookingPot')
    expect(suggestKategoriIcon('Ayam Bakar')).toBe('Drumstick')
    expect(suggestKategoriIcon('Ikan Salmon')).toBe('Fish')
    expect(suggestKategoriIcon('Daging Bakar')).toBe('Beef')
    expect(suggestKategoriIcon('Sup Ayam')).toBe('Soup')
    expect(suggestKategoriIcon('Pizza')).toBe('Pizza')
    expect(suggestKategoriIcon('Burger')).toBe('Hamburger')
    expect(suggestKategoriIcon('Roti Bakar')).toBe('Croissant')
    expect(suggestKategoriIcon('Salad Buah')).toBe('Salad')
    expect(suggestKategoriIcon('Sayur Asem')).toBe('Carrot')
    expect(suggestKategoriIcon('Pisang Goreng')).toBe('Banana')
    expect(suggestKategoriIcon('Telur Dadar')).toBe('EggFried')
    expect(suggestKategoriIcon('Tahu Tempe')).toBe('Bean')
    expect(suggestKategoriIcon('Cokelat Panas')).toBe('Candy')
    expect(suggestKategoriIcon('Donat Gula')).toBe('Donut')
    expect(suggestKategoriIcon('Puding')).toBe('Dessert')
    expect(suggestKategoriIcon('Kue Ulang Tahun')).toBe('CakeSlice')
    expect(suggestKategoriIcon('Kentang Goreng')).toBe('Cookie')
    expect(suggestKategoriIcon('Popcorn')).toBe('Popcorn')
    expect(suggestKategoriIcon('Menu Spesial')).toBe('ChefHat')
    expect(suggestKategoriIcon('Toko Oleh-oleh')).toBe('Store')
    expect(suggestKategoriIcon('Makanan Berat')).toBe('Utensils')
  })

  it('memakai ikon eksplisit dan alias legacy', () => {
    expect(getKategoriIcon('Kopi', 'Pizza')).toBe(CATEGORY_ICON_MAP.Pizza)
    expect(getKategoriIcon('Apa saja', 'FrenchFries')).toBe(CATEGORY_ICON_MAP.Cookie)
    expect(getKategoriIcon('Apa saja', 'Noodles')).toBe(CATEGORY_ICON_MAP.Wheat)
  })

  it('jatuh ke saran nama saat iconKey tidak dikenal', () => {
    expect(getKategoriIcon('Kopi', 'TidakAda')).toBe(CATEGORY_ICON_MAP.Coffee)
    expect(getKategoriIcon('Kopi', null)).toBe(CATEGORY_ICON_MAP.Coffee)
    expect(getKategoriIcon('Kopi', '')).toBe(CATEGORY_ICON_MAP.Coffee)
  })

  it('mengembalikan ikon umum untuk nama tak dikenal', () => {
    expect(getKategoriIcon('zzz')).toBe(CATEGORY_ICON_MAP.Utensils)
  })
})
