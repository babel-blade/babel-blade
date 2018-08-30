import { Connect, query } from "urql";
import { createQuery, createFragment } from "blade.macro"; // if you are using as a babel macro

// MovieComponent.js
const movieFragment = createFragment("Movie");
const Movie = ({ data }) => {
  let result = movieFragment(data);
  let movie = result.movie;
  return (
    <div className="movie">
      {loaded === false ? (
        <p>Loading</p>
      ) : (
        <div>
          <h2>{movie.title}</h2>
          <p>{movie.actors.supporting}</p>
          <p>{movie.actors.leading}</p>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

Movie.fragment = movieFragment; // like this

// MoviePage.js
const pageQuery = createQuery(); // create a top-level query
const App = () => (
  <Connect
    query={query(pageQuery)}
    children={({ loaded, data }) => {
      let result = pageQuery(data);
      // rendering Movie while adding
      // `Movie.fragment` into the query.
      // (could be automatic in future)
      return (
        <ul>
          <Movie data={result.movie(Movie.fragment)} />
        </ul>
      );
    }}
  />
);

//      ↓ ↓ ↓ ↓ ↓ ↓

import { Connect, query } from "urql";
const Movie = ({ data }) => {
  let result = data;
  let movie = result.movie;
  return (
    <div className="movie">
      {loaded === false ? (
        <p>Loading</p>
      ) : (
        <div>
          <h2>{movie.title}</h2>
          <p>{movie.actors.supporting}</p>
          <p>{movie.actors.leading}</p>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

Movie.fragment = movieFragment => `
fragment ${movieFragment} on Movie{
  movie {
    title
    actors {
      supporting
      leading
    }
  }
}`;

const App = () => (
  <Connect
    query={query(`
query pageQuery{
  movie {
    ...Moviefragment
  }
}

${Movie.fragment("Moviefragment")}`)}
    children={({ loaded, data }) => {
      let result = data;
      // rendering Movie while adding
      // `Movie.fragment` into the query.
      // (could be automatic in future)
      return (
        <ul>
          <Movie data={result.movie} />
        </ul>
      );
    }}
  />
);
