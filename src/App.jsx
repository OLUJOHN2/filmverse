import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom"; // <-- add Link here
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieDetails from "./components/MovieDetails"; // <-- usually MovieDetails goes in pages
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

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "") => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);
      if (!response.ok) throw new Error("Failed to fetch movies");

      const data = await response.json();
      setMovieList(data.results || []);
    } catch (error) {
      console.error(error);
      setErrorMessage("Error fetching movies. Please try again later.");
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
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

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
                  Find <span className="text-gradient">Movies</span> You'll
                  Enjoy Without the Hassle
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
                <h2>All Movies</h2>
                {isLoading ? (
                  <Spinner />
                ) : errorMessage ? (
                  <p className="text-red-500">{errorMessage}</p>
                ) : (
                  <ul className="movie-list">
                    {movieList.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
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
    </Routes>
  );
};

export default App;
