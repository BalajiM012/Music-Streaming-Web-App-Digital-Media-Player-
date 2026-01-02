# Postman Collection for Lamentix API

This folder contains a Postman collection for testing the Lamentix Music Streaming API.

## Importing the Collection

1. Open Postman
2. Click "Import" button
3. Select the file `Lamentix_API.postman_collection.json`
4. The collection will be imported with all requests

## Setting Up Environment Variables

The collection uses variables:
- `base_url`: Default is `http://localhost:5000`
- `token`: JWT token for authenticated requests (set after login)

### To set variables:

1. In Postman, click on the collection name
2. Go to "Variables" tab
3. Set `base_url` to your backend URL
4. After logging in, copy the token from the response and set it in the `token` variable

## Testing the APIs

### 1. Health Check
- Run "Health Check" to verify the server is running
- Should return `{"status": "OK", "database": "Supabase connected"}`

### 2. Categories
- **Get All Categories**: Should return list of categories
- **Get Category by ID**: Get specific category details
- **Create Category**: Create a new category (optional)

### 3. Tracks
- **Get All Tracks**: List all tracks with pagination
- **Get Track by ID**: Get specific track details
- **Get Popular Tracks**: Get top tracks by play count
- **Get Tracks by Genre**: Filter tracks by genre
- **Create Track**: Add a new track (requires authentication)

### 4. Podcasts
- **Get All Podcasts**: List all podcasts with pagination
- **Get Podcast by ID**: Get specific podcast details
- **Get Popular Podcasts**: Get top podcasts by play count
- **Create Podcast**: Add a new podcast

### 5. Authentication
- **Register**: Create a new user account
- **Login**: Get JWT token (copy this to `token` variable)
- **Get Current User**: Get authenticated user details

## Expected Responses

### Success Response Format
```json
{
  "success": true,
  "data": [...]
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

## Testing Workflow

1. Start the backend server: `npm run dev` in `backend` directory
2. Test Health Check endpoint
3. Test Categories endpoint (should return default categories)
4. Test Tracks endpoint (may be empty initially)
5. Test Podcasts endpoint (may be empty initially)
6. Register a new user
7. Login to get token
8. Set token in collection variables
9. Test authenticated endpoints (Create Track, etc.)

## Notes

- All endpoints return JSON
- Pagination uses `limit` and `page` query parameters
- Search uses `search` query parameter
- Authentication uses Bearer token in Authorization header
- Some endpoints require authentication (marked in collection)

noteId: "ea84d4f0e7eb11f09cfa77fd47f2c644"
tags: []

---

