const {BladeData, RazorData} = require('../dataStructures')

test('can create a query', () => {
  const razor = new RazorData({type: 'query'})
  razor.add('foo', {})
  expect(razor.get('foo')._children).toBeNull()
  const fooChild = razor.get('foo')
  fooChild.add('bar', {})
  expect(razor.get('foo').get('bar')._children).toBeNull()
  console.log(razor.print())
})
