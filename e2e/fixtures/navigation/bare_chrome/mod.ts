import { group } from "dashi";
import { BareLayout } from "../bare_layout.tsx";
import { bare } from "../bare/mod.tsx";
import type { AppState } from "../state.ts";

export const bareChrome = group<AppState>(() => ({
  layouts: [BareLayout],
  routes: [bare],
}));
