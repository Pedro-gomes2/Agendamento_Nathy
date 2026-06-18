import { IsValidFileSize } from '../../../src/common/validators';

describe('IsValidFileSize Validator', () => {
  let validator: IsValidFileSize;

  beforeEach(() => {
    validator = new IsValidFileSize();
  });

  describe('validate()', () => {
    it('should return true for empty/undefined value', () => {
      expect(validator.validate(null)).toBe(true);
      expect(validator.validate(undefined)).toBe(true);
    });

    it('should return true if value has no size property', () => {
      expect(validator.validate({})).toBe(true);
      expect(validator.validate({ name: 'file.jpg' })).toBe(true);
    });

    it('should accept files smaller than 5MB', () => {
      const file1MB = { size: 1 * 1024 * 1024 };
      const file2MB = { size: 2 * 1024 * 1024 };
      const file5MB = { size: 5 * 1024 * 1024 };

      expect(validator.validate(file1MB)).toBe(true);
      expect(validator.validate(file2MB)).toBe(true);
      expect(validator.validate(file5MB)).toBe(true);
    });

    it('should reject files larger than 5MB', () => {
      const file6MB = { size: 6 * 1024 * 1024 };
      const file10MB = { size: 10 * 1024 * 1024 };
      const file100MB = { size: 100 * 1024 * 1024 };

      expect(validator.validate(file6MB)).toBe(false);
      expect(validator.validate(file10MB)).toBe(false);
      expect(validator.validate(file100MB)).toBe(false);
    });

    it('should accept empty files', () => {
      const emptyFile = { size: 0 };
      expect(validator.validate(emptyFile)).toBe(true);
    });

    it('should handle file objects with other properties', () => {
      const fileObject = {
        name: 'document.pdf',
        size: 3 * 1024 * 1024,
        type: 'application/pdf',
        lastModified: Date.now(),
      };

      expect(validator.validate(fileObject)).toBe(true);
    });
  });

  describe('defaultMessage()', () => {
    it('should return appropriate error message', () => {
      const message = validator.defaultMessage({
        property: 'file',
      } as any);

      expect(message).toContain('size must not exceed 5MB');
      expect(message).toContain('file');
    });
  });
});
