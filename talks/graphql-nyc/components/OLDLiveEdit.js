import React from "react";
import styled, { css } from "styled-components";
import * as polished from "polished";
// import { foreground, red, lightGrey } from "../utils/colors";
export const background = "#282a36";
export const foreground = "#f8f8f2";
export const red = "#ff5555";

export const blue = polished.lighten(0.1, "#6272a4");
export const lightGrey = polished.darken(0.05, "#282a36");

import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

import {
  Header,
  Wrapper,
  Photo,
  Search,
  DogOfTheDay,
  ApolloProvider,
  ApolloClient
} from "../components/Demo";
import { Autocomplete, Input, Downshift } from "../components/Autocomplete";

const StyledProvider = styled(LiveProvider)`
  border-radius: ${polished.rem(3)};
  box-shadow: 1px 1px 20px rgba(20, 20, 20, 0.27);
  overflow: hidden;
  margin-bottom: ${polished.rem(100)};
  width: 90vw;
`;

const LiveWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const column = css`
  flex-basis: 50%;
  width: 50%;
  max-width: 50%;
  @media (max-width: 600px) {
    flex-basis: auto;
    width: 100%;
    max-width: 100%;
  }
`;

const StyledEditor = styled(LiveEditor)`
  font-family: "Source Code Pro", monospace;
  font-size: ${polished.rem(14)};
  height: "100%";
  text-align: initial;
  overflow: scroll;
  ${column};
`;

const StyledPreview = styled(LivePreview)`
  position: relative;
  padding: 0.5rem;
  background: white;
  color: black;
  height: auto;
  overflow: hidden;
  ${column};
`;

const StyledError = styled(LiveError)`
  display: block;
  padding: ${polished.rem(8)};
  background: ${red};
  color: ${foreground};
`;

const LiveEdit = ({ code }) => (
  <StyledProvider
    code={code}
    noInline={true}
    scope={{
      Header,
      Wrapper,
      Photo,
      Search,
      ApolloProvider,
      ApolloClient,
      Autocomplete,
      Input,
      Downshift
    }}
    mountStylesheet={false}
  >
    <LiveWrapper>
      <StyledEditor />
      <StyledPreview />
    </LiveWrapper>

    <StyledError />
  </StyledProvider>
);

export default LiveEdit;
