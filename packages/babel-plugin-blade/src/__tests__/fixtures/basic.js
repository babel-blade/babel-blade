import {Connect, query} from 'urql'

const movieQuery = createQuery() // doesnt take arguments for now
const Movie = ({id, onClose}) => (
  <div>
    <Connect
      query={query(movieQuery, {id: id})} // razor transpiles into a query string
      children={({data}) => {
        const DATA = movieQuery(data) // razor(foobar) initializes DATA as a blade, names query as DATA
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
