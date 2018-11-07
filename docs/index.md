---
id: index
title: What is Babel-Blade?
---

`babel-blade` is a babel plugin (or [macro](https://github.com/kentcdodds/babel-plugin-macros)) that helps to **generate graphql query strings inline** and solves **[the double declaration problem](declarationdeclaration)** in clientside GraphQL.

## Try it out on ASTExplorer or Babel REPL

The quickest, zero-install way to try it out is on [astexplorer](http://astexplorer.net/#/gist/01983f61e310f1eaf6b12a221556a937/7e9ae4d3b406ed94d92f6931c0474f964e1ae990). If you like it, head over to our **Getting Started** docs to see how to install the babel plugin in your app.

## See 7 minute introductory video

[![babel blade walkthrough on youtube](https://user-images.githubusercontent.com/6764957/48116756-ef34a800-e21b-11e8-9d4f-049362c25b23.gif)](https://www.youtube.com/watch?v=z9wKcRjNqlw)

Here's [a longer 25 minute talk at GraphQLNYC](https://youtu.be/7OHXz7vXC0g) going through more of the API and the motivations behind what `babel-blade` is.

## Official Emoji

It is the ⛸️. Basically when I explained this idea to coworkers they said "oh it's just **inline** GraphQL". My boss at the time liked inline skating, which is commonly known as Roller Blading, and so the name stuck.

## Internal stucture

Here is a chart of how the package is set up:

![test](/img/dependencygraph.svg)
