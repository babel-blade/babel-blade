import {Connect, query} from 'urql'

const movieQuery = createQuery()
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({data}) => {
        const DATA = movieQuery(data)
        return (
          <div>
            <h2>{DATA.movie.gorilla}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        )
      }}
    />
  </div>
)
