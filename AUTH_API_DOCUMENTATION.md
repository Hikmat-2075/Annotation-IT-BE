# Auth & Annotator Management API Documentation

## 📋 Architecture Overview

Sistem authentication menggunakan JWT (JSON Web Token) dengan struktur modular:

```
auth/
├── dto/                    # Data Transfer Objects
│   ├── register.dto.ts    # Register validation
│   └── login.dto.ts       # Login validation
├── strategies/            # Passport strategies
│   └── jwt.strategy.ts    # JWT validation
├── guards/                # Route guards
│   └── jwt.guard.ts       # Protected route guard
├── auth.service.ts        # Business logic
├── auth.controller.ts     # API endpoints
└── auth.module.ts         # Module configuration

common/
├── interceptors/          # Global interceptors
│   └── response.interceptor.ts  # Response formatting
└── filters/               # Global filters
    └── all-exceptions.filter.ts # Error handling
```

## 🔐 JWT Payload Structure

```typescript
{
  id: string;           // UUID v4
  email: string;        // Annotator email
  name: string;         // Annotator name
  iat: number;          // Issued at
  exp: number;          // Expiration (24h)
}
```

## 📡 API Endpoints

### 1. Register Annotator
**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

**Validation Rules:**
- `name`: String, 3-50 characters, required
- `email`: Valid email format, required
- `password`: String, 6-100 characters, required

---

### 2. Login Annotator
**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

**Side Effects:**
- Updates `last_login` timestamp

---

### 3. Get Profile (Protected)
**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "completed_tasks": ["task-1", "task-2"],
    "total_annotated": 150,
    "last_login": "2026-05-14T10:30:00Z",
    "createdAt": "2026-05-10T15:20:00Z",
    "updatedAt": "2026-05-14T10:30:00Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 🧪 Testing dengan Postman

### Import Collection

```json
{
  "info": {
    "name": "Auth API",
    "description": "Authentication endpoints testing",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Register",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePassword123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/auth/register",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "register"]
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"SecurePassword123\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/auth/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "login"]
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "url": {
          "raw": "http://localhost:3000/auth/profile",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["auth", "profile"]
        }
      }
    }
  ]
}
```

### Step-by-step Testing

1. **Register User**
   - Buka Postman
   - Buat request POST ke `http://localhost:3000/auth/register`
   - Set header: `Content-Type: application/json`
   - Kirim request dengan body register
   - Copy token dari response

2. **Login User**
   - Buat request POST ke `http://localhost:3000/auth/login`
   - Set header: `Content-Type: application/json`
   - Kirim request dengan body login
   - Copy token dari response

3. **Get Profile**
   - Buat request GET ke `http://localhost:3000/auth/profile`
   - Set header: `Authorization: Bearer {token}`
   - Kirim request

---

## 🛡️ Security Features

### 1. Password Hashing
- Menggunakan bcrypt dengan salt rounds 10
- Password tidak pernah disimpan plain text
- Password tidak pernah dikembalikan ke client

### 2. JWT Token
- Secret key dari environment variable
- Expiration time 24 jam
- Bearer token strategy

### 3. Route Protection
- JWT Guard pada semua protected routes
- Token validation pada setiap request
- Automatic token refresh dapat ditambahkan

### 4. Validation
- DTO validation dengan class-validator
- Input sanitization
- Type checking

---

## 🚀 Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

### Seeding Data (Optional)
```bash
npm run seed:annotators
```

---

## 📝 Error Handling

### Global Exception Filter
Semua error ditangani secara global:

```typescript
// Input validation error
{
  "success": false,
  "message": "Email must be an email"
}

// Authorization error
{
  "success": false,
  "message": "Unauthorized"
}

// Database error
{
  "success": false,
  "message": "Database connection error"
}
```

---

## 🔄 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

Semua response mengikuti format yang konsisten melalui Global Response Interceptor.

---

## 🔌 Integration dengan Module Lain

### Menggunakan JWT Guard di Module Lain
```typescript
import { JwtGuard } from 'src/auth/guards';

@Controller('items')
export class ItemsController {
  @UseGuards(JwtGuard)
  @Get()
  getItems(@Request() req: any) {
    const annotatorId = req.user.id;
    // Business logic
  }
}
```

### Akses User Info dari Request
```typescript
@UseGuards(JwtGuard)
@Post()
create(@Request() req: any, @Body() dto: CreateItemDto) {
  const { id, email, name } = req.user;
  // User info tersedia
}
```

---

## 📦 Dependencies

```json
{
  "@nestjs/jwt": "^11.0.0",
  "@nestjs/passport": "^10.0.0",
  "passport-jwt": "^4.0.0",
  "passport": "^0.6.0",
  "bcrypt": "^5.1.0",
  "class-validator": "^0.15.1",
  "class-transformer": "^0.5.1"
}
```

---

## ⚙️ Environment Variables

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/bundle_annotaion_db
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h
```

---

## 🎯 Next Steps

1. **Profile Endpoint Expansion**
   - Update profile information
   - Change password
   - Delete account

2. **Role-Based Access Control (RBAC)**
   - Admin, Annotator, Manager roles
   - Permission decorators

3. **Refresh Token**
   - Implement refresh token flow
   - Token blacklist

4. **Rate Limiting**
   - Prevent brute force attacks
   - API rate limiting

5. **Logging**
   - Request logging
   - Error logging
   - Audit trail
