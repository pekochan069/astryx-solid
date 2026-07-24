export type Locale = string;

export interface MessageEntry {
  defaultMessage: string;
  description?: string;
}

export type Catalog = Record<string, MessageEntry>;
export type MessagesByLocale = Record<Locale, Catalog>;
export type Overrides = Partial<Record<Locale, Record<string, string>>>;
