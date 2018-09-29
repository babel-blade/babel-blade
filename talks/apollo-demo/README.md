# JAMStack demo of Apollo and babel-blade

this is a demo of how babel blade could work, with apollo engine in a netlify functions "backend". This is set up according to [Apollo's guide](https://blog.apollographql.com/deploy-a-fullstack-apollo-app-with-netlify-45a7dfd51b0b) and upgrading to [react-scripts v2](https://github.com/facebook/create-react-app/issues/5103) for access to babel-macros. The dog CEO api code is taken from [Peggy Rayzis' React Europe talk](https://github.com/peggyrayzis/react-europe-apollo).

we then install blade.macro and use it inside `src/App.js`

---

## Everything below is just further notes from create-react-app-lambda

This project is based on [Create React App Lambda](https://github.com/netlify/create-react-app-lambda). (For more information about it, check the readme.)

## Babel/webpack compilation

All functions are compiled with webpack using the Babel Loader, so you can use modern JavaScript, import npm modules, etc., without any extra setup.

## Local Development

Before developing, clone the repository and run `yarn` from the root of the repo to install all dependencies.

### Run the functions dev server

From inside the project folder, run:

```
yarn start:lambda
```

This will open a local server running at `http://localhost:9000` serving your Lambda functions, updating as you make changes in the `src/lambda` folder.

You can then access your functions directly at `http://localhost:9000/{function_name}`, but to access them with the app, you'll need to start the app dev server.

### Run the app dev server

While the functions server is still running, open a new terminal tab and run:

```
yarn start
```

This will start the normal create-react-app dev server and open your app at `http://localhost:3000`.

Local in-app requests to the relative path `/.netlify/functions/*` will automatically be proxied to the local functions dev server.
