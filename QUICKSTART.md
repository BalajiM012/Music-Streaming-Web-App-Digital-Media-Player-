# Quick Start Guide

## Prerequisites
- Node.js (v16+) installed
- MongoDB running (local or cloud)

## Step 1: Setup Backend

```bash
cd lamentix-music-streaming/backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lamentix
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

Start backend:
```bash
npm run dev
```

## Step 2: Setup Frontend

Open a new terminal:

```bash
cd lamentix-music-streaming/frontend
npm install
npm run dev
```

## Step 3: Access the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Step 4: Create Your First Account

1. Go to http://localhost:3000
2. Click "Sign up"
3. Create an account
4. Start exploring!

## Adding Sample Data

You can add songs via the API. Example using curl:

```bash
curl -X POST http://localhost:5000/api/songs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Sample Song",
    "artist": "Sample Artist",
    "album": "Sample Album",
    "genre": "Pop",
    "duration": 180,
    "audioUrl": "http://localhost:5000/uploads/audio/sample.mp3",
    "coverImage": "http://localhost:5000/uploads/images/sample.jpg"
  }'
```

## Troubleshooting

- **MongoDB Connection Error**: Make sure MongoDB is running
- **Port Already in Use**: Change PORT in `.env` file
- **CORS Errors**: Check that backend is running on port 5000
