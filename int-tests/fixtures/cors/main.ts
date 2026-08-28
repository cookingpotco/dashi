import { serve } from "dashi";
import { cors } from "dashi/cors";

export function start() {
  return serve(({ route }) => ({
    middleware: [cors({ origin: "https://app.example" })],
    routes: [route("/", { GET: () => Response.json({ ok: true }) })],
  }), { hostname: "127.0.0.1", port: 0 });
}
