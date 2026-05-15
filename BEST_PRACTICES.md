# Best Practices & Architecture Guide

## 🏗️ Modular Architecture

### Folder Structure Explanation

```
src/
├── auth/                           # Authentication module
│   ├── dto/                       # Data Transfer Objects
│   │   ├── register.dto.ts       # Request validation
│   │   ├── login.dto.ts
│   │   └── index.ts
│   ├── strategies/                # Passport strategies
│   │   ├── jwt.strategy.ts       # JWT validation logic
│   │   └── index.ts
│   ├── guards/                    # Route protection
│   │   ├── jwt.guard.ts          # JWT authentication guard
│   │   └── index.ts
│   ├── auth.service.ts           # Business logic
│   ├── auth.controller.ts        # HTTP endpoints
│   ├── auth.module.ts            # Module configuration
│   └── index.ts
│
├── common/                         # Shared utilities
│   ├── interceptors/             # Global interceptors
│   │   ├── response.interceptor.ts  # Response formatting
│   │   └── index.ts
│   ├── filters/                  # Global exception handling
│   │   ├── all-exceptions.filter.ts
│   │   └── index.ts
│   └── index.ts
│
├── annotators/                    # Existing module
├── items/
├── transactions/
├── annotations/
│
├── config/                        # Configuration files
│   └── database.config.ts
│
├── app.module.ts                 # Root module
└── main.ts                       # Application entry point
```

### Separation of Concerns

```
DTOs (register.dto.ts, login.dto.ts)
  ↓
Controller (auth.controller.ts)
  ├─ Validates request using DTOs
  ├─ Calls service methods
  └─ Returns response
  ↓
Service (auth.service.ts)
  ├─ Business logic
  ├─ Password hashing
  ├─ JWT generation
  └─ Database operations
  ↓
Strategies & Guards (jwt.strategy.ts, jwt.guard.ts)
  ├─ Token validation
  └─ Route protection
  ↓
Global Filters & Interceptors
  ├─ Error handling
  └─ Response formatting
```

---

## 🔐 Security Best Practices Implemented

### 1. Password Security ✅
```typescript
// Passwords are hashed with bcrypt salt rounds 10
const hashedPassword = await bcrypt.hash(password, 10);

// Passwords are NEVER returned to client
await this.annotatorModel.findById(id).select('-password');

// Passwords are NEVER logged
```

### 2. JWT Token Security ✅
```typescript
// Secret key from environment variables
secret: configService.get<string>('JWT_SECRET'),

// Short expiration (24 hours)
signOptions: { expiresIn: '24h' },

// Bearer token strategy
ExtractJwt.fromAuthHeaderAsBearerToken()
```

### 3. Input Validation ✅
```typescript
@IsEmail()        // Email format validation
@MinLength(6)     // Password length validation
@IsNotEmpty()     // Required fields
@MaxLength(100)   // Prevent overflow
```

### 4. Error Handling ✅
```typescript
// Specific error messages for auth failures
throw new BadRequestException('Email already registered');
throw new UnauthorizedException('Invalid email or password');

// Generic error messages (don't leak information)
// Never say "email not found" vs "password wrong"
```

### 5. Database Queries ✅
```typescript
// Use parameterized queries (Mongoose)
const annotator = await this.annotatorModel.findOne({ email });

// NO raw string concatenation
```

---

## 🎯 SOLID Principles

### Single Responsibility Principle
```
✓ Auth Service: Only handles authentication logic
✓ Auth Controller: Only handles HTTP requests/responses
✓ JWT Strategy: Only validates JWT tokens
✓ Response Interceptor: Only formats responses
✓ Exception Filter: Only handles errors
```

### Open/Closed Principle
```
✓ ResponseInterceptor can be extended for custom behavior
✓ JwtStrategy can be extended for custom validation
✓ AuthService can add new methods without breaking existing ones
```

### Dependency Injection
```
✓ Constructor injection for all dependencies
✓ ConfigService injected instead of hardcoding values
✓ JwtService injected for token operations
```

### Interface Segregation
```
✓ RegisterDto: Only contains registration fields
✓ LoginDto: Only contains login fields
✓ JwtPayload: Only contains token data
```

---

## 🔄 Clean Code Practices

### Naming Conventions ✅
```typescript
// Service: noun + Service (AuthService)
// Controller: noun + Controller (AuthController)
// DTO: noun + Dto (RegisterDto, LoginDto)
// Guard: noun + Guard (JwtGuard)
// Strategy: noun + Strategy (JwtStrategy)

// Methods: verb + noun (getProfile, registerUser)
// Properties: camelCase (hashedPassword, isPasswordValid)
```

### Code Organization ✅
```typescript
// Logical grouping
// 1. Imports
// 2. Interface/Type definitions
// 3. Class definition
// 4. Constructor
// 5. Public methods
// 6. Private methods
// 7. Exports
```

### Comments & Documentation ✅
```typescript
// Clear variable names reduce need for comments
const isPasswordValid = await bcrypt.compare(password, annotator.password);

// Complex logic gets comments
// Update last login timestamp for audit purposes
annotator.last_login = new Date();

// API endpoints documented in markdown files
```

---

## 🚀 Performance Optimizations

### 1. Query Optimization
```typescript
// Select only needed fields
await this.annotatorModel.findById(id).select('-password');

// Index on unique field
@Prop({ required: true, unique: true })
email: string;
```

### 2. JWT Token Caching
```typescript
// Token generated once, stored on client
// Client sends token with every protected request
// No re-hashing on each request
```

### 3. Input Validation Early
```typescript
// ValidationPipe catches errors before controller
// Invalid requests rejected at entry point
// Saves processing time
```

---

## 📝 Error Handling Strategy

### Hierarchy
```
Global Exception Filter (catch all)
  ↓
HttpException (known errors)
  ├─ BadRequestException (400)
  ├─ UnauthorizedException (401)
  ├─ ForbiddenException (403)
  └─ NotFoundException (404)
  ↓
Generic Error (500)
```

### Implementation
```typescript
// Specific error for known scenarios
if (!annotator) {
  throw new UnauthorizedException('Invalid email or password');
}

// Generic error caught by filter
catch (error) {
  throw new InternalServerErrorException();
}

// Filter catches all and formats response
{
  "success": false,
  "message": "Error message"
}
```

---

## 🧪 Testing Strategy

### Unit Tests (Future)
```typescript
// Test auth.service.ts methods in isolation
// Mock InjectModel and JwtService
// Test password hashing and comparison
// Test JWT generation
```

### Integration Tests (Future)
```typescript
// Test full auth flow
// Test database operations
// Test JWT validation
```

### E2E Tests (Future)
```typescript
// Test API endpoints completely
// Test error scenarios
// Test with actual database
```

---

## 📦 Dependency Management

### Current Dependencies
```json
{
  "@nestjs/jwt": "^11.0.0",           // JWT handling
  "@nestjs/passport": "^10.0.0",      // Passport integration
  "passport-jwt": "^4.0.0",           // JWT strategy
  "passport": "^0.6.0",               // Authentication middleware
  "bcrypt": "^5.1.0",                 // Password hashing
  "class-validator": "^0.15.1",       // DTO validation
  "class-transformer": "^0.5.1"       // DTO transformation
}
```

### Why These Libraries?
```
@nestjs/jwt: NestJS official JWT module, stable and well-integrated
@nestjs/passport: NestJS official Passport integration
passport-jwt: Industry standard JWT strategy
bcrypt: Most secure password hashing algorithm
class-validator: Declarative validation decorators
```

---

## 🔄 Future Enhancements

### 1. Refresh Token Implementation
```typescript
// Current: Single 24h token
// Future: Access token (short) + Refresh token (long)
// Prevents token hijacking
```

### 2. Role-Based Access Control (RBAC)
```typescript
@Roles('admin')
@UseGuards(JwtGuard, RolesGuard)
deleteUser(@Param('id') id: string) {}
```

### 3. Logging & Audit Trail
```typescript
// Log all auth attempts
// Log failed login attempts
// Alert on suspicious activity
```

### 4. Rate Limiting
```typescript
@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() loginDto: LoginDto) {}
```

### 5. Two-Factor Authentication
```typescript
// OTP via email/SMS
// TOTP apps support
```

### 6. OAuth/OIDC Integration
```typescript
// Google Login
// GitHub Login
// Microsoft Login
```

### 7. API Key Authentication
```typescript
// For service-to-service communication
// Rate limiting per API key
```

---

## ✅ Code Quality Checklist

### Before Production

- [ ] All endpoints tested
- [ ] Error scenarios covered
- [ ] Input validation tested
- [ ] JWT token expiration verified
- [ ] Password hashing verified
- [ ] Database indexes created
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Logging implemented
- [ ] Monitoring alerts set up
- [ ] Documentation complete
- [ ] Environment variables documented
- [ ] Code reviewed by team
- [ ] Security audit performed

---

## 📚 References

### NestJS Documentation
- [NestJS Authentication](https://docs.nestjs.com/techniques/authentication)
- [JWT Strategy](https://docs.nestjs.com/recipes/passport#jwt-strategy)
- [Validation](https://docs.nestjs.com/techniques/validation)

### Security Best Practices
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Bcrypt Best Practices](https://en.wikipedia.org/wiki/Bcrypt)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Tools
- [JWT Debugger](https://jwt.io) - Decode and verify JWT tokens
- [Postman](https://www.postman.com) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
