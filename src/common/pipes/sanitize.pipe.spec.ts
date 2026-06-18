import { SanitizePipe } from './sanitize.pipe';

describe('SanitizePipe', () => {
  let pipe: SanitizePipe;

  beforeEach(() => {
    pipe = new SanitizePipe();
  });

  describe('string sanitization', () => {
    it('should remove HTML tags from strings', () => {
      const input = '<script>alert("XSS")</script>Hello';
      const result = pipe.transform(input);
      expect(result).toBe('Hello');
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('alert');
    });

    it('should remove img tags with event handlers', () => {
      const input = '<img src="x" onerror="alert(1)">';
      const result = pipe.transform(input);
      expect(result).toBe('');
      expect(result).not.toContain('onerror');
    });

    it('should remove onclick handlers', () => {
      const input = '<div onclick="evil()">Click me</div>';
      const result = pipe.transform(input);
      expect(result).toBe('Click me');
      expect(result).not.toContain('onclick');
    });

    it('should preserve plain text without tags', () => {
      const input = 'This is plain text';
      const result = pipe.transform(input);
      expect(result).toBe('This is plain text');
    });

    it('should handle mixed content', () => {
      const input =
        'Hello <b>world</b> with <script>alert("xss")</script> injection';
      const result = pipe.transform(input);
      expect(result).toBe('Hello world with  injection');
      expect(result).not.toContain('script');
    });
  });

  describe('object sanitization', () => {
    it('should recursively sanitize object properties', () => {
      const input = {
        name: '<script>alert("xss")</script>John',
        email: 'john@example.com',
      };
      const result = pipe.transform(input);
      expect(result.name).toBe('John');
      expect(result.email).toBe('john@example.com');
    });

    it('should handle nested objects', () => {
      const input = {
        user: {
          name: '<img src=x onerror=alert(1)>',
          profile: {
            bio: '<svg onload=alert()>',
          },
        },
      };
      const result = pipe.transform(input);
      expect(result.user.name).toBe('');
      expect(result.user.profile.bio).toBe('');
    });

    it('should preserve non-string values', () => {
      const input = {
        count: 42,
        active: true,
        tags: ['tag1', 'tag2'],
      };
      const result = pipe.transform(input);
      expect(result.count).toBe(42);
      expect(result.active).toBe(true);
      expect(result.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('special values', () => {
    it('should handle null values', () => {
      const result = pipe.transform(null);
      expect(result).toBe(null);
    });

    it('should handle undefined values', () => {
      const result = pipe.transform(undefined);
      expect(result).toBeUndefined();
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01');
      const result = pipe.transform(date);
      expect(result).toEqual(date);
    });

    it('should handle numbers', () => {
      expect(pipe.transform(123)).toBe(123);
      expect(pipe.transform(3.14)).toBe(3.14);
    });

    it('should handle booleans', () => {
      expect(pipe.transform(true)).toBe(true);
      expect(pipe.transform(false)).toBe(false);
    });
  });
});
