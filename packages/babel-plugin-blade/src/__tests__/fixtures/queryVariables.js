import {Connect, query} from 'urql'

const movieID = 12
const movieQuery = createQuery(`$movieID: ${movieID}`)
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({data}) => {
        const DATA = movieQuery(data)
        return (
          <div>
            <h2>{DATA.movie('id: movieID')}</h2>
            <p>{DATA.movie.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        )
      }}
    />
  </div>
)
