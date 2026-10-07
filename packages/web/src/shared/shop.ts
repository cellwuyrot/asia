import { z } from "zod";
export const sectionSchema = z.enum(["bundles", "china", "korea", "japan"]);
export type SectionId = z.infer<typeof sectionSchema>;
export const productSchema = z.object({
  id: z
    .string()
    .regex(/^[A-Za-z0-9_-]+$/)
    .max(50),
  name: z.string().min(1).max(200),
  section: sectionSchema,
  country: z.string().max(60).default(""),
  category: z.string().max(100).default(""),
  brand: z.string().max(120).default(""),
  sub: z.string().max(1500).default(""),
  description: z.string().max(6000).default(""),
  weight: z.string().max(100).default(""),
  price: z.number().nonnegative().max(1000000),
  oldPrice: z.number().nonnegative().max(1000000).nullable().default(null),
  spice: z.number().int().min(0).max(5).default(0),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  badge: z.string().max(60).default(""),
  image: z.string().max(3000000).default(""),
  contents: z
    .array(z.object({ productId: z.string().max(50), qty: z.number().int().min(1).max(100) }))
    .max(100)
    .default([]),
  people: z.string().max(50).default(""),
  extras: z.string().max(1500).default(""),
  season: z.string().max(100).default(""),
  cost: z.number().nonnegative().max(1000000).default(0),
  priority: z.string().max(5).default(""),
  demand: z.number().min(0).max(5).default(0),
  sort: z.number().int().default(0),
});
export type Product = z.infer<typeof productSchema>;
export const settingsSchema = z.object({
  name: z.string().min(1).max(80),
  tagline: z.string().max(150),
  heroTitle: z.string().max(250),
  heroText: z.string().max(1500),
  company: z.string().max(200),
  inn: z.string().refine((s) => !s || /^\d{10}(\d{2})?$/.test(s), "ИНН: 10 или 12 цифр"),
  ogrn: z.string().refine((s) => !s || /^\d{13}(\d{2})?$/.test(s), "ОГРН: 13 или 15 цифр"),
  phone: z.string().max(60),
  email: z
    .string()
    .refine((s) => !s || z.string().email().safeParse(s).success, "Некорректный email"),
  address: z.string().max(500),
  hours: z.string().max(150),
  telegram: z.string().max(300),
  vk: z.string().max(300),
  avito: z.string().max(300),
  freeShipping: z.number().min(0).max(1000000),
  deliveryFee: z.number().min(0).max(100000),
  delivery: z.string().max(30000),
  payment: z.string().max(30000),
  privacy: z.string().max(30000),
  offer: z.string().max(30000),
  returns: z.string().max(30000),
  about: z.string().max(10000),
});
export type Settings = z.infer<typeof settingsSchema>;
export const initialSettings: Settings = {
  name: "ASIA BASA",
  tagline: "Азия ближе, чем кажется",
  heroTitle: "Три страны.\nТысяча вкусов.\nВаша Азия.",
  heroText:
    "Откройте домашнюю коллекцию вкусов Китая, Японии и Южной Кореи. От тихой чайной церемонии до ужина, который хочется разделить.",
  company: "",
  inn: "",
  ogrn: "",
  phone: "",
  email: "",
  address: "",
  hours: "",
  telegram: "",
  vk: "",
  avito: "",
  freeShipping: 3000,
  deliveryFee: 290,
  about:
    "ASIA BASA — коллекция азиатских продуктов и тематических наборов для подарка, дегустации и домашней кухни.",
  delivery:
    "Информация о доставке готовится. Уточните регионы, сроки, стоимость и условия перевозки у продавца перед оформлением заказа.",
  payment: "Информация о способах оплаты готовится. Онлайн-оплата пока не подключена.",
  privacy:
    "Политика конфиденциальности пока не опубликована. Продавцу необходимо заполнить сведения об операторе, целях и основаниях обработки, сроках хранения и порядке реализации прав субъекта персональных данных до запуска приёма заказов.",
  offer:
    "Публичная оферта пока не опубликована. Укажите реквизиты продавца, условия продажи, оплаты и доставки перед запуском магазина.",
  returns:
    "Условия возврата готовятся. Заполните порядок обращений, контакты продавца и применимые правила возврата продуктов питания.",
};
export const SECTIONS: Record<
  SectionId,
  {
    title: string;
    label: string;
    accent: string;
    secondary: string;
    bg: string;
    glyph: string;
    desc: string;
  }
> = {
  bundles: {
    title: "Искусство дарить",
    label: "CURATED BOXES",
    accent: "#A4884A",
    secondary: "#462544",
    bg: "#F7F4EE",
    glyph: "箱",
    desc: "Маленькое путешествие в красивой коробке. Для себя, для близких, для нового вкуса.",
  },
  china: {
    title: "Китай",
    label: "CHINA · IMPERIAL COLLECTION",
    accent: "#9C302D",
    secondary: "#B79A54",
    bg: "#F8F3EA",
    glyph: "中",
    desc: "Императорская роскошь: благородные чаи, сычуаньские специи и вкус уличных рынков.",
  },
  japan: {
    title: "Япония",
    label: "JAPAN · QUIET LUXURY",
    accent: "#1A1A1D",
    secondary: "#645078",
    bg: "#F3F3F4",
    glyph: "日",
    desc: "Элегантный минимализм. Чистые вкусы, культовые сладости и ритуалы повседневности.",
  },
  korea: {
    title: "Южная Корея",
    label: "KOREA · NATURAL HARMONY",
    accent: "#263E5C",
    secondary: "#89A795",
    bg: "#F3F6F2",
    glyph: "韓",
    desc: "Природная гармония. Селадон, шёлк и индиго — от королевской кухни до современных традиций.",
  },
};
export const rub = (n: number) => `${n.toLocaleString("ru-RU")} ₽`;
