import {Connect, query} from 'urql'

const movieQuery = createQuery()
const Movie = ({id, onClose}) => (
  <div>
    <Connect
      query={query(movieQuery, {id: id})} // watch the query ABOVE!
      children={({data}) => {
        const DATA = movieQuery(data)
        const core = DATA
        const film = DATA.movie
        return (
          <div>
            <h2>{core.gorilla}</h2>
            <p>{film.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        )
      }}
    />
  </div>
)
