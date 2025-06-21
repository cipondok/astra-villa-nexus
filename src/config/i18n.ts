
export const languages = {
  en: {
    name: 'English',
    flag: '🇺🇸'
  },
  id: {
    name: 'Bahasa Indonesia', 
    flag: '🇮🇩'
  }
};

export type Language = keyof typeof languages;
