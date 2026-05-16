# Profile Image Upload Feature - Implementation Guide

## Overview
Successfully implemented a profile image upload feature for the Annotators module using Cloudinary integration with NestJS, Mongoose, and Multer.

## Files Created/Modified

### 1. **New Files Created**

#### [src/cloudinary/cloudinary.service.ts](src/cloudinary/cloudinary.service.ts)
- **Purpose**: Handles all Cloudinary upload operations
- **Key Methods**:
  - `uploadProfileImage(fileBuffer: Buffer, fileName: string): Promise<string>`
    - Accepts file buffer and filename
    - Returns secure URL from Cloudinary
    - Stores images in `annotators/profiles` folder
    - Automatically overwrites existing images with same public_id

#### [src/cloudinary/cloudinary.module.ts](src/cloudinary/cloudinary.module.ts)
- **Purpose**: NestJS module for Cloudinary integration
- **Exports**: `CloudinaryService` for use in other modules
- **Imports**: `ConfigModule` for environment variable access

### 2. **Modified Files**

#### [src/annotators/schema/annotator.schema.ts](src/annotators/schema/annotator.schema.ts)
- ✅ **Already had** `profile_uri` field implemented
- Type: `string | null`
- Default: `null`
- Stores the Cloudinary secure URL for the user's profile image

#### [src/annotators/annotators.module.ts](src/annotators/annotators.module.ts)
- **Changes**: 
  - Added `CloudinaryModule` import
  - Now imports and exports Cloudinary service dependency

#### [src/annotators/annotators.service.ts](src/annotators/annotators.service.ts)
- **New Method**: `uploadProfileImage(annotatorId: string, fileBuffer: Buffer)`
  - Validates annotator exists
  - Generates unique filename using annotatorId and timestamp
  - Calls CloudinaryService to upload image
  - Updates `profile_uri` field in database
  - Returns updated annotator document (without password)
  - Throws `NotFoundException` if annotator not found

#### [src/annotators/annotators.controller.ts](src/annotators/annotators.controller.ts)
- **New Endpoint**: `PATCH /annotators/profile/avatar`
- **Authentication**: Protected with `JwtGuard`
- **File Handling**: 
  - Uses `FileInterceptor` with Multer
  - Maximum file size: 2 MB
  - File validation: Only image files allowed (checked via MIME type)
  - Rejects non-image files with error message
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile image uploaded successfully",
    "data": {
      "_id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "profile_uri": "https://res.cloudinary.com/...",
      "total_annotated": 0,
      "completed_tasks": [],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

## Environment Configuration

Add the following to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**To get these credentials:**
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → Settings → API Keys
3. Copy your Cloud Name, API Key, and API Secret

## API Usage

### Upload Profile Image

**Endpoint**: `PATCH /annotators/profile/avatar`

**Authentication**: Required (JWT Bearer Token)

**Request**:
```bash
curl -X PATCH http://localhost:3002/annotators/profile/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

**Using Postman**:
1. Set method to `PATCH`
2. URL: `http://localhost:3002/annotators/profile/avatar`
3. Go to "Authorization" tab → Set type to "Bearer Token" → Enter your JWT
4. Go to "Body" tab → Select "form-data"
5. Add key `avatar` (type: File) and select your image file
6. Click Send

**Success Response** (200):
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "data": {
    "_id": "annotator_id",
    "name": "Annotator Name",
    "email": "email@example.com",
    "profile_uri": "https://res.cloudinary.com/your-cloud/image/upload/v123456/annotators/profiles/annotator_id-1234567890",
    "total_annotated": 5,
    "completed_tasks": ["task1", "task2"],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "statusCode": 400,
  "message": "Only image files are allowed",
  "error": "Bad Request"
}
```

**Error Response** (400 - No file):
```json
{
  "statusCode": 400,
  "message": "No file uploaded",
  "error": "Bad Request"
}
```

**Error Response** (404):
```json
{
  "statusCode": 404,
  "message": "Annotator not found",
  "error": "Not Found"
}
```

## Validation Rules

✅ **Implemented Validations**:
- Only image files accepted (MIME type validation)
- Maximum file size: 2 MB
- Authentication required (JWT)
- Annotator must exist in database

## Architecture & Design Patterns

### Separation of Concerns
- **Controller**: Handles HTTP requests, validation, response formatting
- **Service**: Contains business logic, database operations, Cloudinary integration
- **Module**: Manages dependencies and feature composition

### Key Features
1. **Secure URLs**: Cloudinary provides secure, HTTPS URLs
2. **Auto-overwrite**: Re-uploading replaces old image (same public_id)
3. **Organized Storage**: Images stored in `/annotators/profiles/` folder
4. **No Password Exposure**: Updated user data excludes password field
5. **Error Handling**: Comprehensive error messages and HTTP status codes

## Dependencies

The following packages were already present in `package.json`:
- `@nestjs/platform-express` - For file upload middleware
- `multer` - For file handling
- `cloudinary` - For Cloudinary integration
- `@nestjs/config` - For environment variable management
- `@nestjs/mongoose` - For database operations

## Testing the Feature

### 1. **Using cURL**:
```bash
curl -X PATCH http://localhost:3002/annotators/profile/avatar \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "avatar=@test.jpg"
```

### 2. **Using Postman**:
- Import the provided `POSTMAN_COLLECTION.json`
- Add the profile avatar upload request
- Set JWT token in authorization
- Select image file in body form-data

### 3. **Verify in Database**:
```javascript
// MongoDB query
db.annotators.findOne({ _id: "annotator_id" })
// Should show: profile_uri: "https://res.cloudinary.com/..."
```

## Troubleshooting

### Issue: "Cloudinary API error"
- **Solution**: Verify Cloudinary credentials in `.env` file
- Check Cloud Name, API Key, and API Secret are correct

### Issue: "No file uploaded"
- **Solution**: Ensure form-data key is exactly `avatar`
- Verify file is actually being sent

### Issue: "Only image files are allowed"
- **Solution**: Ensure file has valid image MIME type (jpg, png, gif, webp, etc.)

### Issue: "Annotator not found"
- **Solution**: Verify the JWT token belongs to an existing annotator
- Check annotator ID in the JWT payload

## Security Considerations

✅ **Implemented Security**:
- JWT authentication required
- File size limit (2 MB max)
- File type validation (images only)
- HTTPS URLs from Cloudinary
- No sensitive data in response (password excluded)

## Future Enhancements

Possible improvements:
1. Add image cropping/transformation via Cloudinary API
2. Support multiple image formats/sizes
3. Add image deletion endpoint
4. Implement rate limiting on uploads
5. Add image optimization flags to Cloudinary upload
6. Support batch profile updates

## References

- [Cloudinary Node.js SDK Docs](https://cloudinary.com/documentation/node_integration)
- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Multer Documentation](https://github.com/expressjs/multer)
