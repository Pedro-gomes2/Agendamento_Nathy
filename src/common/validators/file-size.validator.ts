import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidFileSize', async: false })
export class IsValidFileSize implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    if (!value) return true;

    if (value.size) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      return value.size <= maxSize;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} size must not exceed 5MB`;
  }
}
