import { ValidationOptions, buildMessage, ValidateBy } from 'class-validator';

export const STARTS_WITH = 'startsWith';

/**
 * Checks if the string starts with the seed.
 * If given value is not a string, then it returns false.
 */
export function startsWith(value: unknown, seed: string): boolean {
  return typeof value === 'string' && value.startsWith(seed);
}

/**
 * Checks if the string starts with the seed.
 * If given value is not a string, then it returns false.
 */
export function StartsWith(
  seed: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: STARTS_WITH,
      constraints: [seed],
      validator: {
        validate: (value, args): boolean =>
          startsWith(value, args.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property must start with $constraint1',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
