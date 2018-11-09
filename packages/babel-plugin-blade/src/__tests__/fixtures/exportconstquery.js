export const pageQuery = createQuery()

const App = data => {
  const DATA = pageQuery(data)
  const movie = DATA.movie
}
