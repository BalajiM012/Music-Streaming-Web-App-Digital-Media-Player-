# Lamentix - Music Streaming Web Application

A full-stack music and podcast streaming web application built with React and Node.js, featuring a modern UI similar to Spotify Lite.

## Features

- 🎵 **Music Streaming**: Stream audio content with a beautiful player interface
- 🎧 **Podcast Support**: Listen to podcasts alongside music
- 📋 **Playlist Management**: Create, edit, and manage playlists
- 🔍 **Search Functionality**: Search for songs, artists, albums, and podcasts
- 👤 **User Authentication**: Secure registration and login system
- ❤️ **Favorites**: Save your favorite songs
- 🎨 **Modern UI**: Clean, responsive design with dark theme
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices
- ⬇️ **JioSaavn Integration**: Download high-quality songs from JioSaavn directly to your library

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **React Router** for navigation
- **Vite** for build tooling
- **Axios** for API calls
- **Lucide React** for icons

## Project Structure

```
lamentix-music-streaming/
├── backend/
│   ├── models/          # MongoDB models (User, Song, Playlist, Podcast)
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── uploads/         # Audio and image uploads (create this folder)
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context providers
│   │   └── App.jsx      # Main app component
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd lamentix-music-streaming/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lamentix
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
JIOSAAVN_API_URL=http://localhost:3001/api
```

**Note**: For JioSaavn integration, you need to have the JioSaavn API running. See `JIOSAAVN_SETUP.md` for detailed setup instructions.

4. Create the uploads directories:
```bash
mkdir uploads
mkdir uploads/audio
mkdir uploads/images
```

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd lamentix-music-streaming/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Songs
- `GET /api/songs` - Get all songs (with search, pagination)
- `GET /api/songs/:id` - Get song by ID
- `POST /api/songs` - Create song (requires auth)
- `GET /api/songs/popular/top` - Get popular songs
- `GET /api/songs/genre/:genre` - Get songs by genre

### Playlists
- `GET /api/playlists` - Get all playlists
- `GET /api/playlists/my-playlists` - Get user's playlists (requires auth)
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/playlists` - Create playlist (requires auth)
- `PUT /api/playlists/:id` - Update playlist (requires auth)
- `DELETE /api/playlists/:id` - Delete playlist (requires auth)
- `POST /api/playlists/:id/songs` - Add song to playlist (requires auth)
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist (requires auth)

### Podcasts
- `GET /api/podcasts` - Get all podcasts
- `GET /api/podcasts/:id` - Get podcast by ID
- `POST /api/podcasts` - Create podcast
- `GET /api/podcasts/popular/top` - Get popular podcasts

### Users
- `GET /api/users/:id` - Get user profile
- `POST /api/users/favorites` - Add song to favorites (requires auth)
- `DELETE /api/users/favorites/:songId` - Remove song from favorites (requires auth)

### JioSaavn Integration
- `GET /api/jiosaavn/search` - Search songs on JioSaavn
- `GET /api/jiosaavn/song/:id` - Get song details by JioSaavn ID
- `GET /api/jiosaavn/song-by-link` - Get song details by JioSaavn link
- `POST /api/jiosaavn/download` - Download and add song to library (requires auth)
- `POST /api/jiosaavn/bulk-download` - Bulk download songs from search (requires auth)

## Usage

1. **Register/Login**: Create an account or login to access all features
2. **Browse Music**: Explore songs on the home page
3. **Search**: Use the search bar to find specific songs, artists, or podcasts
4. **Create Playlists**: Go to "Your Library" and create custom playlists
5. **Play Music**: Click on any song to start playing
6. **Manage Playlists**: Add or remove songs from your playlists

## Adding Audio Files

To add audio files to the application:

1. Place audio files in `backend/uploads/audio/`
2. Place cover images in `backend/uploads/images/`
3. Use the API to create songs/podcasts with the file URLs:
   - Audio URL format: `http://localhost:5000/uploads/audio/filename.mp3`
   - Image URL format: `http://localhost:5000/uploads/images/filename.jpg`

Example API call to add a song:
```bash
POST http://localhost:5000/api/songs
Headers: Authorization: Bearer YOUR_TOKEN
Body: {
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "genre": "Pop",
  "duration": 180,
  "audioUrl": "http://localhost:5000/uploads/audio/song.mp3",
  "coverImage": "http://localhost:5000/uploads/images/cover.jpg"
}
```

## Development

### Backend Development
- The server uses `nodemon` for auto-restart during development
- API routes are organized by resource type
- Authentication middleware protects sensitive routes

### Frontend Development
- React components are organized by feature
- Context API manages global state (auth, player)
- Responsive design with CSS custom properties

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure MongoDB connection string
4. Set up proper CORS origins
5. Use a process manager like PM2

### Frontend
1. Build the production bundle:
```bash
npm run build
```
2. Serve the `dist` folder with a web server (nginx, Apache, etc.)
3. Configure API proxy or use environment variables for API URL

## JioSaavn Integration

The app includes integration with the JioSaavn API for downloading high-quality songs. See `JIOSAAVN_SETUP.md` for complete setup and usage instructions.

**Quick Start:**
1. Start the JioSaavn API server (see JIOSAAVN_SETUP.md)
2. Configure `JIOSAAVN_API_URL` in backend `.env`
3. Use the "Download" tab in "Your Library" to search and download songs

## Future Enhancements

- [ ] Audio file upload functionality
- [ ] User profile customization
- [ ] Social features (follow users, share playlists)
- [ ] Advanced search filters
- [ ] Music recommendations
- [ ] Offline playback support
- [ ] Lyrics display
- [ ] Equalizer settings
- [ ] Playback history
- [ ] Radio/Shuffle mode improvements

## License

This project is created for educational purposes.

## Contributing

This is a project for learning and portfolio purposes. Feel free to fork and modify for your own use.

## Support

For issues or questions, please check the code comments or create an issue in the repository.
