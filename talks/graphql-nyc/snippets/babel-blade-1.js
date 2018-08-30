import { Connect, query } from "urql";
import { createQuery } from "blade.macro"; // if you are using as a babel macro

const movieQuery = createQuery();
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data); // key step
        return (
          <div>
            <h2>{DATA.movie.title}</h2>
            <p>{DATA.movie.schedule}</p>
            <p>{DATA.theaters}</p>
          </div>
        );
      }}
    />
  </div>
);

// 👇👇👇

import { Connect, query } from "urql";

const Movie = () => (
  <div>
    <Connect
      query={query(`
query movieQuery{
  movie {
    title
    schedule
  }
  theaters
}`)}
      children={({ data }) => {
        const DATA = data;
        return (
          <div>
            <h2>{DATA.movie.title}</h2>
            <p>{DATA.movie.schedule}</p>
            <p>{DATA.theaters}</p>
          </div>
        );
      }}
    />
  </div>
);
