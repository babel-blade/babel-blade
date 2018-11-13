---
id: index
title: What is Babel-Blade?
---

`babel-blade` is a babel plugin (or [macro](https://github.com/kentcdodds/babel-plugin-macros)) that helps to **generate graphql query strings inline** and solves **[the double declaration problem](declarationdeclaration)** in clientside GraphQL.

## Try it out on ASTExplorer or Babel REPL

The quickest, zero-install way to try it out is on either:

- [astexplorer](/astexplorer-basic) (with [fragments](/astexplorer-fragment))
- or the [Babel REPL](https://babeljs.io/repl#?babili=false&browsers=&build=&builtIns=false&spec=false&loose=false&code_lz=JYWwDg9gTgLgBAbzgYQgOzQUwMYwDRwCOArplAJ5wC-cAZlBCHAOTFSEA2zA3AFC_Z0AZ3ggIAN2CYAiqQpwAvHGxRMAQxgy55ABQBKPoLQi4AWQlTFcHQmAATKnsUA-a7zhwAPHeDjn7jy9UDBwYAMCibQUEEjJdMUktOL0qcMDsAAtgDjtVNGibODsNNWonBVcENIijEwARAEEAFQarBKlZOJ1imDU9avTheAQYYBgOTAI1XGghGiVGloA6dswdAAN7AC44ABJbB3X-iIjVGDY0NxOT719_a-vPDIAmZxGxiapPAHoX-4eIghpjBZis1GAdMDoC44FCoEs0GoQJgUgMIj8fH40XADAMqKkIt9_hi7rwDEA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&timeTravel=false&sourceType=module&lineWrap=true&presets=&prettier=true&targets=&version=6.26.0&envVersion=) (go to Plugins on the bottom left, and add `babel-plugin-blade` to get it working)

If you like it, head over to our **Getting Started** docs to see how to install the babel plugin in your app.

## See 7 minute introductory videos

Here is the old (slightly out of date API) [walkthrough on youtube](https://www.youtube.com/watch?v=z9wKcRjNqlw).

Here is the new 7 minute lightning talk at React Boston with the motivation and context of Babel Blade: [https://youtu.be/30wOsJOluA4?t=497](https://youtu.be/30wOsJOluA4?t=497)

Here's [a longer 25 minute talk at GraphQLNYC](https://youtu.be/7OHXz7vXC0g) going through more of the API and the motivations behind what `babel-blade` is.

## Official Emoji

It is the ⛸️. Basically when I explained this idea to coworkers they said "oh it's just **inline** GraphQL". My boss at the time liked inline skating, which is commonly known as Roller Blading, and so the name stuck.

## Internal stucture

Here is a chart of how the package is set up:

![test](/img/dependencygraph.svg)
