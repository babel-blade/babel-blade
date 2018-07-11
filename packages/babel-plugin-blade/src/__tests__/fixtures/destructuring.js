import {Connect, query} from 'urql'

const movieQuery = createQuery('$id: id')
const Movie = ({id, onClose}) => (
  <div>
    <Connect
      query={query(movieQuery, {id: id})}
      children={({data}) => {
        const DATA = movieQuery(data)
        const {actors} = DATA.movie('id: 234').credits
        return (
          <div>
            <h2>{actors.leading}</h2>
            <h2>{actors.supporting}</h2>
          </div>
        )
      }}
    />
  </div>
)
