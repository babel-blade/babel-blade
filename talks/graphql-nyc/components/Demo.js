import React, { Timeout, Fragment } from "react";
import ReactDOM from "react-dom";
import styled, { keyframes } from "react-emotion";

export { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
export ApolloClient from "apollo-boost";
import { gql } from "apollo-boost";

import { Autocomplete } from "./Autocomplete";
import { Loading } from "./Loading";

export const GET_DOG_LIST = gql`
  {
    dogs {
      id
      breed
    }
  }
`;

export const Search = ({ onDogSelected }) => (
  <Query query={GET_DOG_LIST}>
    {({ data, loading }) => {
      if (loading) return <Loading />;
      return <Autocomplete items={data.dogs} onDogSelected={onDogSelected} />;
    }}
  </Query>
);

export const GET_DOG_PHOTO = gql`
  query getDogPhoto($breed: String) {
    dog(breed: $breed) {
      id
      displayImage
    }
  }
`;

export const Photo = ({ breed }) => (
  <Query query={GET_DOG_PHOTO} variables={breed && { breed }}>
    {({ data, loading }) => {
      if (loading) return <Loading />;
      return <Image src={data.dog.displayImage} />;
    }}
  </Query>
);

export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Image = styled("img")({
  animation: `${fadeIn} 1s ease`,
  height: "400px",
  width: "400px",
  marginBottom: "40px"
});

export const Header = styled("h1")({
  font: "600 40px system-ui"
});

export const Wrapper = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "pink",
  padding: 50,
  height: "100%"
});

export class DogOfTheDay extends React.Component {
  state = { selectedDog: null };
  onDogSelected = selectedDog => {
    this.setState({ selectedDog });
  };
  render = () => {
    return (
      <Wrapper>
        {/* <Header>Dog of the Day! 🐶</Header> */}
        {/* <Fragment> */}
        <Search onDogSelected={this.onDogSelected} />
        <Photo breed={this.state.selectedDog} />
        {/* </Fragment> */}
      </Wrapper>
    );
  };
}

export function App() {
  return (
    <ApolloProvider
      client={
        new ApolloClient({
          uri: "https://dog-suspense-demo.glitch.me/graphql"
        })
      }
    >
      <DogOfTheDay />
    </ApolloProvider>
  );
}

// ReactDOM.render(<App />, document.getElementById("root"));
