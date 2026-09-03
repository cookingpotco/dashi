import { group } from "dashi";
import { cors } from "dashi/cors";

export const api = group("/api", ({ route }) => ({
  middleware: [cors()],
  routes: [
    route("/ok", { GET: () => Response.json({ ok: true }) }),
  ],
}));
