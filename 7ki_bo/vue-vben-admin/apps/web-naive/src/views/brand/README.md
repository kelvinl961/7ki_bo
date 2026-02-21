# Brand Logo Settings (LOGO及图片设置)

## Overview

The Brand Logo Settings page provides a comprehensive interface for managing brand configurations, logos, and related images within the system. This implementation includes full CRUD operations, image upload functionality, and responsive design.

## Features

### 🎯 Core Functionality

- **Create/Edit/Delete** brand settings
- **Image Upload** with drag-and-drop support
- **Real-time Preview** of uploaded images
- **Search & Filter** by logo type, brand code, and site URL
- **Pagination** with configurable page sizes
- **Responsive Design** for desktop and mobile

### 🔧 Technical Implementation

#### Frontend Components

- **BrandLogoSetting.vue**: Main page component with table and modals
- **ImageUpload.vue**: Reusable image upload component
- **API Integration**: Full REST API client with TypeScript types

#### Backend APIs

- **GET /api/brand-settings**: List with filtering and pagination
- **POST /api/brand-settings**: Create new brand setting
- **PUT /api/brand-settings/:id**: Update existing brand setting
- **DELETE /api/brand-settings/:id**: Delete brand setting
- **POST /api/upload/image**: Upload image files

## Component Structure

### BrandLogoSetting.vue

```vue
<template>
  <!-- Header with actions -->
  <div class="brand-logo-setting">
    <!-- Search filters -->
    <n-card class="mb-4">
      <!-- Logo type, brand code, site URL filters -->
    </n-card>

    <!-- Data table -->
    <n-card>
      <n-data-table />
    </n-card>

    <!-- Create/Edit Modal -->
    <n-modal>
      <n-form>
        <!-- Basic info + Image uploads -->
      </n-form>
    </n-modal>
  </div>
</template>
```

### ImageUpload.vue

```vue
<template>
  <div class="image-upload">
    <n-upload>
      <!-- Upload area with preview -->
    </n-upload>
    <!-- Preview modal -->
  </div>
</template>
```

## Database Schema

### BrandSetting Model

```prisma
model BrandSetting {
  id             Int      @id @default(autoincrement())
  name           String
  brandCode      String   @unique
  siteUrl        String?
  showHomeEntry  Boolean  @default(false)
  logoType       String?
  appLogoUrl     String?
  appBackground  String?
  lobbyLogoUrl   String?
  webLogoUrl     String?
  blockedMessage String?
  remark         String?
  updatedBy      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## API Endpoints

### Brand Settings Management

```typescript
// Get list with pagination and filters
GET /api/brand-settings?page=1&pageSize=10&logoType=自定义图片

// Create new setting
POST /api/brand-settings
{
  "name": "Brand Name",
  "brandCode": "BRAND001",
  "siteUrl": "https://example.com",
  "logoType": "自定义图片",
  "showHomeEntry": true
}

// Update setting
PUT /api/brand-settings/1
{
  "name": "Updated Brand Name",
  "appLogoUrl": "/uploads/images/abc123.png"
}

// Delete setting
DELETE /api/brand-settings/1
```

### Image Upload

```typescript
// Upload single image
POST /api/upload/image
Content-Type: multipart/form-data
{
  "file": <image file>
}

// Response
{
  "success": true,
  "data": {
    "url": "/uploads/images/abc123.png",
    "filename": "abc123.png",
    "originalName": "logo.png",
    "size": 12345,
    "mimetype": "image/png"
  }
}
```

## Usage Guide

### 1. Accessing the Page

Navigate to `/operateManager/brandManager?activeName=logoSetting`

### 2. Managing Brand Settings

- **Create**: Click "新增设置" button
- **Edit**: Click "修改" in the action column
- **View Details**: Click "详情" in the action column
- **Delete**: Available through edit modal

### 3. Image Management

- **Upload**: Drag and drop or click to select images
- **Preview**: Click eye icon to view full-size image
- **Delete**: Click trash icon to remove image
- **Size Limits**: Different limits for different image types

### 4. Search & Filter

- **Logo Type**: Filter by "自定义图片" or "默认LOGO"
- **Brand Code**: Text search in brand codes
- **Site URL**: Text search in site URLs

## Technical Features

### 🔒 Security

- **Authentication**: All endpoints require JWT authentication
- **Validation**: Comprehensive input validation
- **File Upload**: Secure file handling with type and size restrictions

### 📱 Responsive Design

- **Grid Layout**: Responsive grid system
- **Mobile-First**: Optimized for mobile devices
- **Touch-Friendly**: Large touch targets and gestures

### 🎨 UI/UX

- **Modern Design**: Clean, professional interface
- **Real-time Feedback**: Loading states and success messages
- **Error Handling**: User-friendly error messages
- **Accessibility**: ARIA labels and keyboard navigation

## Development Notes

### File Structure

```
src/
├── views/brand/
│   ├── BrandLogoSetting.vue
│   └── README.md
├── components/common/
│   └── ImageUpload.vue
└── api/brand/
    └── brandSetting.ts
```

### Backend Files

```
backend/
├── src/routes/
│   ├── brandSetting.ts
│   └── upload.ts
├── src/controllers/
│   └── brandSettingController.ts
├── src/validators/
│   └── brandSettingValidator.ts
└── prisma/
    └── schema.prisma
```

### Dependencies

- **Frontend**: Vue 3, Naive UI, @iconify/vue
- **Backend**: Express, Prisma, Multer, UUID
- **Database**: PostgreSQL

## Best Practices

### 1. Performance

- **Lazy Loading**: Components and routes are lazy-loaded
- **Pagination**: Server-side pagination for large datasets
- **Image Optimization**: Automatic image compression and resizing

### 2. Maintainability

- **TypeScript**: Full type safety throughout
- **Modular Design**: Reusable components and utilities
- **Documentation**: Comprehensive inline documentation

### 3. Error Handling

- **Validation**: Client and server-side validation
- **Fallbacks**: Graceful degradation for failed operations
- **Logging**: Comprehensive error logging

## Testing

### Manual Testing Checklist

- [ ] Create new brand setting
- [ ] Upload different image types
- [ ] Update existing settings
- [ ] Delete settings
- [ ] Search and filter functionality
- [ ] Responsive design on mobile
- [ ] Error handling scenarios

### API Testing

```bash
# Test brand settings endpoint
curl -X GET http://localhost:5000/api/brand-settings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test image upload
curl -X POST http://localhost:5000/api/upload/image \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@path/to/image.png"
```

## Troubleshooting

### Common Issues

1. **Images not uploading**: Check file size limits and formats
2. **Authorization errors**: Verify JWT token validity
3. **Database errors**: Ensure schema is up to date
4. **Missing images**: Check static file serving configuration

### Debug Tips

- Enable browser developer tools for network debugging
- Check server logs for backend errors
- Verify database connection and schema
- Test API endpoints directly with curl/Postman

---

_This implementation provides a complete, production-ready Brand Logo Settings management system with modern UI/UX and robust backend architecture._
