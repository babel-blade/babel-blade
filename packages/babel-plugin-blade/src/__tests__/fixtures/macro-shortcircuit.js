import {Connect, query} from 'urql'
import {createQuery} from 'blade.macro'

const movieQuery = createQuery()
const foobar = 5
const Movie = () => (
  <div>
    <Connect
      query={query(movieQuery)}
      children={({data}) => {
        const DATA = movieQuery(data)
        const film = DATA.movie(`limit: ${foobar}`)
        const nestedQuery = film.schedule('sort: true')
        const {blinded} = transform(film.details)
        return (
          <div>
            <Films data={film.titles} />
            <Schedule data={nestedQuery.data} />
            {blinded}
          </div>
        )
      }}
    />
  </div>
)
