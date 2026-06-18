import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidImageUrl', async: false })
export class IsValidImageUrl implements ValidatorConstraintInterface {
  validate(url: string): boolean {
    if (!url) return true;

    try {
      // Check for path traversal attempts in the raw URL
      if (url.includes('..')) {
        return false;
      }

      const urlObj = new URL(url);

      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }

      const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
      const path = urlObj.pathname.toLowerCase();
      const isValidExtension = validExtensions.some((ext) =>
        path.endsWith(ext),
      );

      return isValidExtension;
    } catch {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be a valid image URL (HTTP/HTTPS with .jpg, .jpeg, .png, .webp, .gif, or .svg)`;
  }
}
