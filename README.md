# THIS IS STILL A WORK IN PROGRESS.

# Babel-Blade

this babel plugin/macro helps to generate graphql query strings inline and solves the double declaration problem

# brief history

- react-blade: https://github.com/sw-yx/react-blade
- first babelprototype: https://twitter.com/swyx/status/1015455535041261569
- adding fragments: https://twitter.com/devongovett/status/1015660769508130817
- first rewrite with datastructures: http://astexplorer.net/#/gist/4b72d63ecd01237e179c102f6df9c2b4/f2eec3f26b242f9ff025d9951121fb43bfdbf133
- rewrote parser, added destructuring and arguments https://twitter.com/swyx/status/1016566204973113345
- rewrote graphql compiler, added argument hashing/auto aliases https://twitter.com/swyx/status/1016865089251696642
- split it out to helpers.js http://astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/b7025205ada19f5ff939047f5dc452430ea9d586 and still trying to get fragments to work

# boilerplate

This monorepo was bootstrapped from [babel-plugin-macro-boilerplate](https://github.com/sw-yx/babel-plugin-macro-boilerplate). Check it otu if you want to make one!

**if you spot something that could be a better practice, PLEASE open an issue or [tell me I'm wrong!](https://twitter.com/swyx)**
