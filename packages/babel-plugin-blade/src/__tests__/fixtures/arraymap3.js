import {Connect, query} from 'urql'

const movieQuery = createQuery()
const Movie = ({id, onClose}) => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({data}) => {
        const DATA = movieQuery(data)
        const {actors} = DATA.movie
        return (
          <ul>
            {actors.map(({name}) => {
              return <li>{name}</li>
            })}
          </ul>
        )
      }}
    />
  </div>
)
