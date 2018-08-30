import { Connect, query } from "urql";
import { createQuery } from "blade.macro"; // if you are using as a babel macro

const movieID = 12;
const movieQuery = createQuery(`$movieID: ${movieID}`); // query variable
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        const movie = DATA.movie("id: movieID"); // echoed here
        return (
          <div>
            <p>{movie.title}</p>
            <p>{DATA.theaters}</p>
          </div>
        );
      }}
    />
  </div>
);

//      ↓ ↓ ↓ ↓ ↓ ↓

import { Connect, query } from "urql";

const movieID = 12;

const Movie = () => (
  <div>
    <Connect
      query={query(`
query movieQuery(${`$movieID: ${movieID}`}){
  movie_3d71: movie(id: movieID) {
    title
  }
  theaters
}`)}
      children={({ data }) => {
        const DATA = data;
        const movie = DATA.movie_3d71;
        return (
          <div>
            <p>{movie.title}</p>
            <p>{DATA.theaters}</p>
          </div>
        );
      }}
    />
  </div>
);
