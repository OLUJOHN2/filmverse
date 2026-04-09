import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Footer from "./Footer.jsx";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const STREAMING_BASE_URL =
  "https://jericoder-movie-tv-series-streaming-link-middleware.hf.space";

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const HLSPlayer = ({ src }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.4.10/hls.min.js";
      script.onload = () => {
        if (window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
        }
      };
      document.head.appendChild(script);
    }
  }, [src]);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
      style={{ paddingTop: "56.25%" }}
    >
      <video
        ref={videoRef}
        controls
        autoPlay
        className="absolute inset-0 w-full h-full bg-black"
      />
    </div>
  );
};

const MovieDetails = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [videoKey, setVideoKey] = useState(null);
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [cast, setCast] = useState([]);

  const fetchMovieDetails = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}`,
        API_OPTIONS,
      );
      if (!response.ok) throw new Error("Failed to fetch movie details");
      const data = await response.json();
      setMovie(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrailer = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/videos`,
        API_OPTIONS,
      );
      if (!response.ok) throw new Error("Failed to fetch trailer");
      const data = await response.json();
      const trailer = data.results.find(
        (v) => v.type === "Trailer" && v.site === "YouTube",
      );
      if (trailer) setVideoKey(trailer.key);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCast = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/credits`,
        API_OPTIONS,
      );
      if (!response.ok) throw new Error("Failed to fetch cast");
      const data = await response.json();
      setCast(data.cast?.slice(0, 8) || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleWatchNow = async () => {
    setIsStreamLoading(true);
    setStreamError("");
    setStreamingUrl(null);
    try {
      const response = await fetch(
        `${STREAMING_BASE_URL}/movie/streaming/link/${id}`,
      );

      if (!response.ok) {
        throw new Error(`Streaming API returned status ${response.status}`);
      }

      const text = await response.text();
      const url = text.trim().replace(/^"|"$/g, "");

      if (!url || !url.startsWith("http")) {
        throw new Error("No streaming link returned from API");
      }

      setStreamingUrl(url);
      setIsWatching(true);
    } catch (error) {
      console.error("Watch Now error:", error.message);
      setStreamError(
        "Streaming is currently unavailable for this title. Please try again later.",
      );
    } finally {
      setIsStreamLoading(false);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchTrailer();
    fetchCast();
    setIsWatching(false);
    setStreamingUrl(null);
    setStreamError("");
  }, [id]);

  if (!movie)
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-light-200 text-lg">Loading movie...</p>
        </div>
      </div>
    );

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/no-movie.png";

  const rating = movie.vote_average
    ? (Math.ceil(movie.vote_average * 10) / 10).toFixed(1)
    : "N/A";

  const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";

  const genres = movie.genres?.map((g) => g.name) || [];

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      {/* Backdrop Hero */}
      <div className="relative w-full h-[55vh] overflow-hidden">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={movie.title}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full bg-dark-100" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-transparent to-transparent" />

        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center gap-2 text-light-200 hover:text-white transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          <span className="text-sm font-medium">Back to FilmVerse</span>
        </Link>
      </div>

      {/* Main Content */}
      <main className="flex-grow px-6 sm:px-10 max-w-6xl mx-auto w-full -mt-48 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-44 sm:w-56 rounded-2xl shadow-2xl shadow-black/60 border border-white/10"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end gap-4 flex-1 min-w-0">
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span
                  key={g}
                  className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/30"
                >
                  {g}
                </span>
              ))}
            </div>

            <h1 className="text-left text-3xl sm:text-5xl font-bold leading-tight tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-light-200">
              <span className="flex items-center gap-1">
                <img src="/star.svg" alt="Rating" className="w-4 h-4" />
                <span className="font-bold text-white">{rating}</span>
              </span>
              {year !== "N/A" && <span>📅 {year}</span>}
              {runtime && <span>🕐 {runtime}</span>}
              {movie.original_language && (
                <span className="uppercase bg-white/10 px-2 py-0.5 rounded text-xs font-mono">
                  {movie.original_language}
                </span>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed max-w-2xl line-clamp-4">
              {movie.overview}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 mt-2">
              <button
                onClick={handleWatchNow}
                disabled={isStreamLoading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-500 hover:to-violet-400 transition-all shadow-lg shadow-purple-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isStreamLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Fetching Stream...
                  </>
                ) : (
                  <>
                    <span>▶</span> Watch Now
                  </>
                )}
              </button>

              {videoKey && !isWatching && (
                <button
                  onClick={() => {
                    setIsWatching(false);
                    setStreamingUrl(null);
                    document
                      .getElementById("trailer-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 border border-white/15 transition-all"
                >
                  🎬 Watch Trailer
                </button>
              )}
            </div>

            {streamError && (
              <p className="text-red-400 text-sm mt-1 bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-lg">
                ⚠️ {streamError}
              </p>
            )}
          </div>
        </div>

        {/* Streaming Player */}
        {isWatching && streamingUrl && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Now Playing</h2>
              <button
                onClick={() => {
                  setIsWatching(false);
                  setStreamingUrl(null);
                }}
                className="text-sm text-light-200 hover:text-white transition-colors"
              >
                ✕ Close Player
              </button>
            </div>
            <HLSPlayer src={streamingUrl} />
            <p className="mt-3 text-xs text-gray-500 text-center">
              Having trouble? Try disabling your ad blocker or refreshing the
              page.
            </p>
          </section>
        )}

        {/* Trailer */}
        {videoKey && !isWatching && (
          <section id="trailer-section" className="mt-12">
            <h2 className="text-xl font-bold mb-4">Official Trailer</h2>
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-white/10"
              style={{ paddingTop: "56.25%" }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoKey}`}
                title="Movie Trailer"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-5">Top Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
              {cast.map((member) => (
                <div
                  key={member.id}
                  className="flex flex-col items-center text-center gap-2"
                >
                  <img
                    src={
                      member.profile_path
                        ? `https://image.tmdb.org/t/p/w185${member.profile_path}`
                        : "/no-movie.png"
                    }
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                  />
                  <p className="text-xs text-white font-medium leading-tight line-clamp-2">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {member.character}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Movie Stats */}
        {(movie.budget > 0 || movie.revenue > 0 || movie.status) && (
          <section className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {movie.status && (
              <div className="bg-dark-100 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-white font-semibold text-sm">
                  {movie.status}
                </p>
              </div>
            )}
            {movie.budget > 0 && (
              <div className="bg-dark-100 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Budget</p>
                <p className="text-white font-semibold text-sm">
                  ${movie.budget.toLocaleString()}
                </p>
              </div>
            )}
            {movie.revenue > 0 && (
              <div className="bg-dark-100 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Box Office</p>
                <p className="text-white font-semibold text-sm">
                  ${movie.revenue.toLocaleString()}
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default MovieDetails;
