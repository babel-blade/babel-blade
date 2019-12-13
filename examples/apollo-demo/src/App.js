import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

// src/App.js
import ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";
import { ApolloProvider, Query } from "react-apollo";
import { createQuery } from "blade.macro";

const client = new ApolloClient({
  uri: "/.netlify/functions/graphql"
});

const dogQuery = createQuery();
// Replace the previous LambdaDemo with the code below:
const LambdaDemo = () => (
  <ApolloProvider client={client}>
    <Query query={gql(dogQuery)}>
      {({ data }) => {
        console.log("dogQuery", dogQuery);
        const DATA = dogQuery(data); // creates a blade
        return (
          <div>
            A greeting from the server: {DATA.hello}
            <br />
            <img alt="dog" src={DATA.dogPhotoUrl} />
          </div>
        );
      }}
    </Query>
  </ApolloProvider>
);

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        <LambdaDemo />
      </div>
    );
  }
}

export default App;
