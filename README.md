# babel plugin/macro boilerplate

This is a boilerplate monorepo for people writing babel plugins in normal plugin form as well as [`babel-plugin-macros`][babel-plugin-macros] form. Supporting two forms of the plugin can help increase adoption for a variety of user setups, and really isn't too hard once you have the right setup. Which this tries to be.

**if you spot something that could be a better practice, PLEASE open an issue or [tell me I'm wrong!](https://twitter.com/swyx)**

## Prerequisites

You should have read through the [babel handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) and (optionally) the [babel-plugin-macros](https://babeljs.io/blog/2017/09/11/zero-config-with-babel-macros) blogpost.

## Usage

Clone, not fork, this repo. Write your plugin and tests in `babel-plugin-boilerplate`, and then handle the macro portion in `babel-boilerplate.macro`. Rename both of them to whatever your new name is.

When you are done writing and testing, run `lerna publish` from this root level and you should be good to go.