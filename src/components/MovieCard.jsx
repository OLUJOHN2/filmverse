import { Link } from "react-router-dom";

const MovieCard = ({ movie, linkTo }) => {
  const {
    id,
    title,
    vote_average,
    poster_path,
    release_date,
    original_language,
    media_type,
  } = movie;

  const destination =
    linkTo || (media_type === "tv" ? `/tv/${id}` : `/movie/${id}`);

  return (
    <Link to={destination}>
      <div className="movie-card">
        <img
          src={
            poster_path
              ? `https://image.tmdb.org/t/p/w500/${poster_path}`
              : "/no-movie.png"
          }
          alt={title}
        />

        {media_type === "tv" && (
          <span className="inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/30">
            TV Series
          </span>
        )}

        <div className="mt-2">
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
