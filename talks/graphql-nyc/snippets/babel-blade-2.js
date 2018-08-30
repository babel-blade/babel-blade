import { Connect, query } from "urql";
import { createQuery } from "blade.macro"; // if you are using as a babel macro

const movieQuery = createQuery();
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        const film = DATA.movie("limit: 5"); // like this
        const nestedQuery = film.schedule("schedule: true"); // or this
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

const Movie = () => (
  <div>
    <Connect
      query={query(`
query movieQuery{
  movie_19e8: movie(limit: 5) {
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
