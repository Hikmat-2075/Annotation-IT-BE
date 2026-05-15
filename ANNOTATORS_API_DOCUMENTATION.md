# Annotators Management API Documentation

## 📋 Overview

Annotators Management API menyediakan endpoint lengkap untuk mengelola data annotator dalam sistem annotation. API ini menggunakan JWT authentication untuk endpoint yang memerlukan authorization.

## 🔐 Authentication

Beberapa endpoint memerlukan JWT token:
- Header: `Authorization: Bearer {token}`
- Token didapat dari endpoint `/auth/login`

## 📡 API Endpoints

### 1. Create Annotator
**Endpoint:** `POST /annotators`

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
  "message": "Annotator created successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "completed_tasks": [],
    "total_annotated": 0,
    "createdAt": "2026-05-14T10:30:00Z",
    "updatedAt": "2026-05-14T10:30:00Z"
  }
}
```

**Validation Rules:**
- `name`: String, required
- `email`: Valid email format, unique, required
- `password`: String, akan di-hash dengan bcrypt

---

### 2. Get All Annotators
**Endpoint:** `GET /annotators`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Annotators retrieved successfully",
  "data": [
    {
      "_id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "completed_tasks": ["task-1", "task-2"],
      "total_annotated": 150,
      "last_login": "2026-05-14T10:30:00Z",
      "createdAt": "2026-05-10T15:20:00Z",
      "updatedAt": "2026-05-14T10:30:00Z"
    }
  ]
}
```

---

### 3. Get Annotator Statistics
**Endpoint:** `GET /annotators/statistics`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalAnnotators": 25,
    "totalAnnotations": 1250,
    "averageAnnotations": 50,
    "maxAnnotations": 200
  }
}
```

---

### 4. Get Annotator by ID
**Endpoint:** `GET /annotators/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Annotator retrieved successfully",
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

---

### 5. Get My Profile (Protected)
**Endpoint:** `GET /annotators/profile/me`

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

---

### 6. Update Annotator
**Endpoint:** `PATCH /annotators/:id`

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "total_annotated": 160
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Annotator updated successfully",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "completed_tasks": ["task-1", "task-2"],
    "total_annotated": 160,
    "last_login": "2026-05-14T10:30:00Z",
    "createdAt": "2026-05-10T15:20:00Z",
    "updatedAt": "2026-05-14T10:35:00Z"
  }
}
```

---

### 7. Delete Annotator
**Endpoint:** `DELETE /annotators/:id`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Annotator deleted successfully",
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

---

### 8. Add Completed Task
**Endpoint:** `POST /annotators/:id/tasks/:taskId`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task added to completed tasks",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "completed_tasks": ["task-1", "task-2", "task-3"],
    "total_annotated": 151,
    "last_login": "2026-05-14T10:30:00Z",
    "createdAt": "2026-05-10T15:20:00Z",
    "updatedAt": "2026-05-14T10:35:00Z"
  }
}
```

---

### 9. Remove Completed Task
**Endpoint:** `DELETE /annotators/:id/tasks/:taskId`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Task removed from completed tasks",
  "data": {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "completed_tasks": ["task-1", "task-2"],
    "total_annotated": 150,
    "last_login": "2026-05-14T10:30:00Z",
    "createdAt": "2026-05-10T15:20:00Z",
    "updatedAt": "2026-05-14T10:35:00Z"
  }
}
```

---

## ❌ Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "email must be an email"
}
```

### Conflict Error (409)
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Annotator not found"
}
```

### Unauthorized Error (401)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## 🧪 Testing Examples

### Create Annotator
```bash
curl -X POST http://localhost:3000/annotators \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123"
  }'
```

### Get All Annotators
```bash
curl -X GET http://localhost:3000/annotators
```

### Get Annotator by ID
```bash
curl -X GET http://localhost:3000/annotators/550e8400-e29b-41d4-a716-446655440000
```

### Update Annotator
```bash
curl -X PATCH http://localhost:3000/annotators/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "total_annotated": 50
  }'
```

### Add Completed Task
```bash
curl -X POST http://localhost:3000/annotators/550e8400-e29b-41d4-a716-446655440000/tasks/task-123
```

### Get Profile (with JWT)
```bash
curl -X GET http://localhost:3000/annotators/profile/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Business Logic

### Password Security
- Password selalu di-hash menggunakan bcrypt (salt rounds 10)
- Password tidak pernah dikembalikan dalam response
- Password tidak pernah disimpan plain text

### Task Management
- `completed_tasks`: Array of task IDs yang sudah diselesaikan
- `total_annotated`: Counter otomatis berdasarkan jumlah completed_tasks
- Task hanya bisa ditambahkan sekali (unique check)
- Menghapus task akan mengurangi total_annotated

### Data Integrity
- Email harus unique di seluruh sistem
- UUID v4 digunakan untuk _id
- Timestamps otomatis (createdAt, updatedAt)
- Soft delete tidak diimplementasi (hard delete)

---

## 🔗 Integration dengan Auth Module

### JWT Payload Structure
```typescript
{
  id: string;    // Annotator UUID
  email: string; // Annotator email
  name: string;  // Annotator name
}
```

### Accessing User Data in Controllers
```typescript
@UseGuards(JwtGuard)
@Post()
createSomething(@Request() req: any) {
  const annotatorId = req.user.id;    // From JWT
  const email = req.user.email;       // From JWT
  const name = req.user.name;         // From JWT
}
```

---

## 📈 Performance Considerations

### Database Indexes
```javascript
// Recommended indexes for better performance
db.annotators.createIndex({ email: 1 }, { unique: true });
db.annotators.createIndex({ createdAt: -1 });
db.annotators.createIndex({ total_annotated: -1 });
```

### Query Optimization
- Menggunakan `.select('-password')` untuk exclude password
- Aggregation pipeline untuk statistics
- Proper error handling untuk prevent unnecessary queries

---

## 🚀 Next Steps

1. **Role-Based Access Control (RBAC)**
   - Admin, Manager, Annotator roles
   - Permission-based endpoints

2. **Bulk Operations**
   - Bulk create annotators
   - Bulk update operations

3. **Advanced Filtering**
   - Filter by date range
   - Filter by annotation count
   - Search by name/email

4. **Audit Trail**
   - Track all changes to annotator data
   - Log all task completions

5. **Caching**
   - Redis cache untuk frequently accessed data
   - Cache statistics data

---

## 📝 Schema Reference

```typescript
@Schema({
  timestamps: true,
  versionKey: false,
})
export class Annotators {
  @Prop({ required: true, default: uuidv4 })
  _id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;  // Hashed with bcrypt

  @Prop({ type: [String], default: [] })
  completed_tasks: string[];  // Array of task IDs

  @Prop({ default: 0 })
  total_annotated: number;  // Auto-calculated

  @Prop()
  last_login?: Date;  // Updated by auth service
}
```
