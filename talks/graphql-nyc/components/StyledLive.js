import styled from "react-emotion";
import { LiveProvider, LiveEditor, LiveError, LivePreview } from "react-live";
import * as polished from "polished";

export const SideBySideProvider = styled(LiveProvider)({
  display: "flex"
});
export const StyledEditor = styled(LiveEditor)({
  overflow: "scroll"
});
