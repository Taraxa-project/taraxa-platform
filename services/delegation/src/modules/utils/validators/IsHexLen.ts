import { ValidationOptions, buildMessage, ValidateBy } from 'class-validator';

export const IS_HEX_LEN = 'isHexLen';

/**
 * Checks if the string has specific length without the 0x prefix.
 * If given value is not a string, then it returns false.
 */
export function isHexLen(value: unknown, len: number): boolean {
  if (typeof value !== 'string') {
    return false;
  }
  let v = value;
  if (v.startsWith('0x')) {
    v = v.slice(2);
  }
  return v.length === len;
}

/**
 * Checks if the string has specific length without the 0x prefix.
 * If given value is not a string, then it returns false.
 */
export function IsHexLen(
  length: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_HEX_LEN,
      constraints: [length],
      validator: {
        validate: (value, args): boolean =>
          isHexLen(value, args.constraints[0]),
        defaultMessage: buildMessage(
          (eachPrefix) =>
            eachPrefix +
            '$property must have $constraint1 characters without the 0x prefix',
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
