import { group } from "dashi";
import type { AppState } from "../state.ts";
import {
  CycleA,
  CycleB,
  Depth1,
  Depth2,
  Depth3,
  Depth4,
  Depth5,
  Depth6,
  DepthEmbed,
  EmbedCycle,
  messageError as messageErrorPage,
  SelfInclude,
} from "../errors.tsx";

export const messageError = group<AppState>(({ route }) => ({
  error: messageErrorPage,
  routes: [
    route("/self-include", { GET: SelfInclude }),
    route("/cycle-a", { GET: CycleA }),
    route("/cycle-b", { GET: CycleB }),
    route("/embed-cycle", { GET: EmbedCycle }),
    route("/depth-embed", { GET: DepthEmbed }),
    route("/d1", { GET: Depth1 }),
    route("/d2", { GET: Depth2 }),
    route("/d3", { GET: Depth3 }),
    route("/d4", { GET: Depth4 }),
    route("/d5", { GET: Depth5 }),
    route("/d6", { GET: Depth6 }),
  ],
}));
