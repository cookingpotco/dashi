import { type Layout } from "dashi";
import type { AppState } from "../state.ts";

const RootLayout: Layout<AppState> = (ctx, children) => {
  return (
    <html>
      <h1>Website Title</h1>
      <p id="pre">{ctx.state.pre}</p>
      {children}
    </html>
  );
};

export default RootLayout;
