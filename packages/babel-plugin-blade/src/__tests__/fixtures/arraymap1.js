import {Connect, query} from 'urql'

const movieQuery = createQuery()
const Movie = ({id, onClose}) => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({data}) => {
        const DATA = movieQuery(data)
        const {actors} = DATA.movie
        return <ul>{actors.map(actor => <li>{actor.name}</li>)}</ul>
      }}
    />
  </div>
)
