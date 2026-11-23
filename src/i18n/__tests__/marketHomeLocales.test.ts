import { describe, expect, it } from "vitest";
import id from "../locales/id";
import en from "../locales/en";
import zh from "../locales/zh";
import ja from "../locales/ja";
import ko from "../locales/ko";
import ru from "../locales/ru";

const flatKeys = (obj: Record<string, unknown>, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? flatKeys(v as Record<string, unknown>, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

const locales = { id, en, zh, ja, ko, ru } as Record<string, any>;
const english = locales.en;
const reference = flatKeys(english.marketHome as Record<string, unknown>).sort();

describe("homepage translations", () => {
  it.each(Object.keys(locales))("%s has every homepage text the English version has", (lang) => {
    expect(locales[lang].marketHome, `${lang} is missing homepage texts`).toBeDefined();
    expect(flatKeys(locales[lang].marketHome).sort()).toEqual(reference);
  });

  it("non-English languages show their own homepage headline", () => {
    for (const lang of ["id", "zh", "ja", "ko", "ru"]) {
      expect(locales[lang].marketHome.hero.title).not.toBe(english.marketHome.hero.title);
    }
  });
});

describe("phone bottom bar labels", () => {
  it("uses Indonesian labels in Bahasa Indonesia", () => {
    expect((id as any).marketHome.bottomNav).toMatchObject({
      home: "Beranda", ecosystem: "Ekosistem", aiCenter: "Pusat AI", investment: "Investasi", account: "Akun",
    });
  });

  it("keeps English labels in English", () => {
    expect(english.marketHome.bottomNav).toMatchObject({
      home: "Home", ecosystem: "Ecosystem", aiCenter: "AI Center", investment: "Investment", account: "Account",
    });
  });
});
