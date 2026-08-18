import type { WrapperCtx } from "dashi";
import type { AppState } from "../state.ts";

export default function RootError(
  _ctx: WrapperCtx<AppState>,
  thrown: unknown,
) {
  if (thrown instanceof Error && thrown.message === "error-handler-boom") {
    throw thrown;
  }
  return <p id="root-error">root-error</p>;
}
