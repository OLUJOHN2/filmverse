import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieDetails from "./components/MovieDetails";
import TVDetails from "./components/TVDetails";
import { useDebounce } from "react-use";
import Footer from "./components/Footer.jsx";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  // "movie" | "tv"
  const [activeTab, setActiveTab] = useState("movie");

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchContent = async (query = "", type = "movie") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      let endpoint;
      if (query) {
        endpoint = `${API_BASE_URL}/search/${type}?query=${encodeURIComponent(query)}`;
      } else {
        endpoint =
          type === "movie"
            ? `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`
            : `${API_BASE_URL}/discover/tv?sort_by=popularity.desc`;
      }

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch content");

      const data = await response.json();
      // Normalize TV shows to have a `title` and `release_date` for MovieCard compatibility
      const results = (data.results || []).map((item) =>
        type === "tv"
          ? {
              ...item,
              title: item.name,
              release_date: item.first_air_date,
              media_type: "tv",
            }
          : { ...item, media_type: "movie" },
      );
      setMovieList(results);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error fetching content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingMovies = async () => {
    try {
      const endpoint = `${API_BASE_URL}/trending/movie/week`;
      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch trending movies");
      const data = await response.json();
      setTrendingMovies(data.results || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchContent(debouncedSearchTerm, activeTab);
  }, [debouncedSearchTerm, activeTab]);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  // When tab changes, reset search
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <main>
            <div className="pattern" />
            <div className="wrapper">
              <header>
                <img
                  src="/reallogo.png"
                  alt="FilmVerse Logo"
                  className="w-40 mx-auto mb-6"
                />
                <img src="./hero.png" alt="Hero Banner" />
                <h1>
                  Find <span className="text-gradient">Movies & Shows</span>{" "}
                  You'll Enjoy Without the Hassle
                </h1>
                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
              </header>

              {trendingMovies.length > 0 && (
                <section className="trending">
                  <h2>Trending Movies</h2>
                  <ul className="trending-grid">
                    {trendingMovies.map((movie, index) => (
                      <li key={movie.id} className="trending-card">
                        <Link to={`/movie/${movie.id}`} className="block">
                          <p className="movie-rank">{index + 1}</p>
                          <img
                            src={
                              movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                                : "/no-movie.png"
                            }
                            alt={movie.title}
                            className="movie-poster"
                          />
                          <p className="movie-title">{movie.title}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="all-movies">
                {/* Movie / TV Tabs */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                  <h2 className="mb-0">
                    {activeTab === "movie" ? "Movies" : "TV Shows"}
                  </h2>
                  <div className="flex gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
                    <button
                      onClick={() => handleTabChange("movie")}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "movie"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-light-200 hover:text-white"
                      }`}
                    >
                      🎬 Movies
                    </button>
                    <button
                      onClick={() => handleTabChange("tv")}
                      className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "tv"
                          ? "bg-purple-600 text-white shadow-md"
                          : "text-light-200 hover:text-white"
                      }`}
                    >
                      📺 TV Shows
                    </button>
                  </div>
                </div>

                {isLoading ? (
                  <Spinner />
                ) : errorMessage ? (
                  <p className="text-red-500">{errorMessage}</p>
                ) : (
                  <ul className="movie-list">
                    {movieList.map((item) => (
                      <MovieCard
                        key={item.id}
                        movie={item}
                        linkTo={
                          item.media_type === "tv"
                            ? `/tv/${item.id}`
                            : `/movie/${item.id}`
                        }
                      />
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <Footer />
          </main>
        }
      />

      <Route path="/movie/:id" element={<MovieDetails />} />
      <Route path="/tv/:id" element={<TVDetails />} />
    </Routes>
  );
};

export default App;
