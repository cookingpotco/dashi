import { group } from "dashi";
import { FragPage } from "../frag_page.tsx";

export const fragPage = group("/frag-page", ({ route }) => ({
  routes: [route("/", { GET: FragPage })],
}));
