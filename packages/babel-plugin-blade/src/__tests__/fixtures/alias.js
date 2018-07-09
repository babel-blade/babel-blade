import {Connect, query} from 'urql'

const movieQuery = createQuery()
const Movie = ({id, onClose}) => (
  <div>
    <Connect
      query={query(movieQuery, {id: id})} // watch the query ABOVE!
      children={({data}) => {
        const DATA = movieQuery(data)
        const movieAlias = DATA.movie
        const filmAlias = DATA.movie
        return (
          <div>
            <h2>{movieAlias.gorilla}</h2>
            <p>{filmAlias.monkey}</p>
            <p>{DATA.chimp}</p>
          </div>
        )
      }}
    />
  </div>
)
