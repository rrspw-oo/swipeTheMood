# Backend API Documentation

## Overview
This document defines the API specifications for the QuoteSwipe backend service. Currently, the frontend uses mock data, but this serves as the blueprint for future backend implementation.

**Status:** 📋 **Planning Phase** - Backend not yet implemented

---

## Base Configuration

### Technology Stack (Planned)
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth (future feature)
- **Hosting:** Firebase Hosting
- **Functions:** Firebase Cloud Functions (if needed)

### API Base URL
```
https://your-project.firebaseapp.com/api/v1
```

---

## Authentication

### Future Implementation
```http
Authorization: Bearer <firebase-id-token>
```

**Note:** Currently not implemented. All endpoints will be public during development.

---

## Endpoints

### GET /quotes

**Purpose:** Retrieve all quotes (Random mode)

**Request:**
```http
GET /quotes
```

**Query Parameters:**
- `limit` (optional): Number of quotes to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "quotes": [
    {
      "id": "string",
      "text": "string",
      "author": "string",
      "moods": ["string"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 20,
  "hasMore": false
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

### GET /quotes/by-mood

**Purpose:** Retrieve quotes filtered by mood

**Request:**
```http
GET /quotes/by-mood?mood=innovation
```

**Query Parameters:**
- `mood` (required): One of `excited`, `innovation`, `not-my-day`, `reflection`
- `limit` (optional): Number of quotes to return (default: 50)

**Response:**
```json
{
  "quotes": [
    {
      "id": "string",
      "text": "string",
      "author": "string",
      "moods": ["innovation", "excited"],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "mood": "innovation",
  "total": 8
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid mood parameter
- `500` - Server error

---

### POST /quotes

**Purpose:** Add a new quote (Admin feature - future)

**Request:**
```http
POST /quotes
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "text": "Innovation distinguishes between a leader and a follower.",
  "author": "Steve Jobs",
  "moods": ["innovation"]
}
```

**Response:**
```json
{
  "id": "generated-id",
  "text": "Innovation distinguishes between a leader and a follower.",
  "author": "Steve Jobs",
  "moods": ["innovation"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Invalid request body
- `401` - Unauthorized
- `500` - Server error

---

### PUT /quotes/:id

**Purpose:** Update existing quote (Admin feature - future)

**Request:**
```http
PUT /quotes/quote-id-123
Content-Type: application/json
Authorization: Bearer <admin-token>

{
  "text": "Updated quote text",
  "author": "Author Name",
  "moods": ["reflection", "innovation"]
}
```

**Response:**
```json
{
  "id": "quote-id-123",
  "text": "Updated quote text",
  "author": "Author Name",
  "moods": ["reflection", "innovation"],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Invalid request body
- `401` - Unauthorized
- `404` - Quote not found
- `500` - Server error

---

### DELETE /quotes/:id

**Purpose:** Delete quote (Admin feature - future)

**Request:**
```http
DELETE /quotes/quote-id-123
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "message": "Quote deleted successfully",
  "id": "quote-id-123"
}
```

**Status Codes:**
- `200` - Deleted successfully
- `401` - Unauthorized
- `404` - Quote not found
- `500` - Server error

---

## Data Models

### Quote Model
```json
{
  "id": "string (auto-generated)",
  "text": "string (required, max 500 chars)",
  "author": "string (optional, max 100 chars)",
  "moods": ["string (required, min 1 mood)"],
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp (optional)"
}
```

### Mood Enum
Valid mood values:
- `"excited"` - Stay humble quotes
- `"innovation"` - Zero-to-one thinking
- `"not-my-day"` - Resilience quotes
- `"reflection"` - Wisdom and deep thoughts

---

## Error Responses

### Standard Error Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error context (optional)"
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/quotes/by-mood"
}
```

### Common Error Codes
- `INVALID_MOOD` - Invalid mood parameter
- `QUOTE_NOT_FOUND` - Quote ID does not exist
- `VALIDATION_ERROR` - Request validation failed
- `UNAUTHORIZED` - Authentication required
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting (Future)

### Limits
- **Public endpoints:** 100 requests/minute/IP
- **Admin endpoints:** 1000 requests/minute/user

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## Firestore Implementation

### Collection Structure
```
/quotes/{quoteId}
{
  text: string,
  author: string,
  moods: string[],
  createdAt: timestamp,
  updatedAt?: timestamp
}
```

### Indexes Required
```javascript
// Composite index for mood filtering
{
  collection: 'quotes',
  fields: [
    { field: 'moods', mode: 'ARRAY_CONTAINS' },
    { field: 'createdAt', mode: 'DESCENDING' }
  ]
}
```

### Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to quotes
    match /quotes/{quoteId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

---

## Caching Strategy (Future)

### Client-Side Caching
- Cache quotes by mood for 5 minutes
- Cache all quotes for 10 minutes
- Use browser localStorage for persistence

### Server-Side Caching
- Firebase automatically caches frequently accessed documents
- Consider CDN caching for static content

---

## Monitoring and Analytics

### Metrics to Track
- Request count per endpoint
- Response time percentiles
- Error rate by endpoint
- Popular moods (usage analytics)

### Logging
- All API requests with response times
- Error details with stack traces
- Quote creation/modification events