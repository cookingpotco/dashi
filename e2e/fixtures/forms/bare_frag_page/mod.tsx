import { group } from "dashi";
import { FragPage } from "../frag_page.tsx";

export const bareFragPage = group("/bare-frag-page", ({ route }) => ({
  routes: [route("/", { GET: FragPage })],
}));
