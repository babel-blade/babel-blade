import React from "react";
import styled, { keyframes } from "react-emotion";

const spin = keyframes`
  from {
    transform:rotate(0deg);
  }
  to {
    transform:rotate(360deg);
  }
`;

const SpinningEmoji = styled("p")({
  fontSize: "30px",
  animation: `${spin} 1s ease infinite`
});

export const Loading = () => <SpinningEmoji>🐾</SpinningEmoji>;
