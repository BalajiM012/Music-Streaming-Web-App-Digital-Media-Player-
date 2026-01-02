import React, { useState, useEffect, Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PlayerProvider } from "./context/PlayerContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import "./App.css";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const Library = lazy(() => import("./pages/Library"));
const Music = lazy(() => import("./pages/Music"));
const Podcasts = lazy(() => import("./pages/Podcasts"));
const PodcastDetail = lazy(() => import("./pages/PodcastDetail"));
const PlaylistDetail = lazy(() => import("./pages/PlaylistDetail"));
const RecentlyPlayed = lazy(() => import("./pages/RecentlyPlayed"));
const AdminUpload = lazy(() => import("./pages/AdminUpload"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <PlayerProvider>
          <Router>
            <div className="app">
              {isAuthenticated ? (
                <>
                  <Navbar />
                  <div className="app-body">
                    <Sidebar />
                    <main className="main-content">
                      <Suspense
                        fallback={<Loader fullScreen text="Loading page..." />}
                      >
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/search" element={<Search />} />
                          <Route path="/library" element={<Library />} />
                          <Route path="/music" element={<Music />} />
                          <Route path="/podcasts" element={<Podcasts />} />
                          <Route
                            path="/podcast/:id"
                            element={<PodcastDetail />}
                          />
                          <Route
                            path="/playlist/:id"
                            element={<PlaylistDetail />}
                          />
                          <Route
                            path="/recently-played"
                            element={<RecentlyPlayed />}
                          />
                          <Route
                            path="/admin/upload"
                            element={<AdminUpload />}
                          />
                          <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                      </Suspense>
                    </main>
                  </div>
                  <Player />
                </>
              ) : (
                <Suspense fallback={<Loader fullScreen text="Loading..." />}>
                  <Routes>
                    <Route
                      path="/login"
                      element={
                        <Login setIsAuthenticated={setIsAuthenticated} />
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <Register setIsAuthenticated={setIsAuthenticated} />
                      }
                    />
                    <Route path="*" element={<Navigate to="/login" />} />
                  </Routes>
                </Suspense>
              )}
            </div>
          </Router>
        </PlayerProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
