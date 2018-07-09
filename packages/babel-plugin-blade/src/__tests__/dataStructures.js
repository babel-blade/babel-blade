const {BladeData, RazorData} = require('../dataStructures')

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
  expect(razor.print()).toEqual(expected)
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
  expect(razor.print()).toEqual(expected)
})

test('can create and print a query with args', () => {
  const razor = new RazorData({
    type: 'query',
    name: 'Movie',
    args: '$id: String',
  })
  razor.add({name: 'foo', args: 'id: $id'})
  expect(razor.get('foo')._children).toEqual([])
  const fooChild = razor.get('foo')
  fooChild.add({name: 'bar'})
  expect(razor.get('foo').get('bar')._children).toEqual([])
  const expected = `
query Movie($id: String){
  foo(id: $id) {
    bar
  }
}`
  expect(razor.print()).toEqual(expected)
})

test('can create and print a query with aliases', () => {
  const razor = new RazorData({type: 'query', name: 'Movie'})
  razor.add({name: 'foo', args: 'id: 1', alias: 'foo1'})
  razor.add({name: 'foo', args: 'id: 2', alias: 'foo2'})
  const fooChild = razor.get('foo1')
  fooChild.add({name: 'bar'})
  const expected = `
query Movie{
  foo1: foo(id: 1) {
    bar
  }
  foo2: foo(id: 2)
}`
  expect(razor.print()).toEqual(expected)
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
  expect(razor.print()).toEqual(expected)
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
  expect(razor.print()).toEqual(expected)
})
