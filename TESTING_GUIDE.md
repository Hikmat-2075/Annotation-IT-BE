# Testing Guide - Auth API

## 🚀 Quick Start Testing

### 1. Start the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

Application akan berjalan di `http://localhost:3000`

---

## 📝 Testing dengan cURL

### Test 1: Register Annotator

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Expected Response (201):**
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

---

### Test 2: Login Annotator

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123"
  }'
```

**Expected Response (200):**
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

---

### Test 3: Get Profile (Protected)

```bash
# Ganti TOKEN dengan token dari login/register response
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "completed_tasks": [],
    "total_annotated": 0,
    "last_login": "2026-05-14T10:30:00Z",
    "createdAt": "2026-05-10T15:20:00Z",
    "updatedAt": "2026-05-14T10:30:00Z"
  }
}
```

---

## ❌ Error Testing

### Test 1: Register dengan Email yang Sudah Ada

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "AnotherPassword123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "Email already registered"
}
```

---

### Test 2: Login dengan Password Salah

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword123"
  }'
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### Test 3: Access Protected Route Tanpa Token

```bash
curl -X GET http://localhost:3000/auth/profile
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### Test 4: Access Protected Route dengan Token Invalid

```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response (401):**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

### Test 5: Validation Error - Email Tidak Valid

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "password": "SecurePassword123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "email must be an email"
}
```

---

### Test 6: Validation Error - Password Terlalu Pendek

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "123"
  }'
```

**Expected Response (400):**
```json
{
  "success": false,
  "message": "password must be longer than or equal to 6 characters"
}
```

---

## 🧪 Testing dengan Postman

### Import Collection

1. Buka Postman
2. Klik **Collections** > **Import**
3. Pilih file `POSTMAN_COLLECTION.json`
4. Collection akan ter-import

### Setup Environment Variables

1. Klik **Environments** > **Create**
2. Nama: `Local Development`
3. Tambahkan variables:
   - `base_url` = `http://localhost:3000`
   - `token` = (kosong, akan diisi otomatis)
   - `annotatorId` = (kosong, akan diisi otomatis)
4. Save

### Run Tests

**Sequence:**
1. Run **Register** endpoint
2. Run **Login** endpoint
3. Run **Get Profile** endpoint

Token akan otomatis disimpan ke environment variable setelah register/login.

---

## 🔄 Manual Testing Flow

### Scenario 1: New User Registration & Login

```
1. Register new user
   ✓ Receive JWT token
   ✓ Token can be used immediately

2. Logout and Login again
   ✓ Login successful with same credentials
   ✓ New JWT token issued

3. Access profile with token
   ✓ Profile data returned
   ✓ Password tidak included
```

### Scenario 2: Security Testing

```
1. Try to register with same email
   ✓ Error: Email already registered

2. Try login with wrong password
   ✓ Error: Invalid email or password

3. Try access without token
   ✓ Error: Unauthorized

4. Try access with invalid token
   ✓ Error: Unauthorized
```

### Scenario 3: Validation Testing

```
1. Register with invalid email
   ✓ Error: Invalid email format

2. Register with short password
   ✓ Error: Password too short

3. Register with empty name
   ✓ Error: Name is required

4. Send invalid JSON
   ✓ Error: Bad request
```

---

## 📊 Monitoring

### Check Logs

```bash
# Development mode akan menampilkan logs real-time
npm run start:dev
```

**Expected logs untuk successful request:**
```
[Nest] 1234  - 05/14/2026, 10:30:00 AM     LOG [RouterExplorer] Mapped {/auth/register, POST} route
🚀 Application running on port 3000
```

---

## 🐛 Debugging

### Enable Debug Mode

```bash
npm run start:debug
```

Akses debugger di `chrome://inspect`

### Check MongoDB Connection

```bash
# Pastikan MongoDB berjalan
mongosh

# Check database dan collection
use bundle_annotaion_db
db.annotators.find()
```

---

## ✅ Checklist Testing

- [ ] Register endpoint working
- [ ] Login endpoint working
- [ ] Profile endpoint dengan token working
- [ ] Password hashing working (password tidak plain text di DB)
- [ ] JWT token valid 24 hours
- [ ] Email unique constraint working
- [ ] Password validation working (6+ chars)
- [ ] Email validation working
- [ ] Error handling untuk all scenarios
- [ ] Response format consistent (success/data atau success/message)
- [ ] CORS enabled
- [ ] ValidationPipe working
- [ ] Exception filter working
- [ ] Response interceptor working

---

## 🚀 Ready for Sprint 2.2

Setelah semua testing passed, Anda bisa:

1. ✅ Implement more annotator management endpoints
2. ✅ Add transaction endpoints dengan JWT protection
3. ✅ Add annotations endpoints
4. ✅ Implement file upload untuk annotated data
5. ✅ Add rate limiting & logging

---

## 📞 Support

Untuk debugging lebih lanjut:
- Check `.env` file untuk JWT_SECRET dan MONGODB_URI
- Pastikan MongoDB running di `mongodb://localhost:27017`
- Pastikan port 3000 tidak digunakan aplikasi lain
- Check network tab di browser developer tools untuk request/response details
