export const THEME_CONFIG = {
  defaultMode: 'dark' as const,
  clarityEnhancement: true,
};

export const APP_CONFIG = {
  name: 'Walrus Form',
  description: 'Unstoppable Forms, Decentralized.',
  version: '1.0.0',
};

export const VALIDATION_RULES = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  social: /^(https?:\/\/)?(www\.)?(twitter|x|github|linkedin|facebook)\.com\/[a-zA-Z0-9_.-]+\/?$/,
};
