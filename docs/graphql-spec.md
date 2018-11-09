---
id: graphql-spec
title: GraphQL Spec By Example
---

> **obligatory note**: babel-blade is not yet production ready! Please proceed only if you are an early adopter. Feel free to chat with [@swyx](https://twitter.com/swyx) or [check our issues!](https://github.com/sw-yx/babel-blade/issues/)

On this page we show by example how to do every thing in [the GraphQL query spec](https://graphql.org/learn/queries) with `babel-blade`. These are directly tested for in our snapshot tests.

After you have tagged a `data` object with your query created with `createQuery`, it becomes a blade:

```jsx
import { Connect, query } from 'urql';
import { createQuery } from 'blade.macro'; // if you are using as a babel macro

const movieQuery = createQuery(); // create the query
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data); // `DATA` is a blade
        const { schedule } = DATA; // `schedule` is also a blade
        return (
          <div>
            <h2>{schedule.movie}</h2>
          </div>
        );
      }}
    />
  </div>
);
```

## API Note: Exporting queries

As of `v0.1.7` you can now export queries.

Before:

```js
export const pageQuery = createQuery();

const App = data => {
  const DATA = pageQuery(data);
  const movie = DATA.movie;
};
```

After:

```js
export const pageQuery = `
query pageQuery{
  movie
}`;

const App = data => {
  const DATA = data;
  const movie = DATA.movie;
};
```

So you can run your queries (or fragments!) elsewhere!

[Thanks to Jonas](https://github.com/sw-yx/babel-blade/issues/18) for the suggestion!

## API Note: Array methods

<details>
<summary>
<em>
Special note on using Array prototype methods
</em>
</summary>

**Only applies if your GraphQL field names coincide with array prototype method names.**

Blades will propagate through the following array methods:

- map
- every
- filter
- find
- findIndex
- forEach
- reduce
- reduceRight
- some

so this will work:

```js
import { Connect, query } from 'urql';

const movieQuery = createQuery()
const App = () => <Connect query={query(movieQuery)} children={({ data }) => {
  let result = movieQuery(data);
  let {actors} = result.movie;
  return <div>
          {actors.map(actor => (
            <Actor data={actor.supporting} />
            <Actor data={actor.leading} />
          ))}
        </div>;
}} />;
```

For the rest of the Array prototype methods, babel-blade simply "stops tracking" so you will need to stub out the rest of the dependencies with fragments on in a no-op assignment somewhere.

If you do actually have a field called "map" for example, destructure it:

```js
// do this, will be in the GraphQL
const { map } = blade;
// don't do this, won't be captured in the generated graphql
const temp = blade.map; // we won't know if this is an array or an object property
```

</details>

## Fields

After you have tagged a `data` object with your query created with `createQuery`, any property you access (including with destructuring) will be included in the generated GraphQL query.

<details>
<summary>
<b>
Code Example
</b>
</summary>

Before:

```jsx
import { Connect, query } from 'urql';
import { createQuery } from 'blade.macro'; // if you are using as a babel macro

const movieQuery = createQuery();
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data); // key step
        return (
          <div>
            <h2>{DATA.movie.gorilla}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        );
      }}
    />
  </div>
);
```

After:

```jsx
import { Connect, query } from 'urql';

const Movie = () => (
  <div>
    <Connect
      query={query(`
query movieQuery{
  movie {
    gorilla
    monkey
  }
  chimp
}`)}
      children={({ data }) => {
        const DATA = data;
        return (
          <div>
            <h2>{DATA.movie.gorilla}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        );
      }}
    />
  </div>
);
```

</details>

## Arguments

Every blade property can take arguments as though it were a function call - this gets moved to the generated GraphQL.

<details>
<summary>
<b>
Code Example
</b>
</summary>

Before

```jsx
import { Connect, query } from 'urql';
import { createQuery } from 'blade.macro'; // if you are using as a babel macro

const movieQuery = createQuery();
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        const film = DATA.movie('limit: 5'); // like this
        const nestedQuery = film.schedule('schedule: true'); // or this
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
```

After:

```jsx
import { Connect, query } from 'urql';

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
```

</details>

## Aliases

**Done for you!**

Each arguments call gets an autogenerated 4 character hex alias to help distinguish between them. This way you don't have to manually assign aliases for multiple queries on the same fields but with different arguments.

## Fragments

Use the `createFragment` pseudofunction to create the fragment, and then attach it as an argument to any blade property.

<details>
<summary>
<b>
Code Example
</b>
</summary>

Before:

```jsx
import { Connect, query } from 'urql';
import { createQuery, createFragment } from 'blade.macro'; // if you are using as a babel macro

// MovieComponent.js
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
```

This transpiles to:

```jsx
import { Connect, query } from 'urql';
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

${Movie.fragment('Moviefragment')}`)}
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
```

</details>

## Operation Name

All queries are named by whatever variable identifier you assign.

<details>
<summary>
<b>
Code Example
</b>
</summary>

Before

```jsx
import { Connect, query } from 'urql';
import { createQuery } from 'blade.macro'; // if you are using as a babel macro

const movieQuery = createQuery(); // movieQuery becomes the operation name
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        return (
          <div>
            <h2>{DATA.movie.gorilla}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        );
      }}
    />
  </div>
);
```

After:

```jsx
import { Connect, query } from 'urql';

const Movie = () => (
  <div>
    <Connect
      query={query(`
query movieQuery{
  movie {
    gorilla
    monkey
  }
  chimp
}`)}
      children={({ data }) => {
        const DATA = data;
        return (
          <div>
            <h2>{DATA.movie.gorilla}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        );
      }}
    />
  </div>
);
```

</details>

## Variables

Supply variables as a string or template string to your `createQuery` call.

<details>
<summary>
<b>
Code Example
</b>
</summary>

Before:

```jsx
import { Connect, query } from 'urql';
import { createQuery } from 'blade.macro'; // if you are using as a babel macro

const App = ({ movieID }) => {
  const pageQuery = createQuery(`$movieID: ${movieID}`);
  return (
    <Connect
      query={query(pageQuery)}
      children={({ data }) => {
        let result = pageQuery(data);
        const stuff = result.movie('id: $movieID');
        return (
          <ul>
            <div>{stuff.title}</div>
          </ul>
        );
      }}
    />
  );
};
```

After:

```jsx
import { Connect, query } from 'urql';

const App = ({ movieID }) => {
  return (
    <Connect
      query={query(`
query pageQuery(${`$movieID: ${movieID}`}){
  movie_d076: movie(id: $movieID) {
    title
  }
}`)}
      children={({ data }) => {
        let result = data;
        const stuff = result.movie_d076;
        return (
          <ul>
            <div>{stuff.title}</div>
          </ul>
        );
      }}
    />
  );
};
```

</details>

## Directives

You can add directives just like any other argument. You just have to make sure to use '@' as the first character in a template string or string literal.

<details>
<summary>
<b>
Code Example
</b>
</summary>

Before:

```jsx
import { Connect, query } from 'urql';
import { createQuery } from 'blade.macro'; // if you are using as a babel macro

const movieQuery = createQuery();
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({ data }) => {
        const DATA = movieQuery(data);
        const film = DATA.movie('limit: 5');
        const nestedQuery = film.schedule('@sort', 'id: 23', '@ping'); // like this
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
```

After:

```jsx
import { Connect, query } from 'urql';

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
```

</details>

## Mutations

Sorry.. this is not implemented yet. Contact [@swyx](https://twitter.com/swyx) or [file an issue!](https://github.com/sw-yx/babel-blade/issues/new)

## Inline Fragments and Union Types

Sorry.. this is not implemented yet. Contact [@swyx](https://twitter.com/swyx) or [file an issue!](https://github.com/sw-yx/babel-blade/issues/new)
