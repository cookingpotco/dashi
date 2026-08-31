import { group } from "dashi";
import { BareLayout } from "../bare_layout.tsx";
import { Bare } from "../bare.tsx";
import type { AppState } from "../state.ts";

export const bareChrome = group<AppState>(({ route }) => ({
  layouts: [BareLayout],
  routes: [route("/bare", { GET: Bare })],
}));
