import {Connect, query} from 'urql'
// import {createQuery} from 'blade.macro'
const pageQuery = createQuery()
const App = () => (
  <Connect
    query={query(pageQuery)}
    children={({data}) => {
      let result = pageQuery(data)
      let actors = result.movie
      return (
        <ul>
          <Movie data={result.movie.title} />
          <Actor data={actors.supporting} />
          <Actor data={actors.leading} />
        </ul>
      )
    }}
  />
)
