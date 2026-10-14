import type { SectionId } from "./shop";
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
