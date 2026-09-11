import { group } from "dashi";
import { BareLayout } from "../bare_layout.tsx";
import { Bare, post } from "../bare.tsx";
import { BarePatch, patchWrite } from "../bare_patch.tsx";
import { SlotPage as BareSlotPage } from "../slot_page/mod.tsx";

export const bareChrome = group(({ route }) => ({
  layouts: [BareLayout],
  routes: [
    route("/bare-slot-page", { GET: BareSlotPage }),
    route("/bare-patch", { GET: BarePatch, POST: patchWrite }),
    route("/bare", { GET: Bare, POST: post }),
  ],
}));
