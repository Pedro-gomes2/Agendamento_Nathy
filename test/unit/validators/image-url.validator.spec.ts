import { validate } from 'class-validator';
import { IsValidImageUrl } from '../../../src/common/validators';

class TestDto {
  image_url?: string;
}

describe('IsValidImageUrl Validator', () => {
  let validator: IsValidImageUrl;

  beforeEach(() => {
    validator = new IsValidImageUrl();
  });

  describe('validate()', () => {
    it('should return true for empty/undefined URL', () => {
      expect(validator.validate('')).toBe(true);
      expect(validator.validate(null as any)).toBe(true);
      expect(validator.validate(undefined as any)).toBe(true);
    });

    it('should accept valid HTTPS image URLs', () => {
      const validUrls = [
        'https://example.com/image.jpg',
        'https://example.com/path/to/image.png',
        'https://example.com/image.jpeg',
        'https://example.com/image.webp',
        'https://example.com/image.gif',
        'https://example.com/image.svg',
      ];

      validUrls.forEach((url) => {
        expect(validator.validate(url)).toBe(true);
      });
    });

    it('should accept valid HTTP image URLs', () => {
      const validUrls = [
        'http://example.com/image.jpg',
        'http://example.com/path/to/image.png',
      ];

      validUrls.forEach((url) => {
        expect(validator.validate(url)).toBe(true);
      });
    });

    it('should reject non-image file extensions', () => {
      const invalidUrls = [
        'https://example.com/document.pdf',
        'https://example.com/archive.zip',
        'https://example.com/video.mp4',
        'https://example.com/script.js',
      ];

      invalidUrls.forEach((url) => {
        expect(validator.validate(url)).toBe(false);
      });
    });

    it('should reject non-HTTP/HTTPS protocols', () => {
      const invalidUrls = [
        'ftp://example.com/image.jpg',
        'file:///path/to/image.jpg',
        'data:image/png;base64,...',
      ];

      invalidUrls.forEach((url) => {
        expect(validator.validate(url)).toBe(false);
      });
    });

    it('should reject URLs with path traversal attempts', () => {
      const invalidUrls = [
        'https://example.com/../image.jpg',
      ];

      invalidUrls.forEach((url) => {
        expect(validator.validate(url)).toBe(false);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not a url',
        'http://',
        'https://',
        'example.com/image.jpg',
      ];

      invalidUrls.forEach((url) => {
        expect(validator.validate(url)).toBe(false);
      });
    });

    it('should handle case-insensitive file extensions', () => {
      const urlsWithCapitalExt = [
        'https://example.com/image.JPG',
        'https://example.com/image.PNG',
        'https://example.com/image.JPEG',
      ];

      urlsWithCapitalExt.forEach((url) => {
        expect(validator.validate(url)).toBe(true);
      });
    });
  });

  describe('defaultMessage()', () => {
    it('should return appropriate error message', () => {
      const message = validator.defaultMessage({
        property: 'image_url',
      } as any);

      expect(message).toContain('must be a valid image URL');
      expect(message).toContain('HTTP/HTTPS');
    });
  });
});
