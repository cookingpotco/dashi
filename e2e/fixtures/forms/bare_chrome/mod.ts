import { group } from "dashi";
import { BareLayout } from "../bare_layout.tsx";
import { Bare, post } from "../bare.tsx";
import { SlotPage as BareSlotPage } from "../slot_page/mod.tsx";

export const bareChrome = group(({ route }) => ({
  layouts: [BareLayout],
  routes: [
    route("/bare-slot-page", { GET: BareSlotPage }),
    route("/bare", { GET: Bare, POST: post }),
  ],
}));
