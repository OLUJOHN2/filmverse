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

const TVDetails = () => {
  const { id } = useParams();

  const [show, setShow] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodeCount, setEpisodeCount] = useState(1);
  const [cast, setCast] = useState([]);
  const [streamingUrl, setStreamingUrl] = useState(null);
  const [isStreamLoading, setIsStreamLoading] = useState(false);
  const [streamError, setStreamError] = useState("");
  const [isWatching, setIsWatching] = useState(false);
  const [videoKey, setVideoKey] = useState(null);

  const fetchShowDetails = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}`,
        API_OPTIONS,
      );
      if (!response.ok) throw new Error("Failed to fetch show details");
      const data = await response.json();
      setShow(data);
      const s1 = data.seasons?.find((s) => s.season_number === 1);
      if (s1) setEpisodeCount(s1.episode_count);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSeasonDetails = async (seasonNum) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNum}`,
        API_OPTIONS,
      );
      if (!response.ok) throw new Error("Failed to fetch season details");
      const data = await response.json();
      setEpisodeCount(data.episodes?.length || 1);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCast = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/credits`,
        API_OPTIONS,
      );
      if (!response.ok) throw new Error("Failed to fetch cast");
      const data = await response.json();
      setCast(data.cast?.slice(0, 8) || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrailer = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/videos`,
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

  const handleSeasonChange = (seasonNum) => {
    setSelectedSeason(seasonNum);
    setSelectedEpisode(1);
    fetchSeasonDetails(seasonNum);
    setIsWatching(false);
    setStreamingUrl(null);
    setStreamError("");
  };

  const handleWatchEpisode = async () => {
    setIsStreamLoading(true);
    setStreamError("");
    setStreamingUrl(null);
    try {
      const url = `${STREAMING_BASE_URL}/series/streaming/link/${id}/S/${selectedSeason}/E/${selectedEpisode}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Streaming API returned status ${response.status}`);
      }

      const text = await response.text();
      const streamUrl = text.trim().replace(/^"|"$/g, "");

      if (!streamUrl || !streamUrl.startsWith("http")) {
        throw new Error("No streaming link returned from API");
      }

      setStreamingUrl(streamUrl);
      setIsWatching(true);
    } catch (error) {
      console.error("Watch Episode error:", error.message);
      setStreamError(
        "Streaming is currently unavailable for this episode. Please try again later.",
      );
    } finally {
      setIsStreamLoading(false);
    }
  };

  useEffect(() => {
    fetchShowDetails();
    fetchCast();
    fetchTrailer();
    setIsWatching(false);
    setStreamingUrl(null);
    setStreamError("");
  }, [id]);

  if (!show)
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-light-200 text-lg">Loading show...</p>
        </div>
      </div>
    );

  const backdropUrl = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : null;

  const posterUrl = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/no-movie.png";

  const rating = show.vote_average
    ? (Math.ceil(show.vote_average * 10) / 10).toFixed(1)
    : "N/A";

  const year = show.first_air_date ? show.first_air_date.split("-")[0] : "N/A";

  const genres = show.genres?.map((g) => g.name) || [];

  const seasons = show.seasons?.filter((s) => s.season_number > 0) || [];

  return (
    <div className="min-h-screen flex flex-col bg-primary text-white">
      {/* Backdrop Hero */}
      <div className="relative w-full h-[55vh] overflow-hidden">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={show.name}
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
              alt={show.name}
              className="w-44 sm:w-56 rounded-2xl shadow-2xl shadow-black/60 border border-white/10"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-end gap-4 flex-1 min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30">
                TV Series
              </span>
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
              {show.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-light-200">
              <span className="flex items-center gap-1">
                <img src="/star.svg" alt="Rating" className="w-4 h-4" />
                <span className="font-bold text-white">{rating}</span>
              </span>
              {year !== "N/A" && <span>📅 {year}</span>}
              {show.number_of_seasons && (
                <span>
                  📺 {show.number_of_seasons} Season
                  {show.number_of_seasons > 1 ? "s" : ""}
                </span>
              )}
              {show.number_of_episodes && (
                <span>🎞 {show.number_of_episodes} Episodes</span>
              )}
            </div>

            <p className="text-gray-300 leading-relaxed max-w-2xl line-clamp-3">
              {show.overview}
            </p>
          </div>
        </div>

        {/* Episode Selector */}
        <section className="mt-10 bg-dark-100 rounded-2xl p-6 border border-white/5">
          <h2 className="text-lg font-bold mb-5 text-white">Select Episode</h2>

          {seasons.length > 0 && (
            <div className="mb-5">
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
                Season
              </p>
              <div className="flex flex-wrap gap-2">
                {seasons.map((s) => (
                  <button
                    key={s.season_number}
                    onClick={() => handleSeasonChange(s.season_number)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedSeason === s.season_number
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                        : "bg-white/10 text-light-200 hover:bg-white/20"
                    }`}
                  >
                    S{s.season_number}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">
              Episode
            </p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
              {Array.from({ length: episodeCount }, (_, i) => i + 1).map(
                (ep) => (
                  <button
                    key={ep}
                    onClick={() => {
                      setSelectedEpisode(ep);
                      setIsWatching(false);
                      setStreamingUrl(null);
                      setStreamError("");
                    }}
                    className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
                      selectedEpisode === ep
                        ? "bg-purple-600 text-white shadow-lg shadow-purple-900/40"
                        : "bg-white/10 text-light-200 hover:bg-white/20"
                    }`}
                  >
                    {ep}
                  </button>
                ),
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleWatchEpisode}
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
                  <span>▶</span> Watch S{selectedSeason} E{selectedEpisode}
                </>
              )}
            </button>

            <p className="text-sm text-light-200">
              Season {selectedSeason}, Episode {selectedEpisode}
            </p>
          </div>

          {streamError && (
            <p className="text-red-400 text-sm mt-3 bg-red-900/20 border border-red-500/30 px-4 py-2 rounded-lg">
              ⚠️ {streamError}
            </p>
          )}
        </section>

        {/* Streaming Player */}
        {isWatching && streamingUrl && (
          <section className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                Now Playing — S{selectedSeason} E{selectedEpisode}
              </h2>
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
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-4">Official Trailer</h2>
            <div
              className="relative w-full rounded-2xl overflow-hidden shadow-xl border border-white/10"
              style={{ paddingTop: "56.25%" }}
            >
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoKey}`}
                title="TV Trailer"
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

        {/* Show Stats */}
        {(show.status || show.type || show.networks?.length > 0) && (
          <section className="mt-12 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {show.status && (
              <div className="bg-dark-100 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="text-white font-semibold text-sm">
                  {show.status}
                </p>
              </div>
            )}
            {show.type && (
              <div className="bg-dark-100 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Type</p>
                <p className="text-white font-semibold text-sm">{show.type}</p>
              </div>
            )}
            {show.networks?.length > 0 && (
              <div className="bg-dark-100 rounded-xl p-4 border border-white/5">
                <p className="text-xs text-gray-400 mb-1">Network</p>
                <p className="text-white font-semibold text-sm">
                  {show.networks[0].name}
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

export default TVDetails;
