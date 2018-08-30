import { Connect, query } from "urql";
import { createQuery } from "blade.macro"; // if you are using as a babel macro

const movieQuery = createQuery();
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        const film = DATA.movie("limit: 5");
        const nestedQuery = film.schedule("@sort", "id: 23", "@ping"); // like this
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
  movie_27f6: movie(limit: 5) {
    schedule_1c35: schedule(id: 23) @sort @ping {
      data
    }
    titles
  }
}`)}
      children={({ data }) => {
        const DATA = data;
        const film = DATA.movie_27f6;
        const nestedQuery = film.schedule_1c35;
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
