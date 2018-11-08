import {Connect, query} from 'urql'

const movieQuery = createQuery('$id: id')
const Movie = ({id, onClose}) => (
  <div>
    <Connect
      query={query(movieQuery, {id})}
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
