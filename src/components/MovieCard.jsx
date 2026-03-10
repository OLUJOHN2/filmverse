import { Link } from "react-router-dom";

const MovieCard = ({ movie }) => {
  const {
    id,
    title,
    vote_average,
    poster_path,
    release_date,
    original_language,
  } = movie;

  return (
    <Link to={`/movie/${id}`}>
      <div className="movie-card">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "/no-movie.png"
          }
          alt={title}
        />

        <div className="mt-4">
          <h3>{title}</h3>
        </div>

        <div className="rating flex-1">
          <img src="/star.svg" alt="Star Icon" />

          <p>
            {vote_average
              ? (Math.ceil(vote_average * 10) / 10).toFixed(1)
              : "N/A"}
          </p>

          <span className="text-white">•</span>

          <p className="lang text-white">
            {original_language
              ? original_language.charAt(0).toUpperCase() +
                original_language.slice(1)
              : "N/A"}
          </p>

          <span className="text-white">•</span>

          <p className="year text-white">
            {release_date ? release_date.split("-")[0] : "N/A"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
