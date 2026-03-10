declare module 'leo-profanity' {
  export function loadDictionary(lang: string): void;
  export function add(words: string[]): void;
  export function clean(text: string): string;
  export function check(text: string): boolean;
  export function list(): string[];
  export function clearList(): void;
}
