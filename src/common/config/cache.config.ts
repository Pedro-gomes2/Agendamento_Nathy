import { CacheModuleOptions } from '@nestjs/cache-manager';

export const cacheConfig: CacheModuleOptions = {
  isGlobal: true,
  ttl: 5 * 60 * 1000, // 5 minutes default
  max: 100, // Maximum cache entries
};
