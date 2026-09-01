import { group } from "dashi";
import { BareLayout } from "../bare_layout.tsx";
import { Bare, post } from "../bare.tsx";
import { FragPage as BareFragPage } from "../bare_frag_page.tsx";

export const bareChrome = group(({ route }) => ({
  layouts: [BareLayout],
  routes: [
    route("/bare-frag-page", { GET: BareFragPage }),
    route("/bare", { GET: Bare, POST: post }),
  ],
}));
