# JioSaavn API Integration Setup

This guide explains how to set up and use the JioSaavn API integration for downloading high-quality songs.

## Prerequisites

1. **JioSaavn API Server**: You need to have the JioSaavn API running. The API is located at:
   ```
   F:\clg projets\Project Internship\Lamentix\New folder\jiosaavn-api-main\jiosaavn-api-main
   ```

## Setup Instructions

### Step 1: Start the JioSaavn API Server

Navigate to the JioSaavn API directory and start it:

```bash
cd "F:\clg projets\Project Internship\Lamentix\New folder\jiosaavn-api-main\jiosaavn-api-main"
bun install
bun run dev
```

The JioSaavn API will run on `http://localhost:3001` by default.

### Step 2: Configure Lamentix Backend

Add the JioSaavn API URL to your backend `.env` file:

```env
JIOSAAVN_API_URL=http://localhost:3001/api
```

If the JioSaavn API is running on a different port or URL, update this accordingly.

### Step 3: Install Dependencies

Make sure axios is installed in the backend:

```bash
cd lamentix-music-streaming/backend
npm install
```

### Step 4: Start Lamentix Backend

```bash
npm run dev
```

## Usage

### Via Frontend

1. Log in to the Lamentix app
2. Go to "Your Library"
3. Click on the "Download" tab
4. Search for songs using the search bar
5. Click "Download" on any song to download it to your library

### Via API

#### Search Songs

```bash
GET /api/jiosaavn/search?query=Imagine Dragons&limit=20
```

#### Get Song by ID

```bash
GET /api/jiosaavn/song/:id
```

#### Download Song (Requires Authentication)

```bash
POST /api/jiosaavn/download
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "songId": "3IoDK8qI",
  "downloadAudio": true,
  "downloadImage": true
}
```

#### Bulk Download

```bash
POST /api/jiosaavn/bulk-download
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "query": "Imagine Dragons",
  "limit": 10,
  "downloadAudio": true,
  "downloadImage": true
}
```

## Features

- **Search**: Search for songs, artists, albums on JioSaavn
- **Download**: Download high-quality audio files (320kbps, 160kbps, or 96kbps)
- **Auto-save**: Downloaded songs are automatically added to your Lamentix library
- **Cover Images**: Download album cover images along with songs
- **Bulk Download**: Download multiple songs from search results at once

## File Storage

Downloaded files are stored in:
- Audio files: `backend/uploads/audio/`
- Cover images: `backend/uploads/images/`

Files are served statically at:
- Audio: `http://localhost:5000/uploads/audio/filename.mp3`
- Images: `http://localhost:5000/uploads/images/filename.jpg`

## Troubleshooting

### JioSaavn API Not Responding

1. Check if the JioSaavn API server is running
2. Verify the `JIOSAAVN_API_URL` in your `.env` file
3. Check the JioSaavn API logs for errors

### Download Fails

1. Ensure you're authenticated (logged in)
2. Check backend logs for error messages
3. Verify disk space is available for downloads
4. Check network connectivity to JioSaavn

### Songs Not Appearing

1. Refresh the library page
2. Check if the song was successfully added via API
3. Verify MongoDB connection

## Notes

- The JioSaavn API must be running for downloads to work
- Downloads require authentication
- Audio files are downloaded in the best available quality (320kbps preferred)
- Large downloads may take time depending on file size and network speed

noteId: "5ed14830e7eb11f09cfa77fd47f2c644"
tags: []

---

