# JWT Authentication Debug Guide

## Problem Fixed: JWT returning 401 with valid tokens

### Root Cause
The `dotenv.config()` was being called AFTER module imports in `src/main.ts`. This meant:
1. When `import { AppModule }` was executed, all modules were initialized
2. `AuthModule` tried to read `process.env.JWT_SECRET` (still undefined!)
3. It fell back to hardcoded `'your_secret_key'`
4. Later, `dotenv.config()` loaded the real secret, but too late
5. JwtModule was already initialized with the wrong secret

**Result**: Tokens were signed with the real secret but verified with the fallback secret → 401 error

### Solution
Move `dotenv.config()` to the very top of `src/main.ts`, BEFORE any other imports:

```typescript
// Load environment variables FIRST, before any other imports
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
// ... rest of imports
```

## How to Debug JWT Issues

### 1. Check if JWT_SECRET is loaded correctly
```bash
# In jwt.strategy.ts or auth.module.ts, add a log:
console.log('JWT_SECRET:', process.env.JWT_SECRET?.substring(0, 20) + '...');
```

### 2. Verify Token is in Request
```bash
curl http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

If you get 401, the token wasn't extracted. Check:
- Header is `Authorization: Bearer <token>` (exact format)
- No extra spaces or different format

### 3. Test Protected Routes
```bash
# Get a token first
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@salao.com","password":"admin123456"}' \
  | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

# Test with valid token
curl http://localhost:3001/auth/profile \
  -H "Authorization: Bearer $TOKEN"

# Test without token (should fail)
curl http://localhost:3001/auth/profile
```

### 4. Check JWT Strategy Logs
When debugging, add temporary logs to `src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
async validate(payload: any): Promise<User> {
  console.log('🔐 Validating JWT payload:', payload);
  
  const user = await this.usersRepository.findOne({
    where: { id: payload.sub },
  });
  
  console.log('🔐 User found:', user ? 'YES' : 'NO');
  
  if (!user) {
    throw new UnauthorizedException('User not found');
  }
  
  return user;
}
```

### 5. Common Issues and Solutions

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check JWT_SECRET is loaded early (before imports) |
| "User not found" | Verify user exists in database with correct ID |
| Token format invalid | Ensure header is exactly `Authorization: Bearer <token>` |
| Role insufficient | Check RolesGuard has correct role for endpoint |
| Token expired | Check JWT_EXPIRATION in .env, regenerate token if needed |

## Files Involved

- `src/main.ts` - Entry point, loads dotenv first
- `src/modules/auth/auth.module.ts` - Configures JwtModule
- `src/modules/auth/strategies/jwt.strategy.ts` - JWT validation logic
- `src/common/guards/jwt-auth.guard.ts` - Protects routes
- `src/common/guards/roles.guard.ts` - Checks user roles
- `.env` - Contains JWT_SECRET and JWT_EXPIRATION

## Testing Checklist

- [ ] dotenv.config() is at top of src/main.ts before all imports
- [ ] process.env.JWT_SECRET matches the value in .env
- [ ] User exists in database with matching ID
- [ ] Protected route has @UseGuards(JwtAuthGuard)
- [ ] Bearer token is sent in Authorization header
- [ ] Token is not expired (check JWT_EXPIRATION)
