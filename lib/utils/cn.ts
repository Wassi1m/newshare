// Utilitaire pour fusionner les classes CSS
type ClassValue = string | undefined | null | false | Record<string, boolean>;

export function cn(...inputs: ClassValue[]): string {
  return inputs
    .map((input) => {
      if (!input) return '';
      if (typeof input === 'string') return input;
      if (typeof input === 'object') {
        return Object.entries(input)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .filter(Boolean)
    .join(' ')
    .trim();
}

