const {BladeData, RazorData} = require('../dataStructures')

function compile({stringAccumulator, litAccumulator}) {
  let str = ''
  for (var i = 0; i < stringAccumulator.length; i++) {
    str += stringAccumulator[i] || ''
    if (litAccumulator[i]) str += litAccumulator[i]
  }
  return str
}

test('can create and print a basic query', () => {
  const razor = new RazorData({type: 'query'})
  razor.add({name: 'foo'})
  expect(razor.get('foo')._children).toEqual([])
  const fooChild = razor.get('foo')
  fooChild.add({name: 'bar'})
  expect(razor.get('foo').get('bar')._children).toEqual([])
  const expected = `
query {
  foo {
    bar
  }
}`
  const temp = razor.print()
  expect(compile(temp)).toEqual(expected)
})

test('can create basic query twice and still only print one', () => {
  const razor = new RazorData({type: 'query'})
  razor.add({name: 'foo'})
  const fooChild = razor.get('foo')
  fooChild.add({name: 'bar'})
  razor.add({name: 'foo'}) // second time
  const expected = `
query {
  foo {
    bar
  }
}`
  expect(compile(razor.print())).toEqual(expected)
})

test('can create and print a query with args', () => {
  const razor = new RazorData({
    type: 'query',
    name: 'Movie',
    args: ['$id: String'],
  })
  razor.add({name: 'foo', args: ['id: $id']})
  expect(razor.get('foo')._children).toEqual([])
  const fooChild = razor.get('foo')
  fooChild.add({name: 'bar'})
  expect(razor.get('foo').get('bar')._children).toEqual([])
  const expected = `
query Movie($id: String){
  foo_5b2e: foo(id: $id) {
    bar
  }
}`
  const temp = razor.print()
  // console.log({ temp });
  expect(compile(temp)).toEqual(expected)
})

test('can create and print a query with aliases', () => {
  const razor = new RazorData({type: 'query', name: 'Movie'})
  const fooChild = razor.add({name: 'foo', args: ['id: 1']})
  fooChild.add({name: 'bar'})
  const fooChild2 = razor.add({name: 'foo', args: ['id: 2']})
  fooChild2.add({name: 'dee'})
  const expected = `
query Movie{
  foo_0dbc: foo(id: 1) {
    bar
  }
  foo_09fb: foo(id: 2) {
    dee
  }
}`
  expect(compile(razor.print())).toEqual(expected)
})

test('can create and print a basic fragment', () => {
  const razor = new RazorData({
    type: 'fragment',
    fragmentType: 'Movie',
    name: 'MovieQuery',
  })
  razor.add({name: 'foo'})
  expect(razor.get('foo')._children).toEqual([])
  const fooChild = razor.get('foo')
  fooChild.add({name: 'bar'})
  expect(razor.get('foo').get('bar')._children).toEqual([])
  const expected = `
fragment MovieQuery on Movie{
  foo {
    bar
  }
}`
  expect(compile(razor.print())).toEqual(expected)
})

test('can create and print a basic query and a fragment', () => {
  const razor = new RazorData({type: 'query'})
  razor.add({name: 'foo'})
  const fooChild = razor.get('foo')
  const frag = new RazorData({
    type: 'fragment',
    fragmentType: 'Movie',
    name: 'MovieFragment',
  })
  frag.add({name: 'foo'})
  const fragChild = frag.get('foo')
  fragChild.add({name: 'bar'})
  fooChild.add({name: 'bar', fragments: [frag]})
  const expected = `
query {
  foo {
    bar {
      ...MovieFragment
    }
  }
}
fragment MovieFragment on Movie{
  foo {
    bar
  }
}`
  expect(compile(razor.print())).toEqual(expected)
})
