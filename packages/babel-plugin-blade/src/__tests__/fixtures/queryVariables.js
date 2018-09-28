import {Connect, query} from 'urql'

const movieID = 12
const movieQuery = createQuery(`$movieID: ${movieID}`)
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({data}) => {
        const DATA = movieQuery(data)
        const film = DATA.movie('id: movieID')
        return (
          <div>
            <h2>{film}</h2>
            <p>{film.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        )
      }}
    />
  </div>
)
