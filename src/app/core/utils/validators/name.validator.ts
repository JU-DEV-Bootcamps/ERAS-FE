const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 100;
// Letters (incl. accents/ñ), numbers, spaces, and a limited set of punctuation
const NAME_PATTERN = /^[\p{L}0-9][\p{L}0-9\s.,'&()/-]*$/u;

export function validateName(rawValue: string): string | null {
  const value = rawValue ?? '';

  if (!value.trim()) {
    return 'Name cannot be empty.';
  }

  if (value !== value.trimStart()) {
    return 'Name cannot start with a space.';
  }

  if (value.trim().length < NAME_MIN_LENGTH) {
    return `Name must be at least ${NAME_MIN_LENGTH} characters long.`;
  }

  if (value.length > NAME_MAX_LENGTH) {
    return `Name cannot exceed ${NAME_MAX_LENGTH} characters.`;
  }

  if (!NAME_PATTERN.test(value)) {
    return "Only letters, numbers, spaces, and the characters . , ' & ( ) / - are allowed.";
  }

  return null;
}
