import styled from "react-emotion";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";

export const SideBySideProvider = styled(LiveProvider)({
  display: "flex"
});
export const StyledEditor = styled(LiveEditor)({
  overflow: "scroll"
});
