import { group } from "dashi";
import { BareLayout } from "../bare_layout.tsx";
import { bare } from "../bare/mod.tsx";
import { bareFragPage } from "../bare_frag_page/mod.tsx";

export const bareChrome = group(() => ({
  layouts: [BareLayout],
  routes: [bareFragPage, bare],
}));
