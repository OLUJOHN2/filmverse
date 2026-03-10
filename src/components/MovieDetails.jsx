import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieDetails = () => {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [videoKey, setVideoKey] = useState(null);

  const fetchMovieDetails = async () => {
    try {
      const endpoint = `https://api.themoviedb.org/3/movie/${id}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) throw new Error("Failed to fetch movie details");

      const data = await response.json();

      setMovie(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchTrailer = async () => {
    try {
      const endpoint = `https://api.themoviedb.org/3/movie/${id}/videos`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) throw new Error("Failed to fetch trailer");

      const data = await response.json();

      const trailer = data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube",
      );

      if (trailer) {
        setVideoKey(trailer.key);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMovieDetails();
    fetchTrailer();
  }, [id]);

  if (!movie) return <p className="text-white p-10">Loading movie...</p>;

  return (
    <div className="text-white p-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

      <p className="mb-4 text-gray-300">{movie.overview}</p>

      <p className="mb-2">
        ⭐ Rating:{" "}
        {movie.vote_average
          ? (Math.ceil(movie.vote_average * 10) / 10).toFixed(1)
          : "N/A"}
      </p>

      <p className="mb-6">📅 Release Date: {movie.release_date}</p>

      {videoKey ? (
        <iframe
          width="100%"
          height="450"
          src={`https://www.youtube.com/embed/${videoKey}`}
          title="Movie Trailer"
          allowFullScreen
        ></iframe>
      ) : (
        <p>Trailer not available</p>
      )}
    </div>
  );
};

export default MovieDetails;
