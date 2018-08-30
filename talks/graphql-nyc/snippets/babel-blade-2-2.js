import { Connect, query } from "urql";
import { createQuery } from "blade.macro"; // if you are using as a babel macro

const movieQuery = createQuery();
const Movie = ({ movieCount }) => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        const film = DATA.movie(`limit: ${movieCount}`); // dynamic
        const nestedQuery = film.schedule("schedule: true");
        return (
          <div>
            <Films data={film.titles} />
            <Schedule data={nestedQuery.data} />
          </div>
        );
      }}
    />
  </div>
);

//      ↓ ↓ ↓ ↓ ↓ ↓

import { Connect, query } from "urql";

const Movie = ({ movieCount }) => (
  <div>
    <Connect
      query={query(`
query movieQuery{
  movie_19e8: movie(limit: ${movieCount}) {
    schedule_7d17: schedule(schedule: true) {
      data
    }
    titles
  }
}`)}
      children={({ data }) => {
        const DATA = data;
        const film = DATA.movie_19e8;
        const nestedQuery = film.schedule_7d17;
        return (
          <div>
            <Films data={film.titles} />
            <Schedule data={nestedQuery.data} />
          </div>
        );
      }}
    />
  </div>
);
