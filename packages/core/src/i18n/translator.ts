export interface Translator {
  format(message: string, values?: Record<string, unknown>, locale?: string): string;
}
