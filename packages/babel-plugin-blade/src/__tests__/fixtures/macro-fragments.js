import { Connect, query } from 'urql';
import { createQuery, createFragment } from 'sdlkj.macro';

const movieFragment = createFragment('Movie');
const Movie = ({ data }) => {
  let result = movieFragment(data);
  let movie = result.movie;
  return (
    <div className="movie">
      {loaded === false ? (
        <p>Loading</p>
      ) : (
        <div>
          <h2>{movie.test.title}</h2>
          <p>{movie.test.chimp.field}</p>
          <p>{movie.test.chimp.jank}</p>
          <p>{movie.test.chimp.doop}</p>
          <p>{movie.foo}</p>
          <button onClick={onClose}>Close</button>
        </div>
      )}
    </div>
  );
};

Movie.fragment = movieFragment;

const pageQuery = createQuery(); // create a top-level query
const App = () => (
  // rendering Movie automatically composes `Movie.fragment` into the query.
  <Connect
    query={query(pageQuery)}
    children={({ loaded, data }) => {
      let result = pageQuery(data);
      return <Movie data={result.movie(null, Movie.fragment)} />;
    }}
  />
);
