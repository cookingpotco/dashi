import { group } from "dashi";
import { BareLayout } from "../bare_layout.tsx";
import { Bare, post } from "../bare.tsx";
import { BarePatch, patchWrite } from "../bare_patch.tsx";
import { FragPage as BareFragPage } from "../bare_frag_page.tsx";

export const bareChrome = group(({ route }) => ({
  layouts: [BareLayout],
  routes: [
    route("/bare-frag-page", { GET: BareFragPage }),
    route("/bare-patch", { GET: BarePatch, POST: patchWrite }),
    route("/bare", { GET: Bare, POST: post }),
  ],
}));
